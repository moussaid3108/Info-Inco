import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPressItems } from './analyzer.js';
import db from './database.js';
import { startScheduler, runNow } from './scheduler.js';
import { vapidPublicKey } from './vapid.js';
import { sendPushToAll } from './push.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API ---

app.get('/api/press-items', (req, res) => {
  try {
    const date = req.query.date;
    res.json(getPressItems(100, date || null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dates', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT DISTINCT date FROM press_items ORDER BY date DESC LIMIT 7
    `).all();
    res.json(rows.map(r => r.date));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const forceRefresh = req.body?.forceRefresh === true;
    const result = await runNow({ forceRefresh });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/refresh', async (_req, res) => {
  try {
    db.prepare(`DELETE FROM press_items WHERE date < date('now', '-7 days')`).run();
    const result = await runNow({ forceRefresh: true });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sources', (_req, res) => {
  try {
    const rows = db.prepare(`SELECT source_id, COUNT(*) as count FROM raw_articles GROUP BY source_id`).all();
    const counts = {};
    rows.forEach(r => { counts[r.source_id] = r.count; });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (_req, res) => {
  try {
    const items = getPressItems(1);
    res.json({ status: 'ok', hasData: items.length > 0, lastDate: items[0]?.date || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Push Notifications ---

app.get('/api/vapid-key', (_req, res) => {
  res.json({ publicKey: vapidPublicKey });
});

app.post('/api/subscribe', (req, res) => {
  try {
    const sub = req.body;
    if (!sub?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    db.prepare(`
      INSERT OR REPLACE INTO push_subscriptions (endpoint, subscription)
      VALUES (?, ?)
    `).run(sub.endpoint, JSON.stringify(sub));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subscribe', (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).run(endpoint);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  startScheduler();
  const items = getPressItems(1);
  if (items.length === 0 && process.env.OPENAI_API_KEY) {
    console.log('[Server] No data yet — launching initial analysis...');
    runNow({ forceRefresh: true }).catch(console.error);
  }
});
