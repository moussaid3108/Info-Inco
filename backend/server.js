import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPressItems, analyzeArticles } from './analyzer.js';
import db from './database.js';
import { startScheduler, runNow } from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// --- API ---

app.get('/api/press-items', (_req, res) => {
  try {
    const items = getPressItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    // forceRefresh=true uniquement si explicitement demandé (admin)
    const forceRefresh = req.body?.forceRefresh === true;
    const result = await runNow({ forceRefresh });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nettoie les anciennes entrées et force une nouvelle analyse
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
    const rows = db.prepare(`
      SELECT source_id, COUNT(*) as count
      FROM raw_articles
      GROUP BY source_id
    `).all();
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
    res.json({
      status: 'ok',
      hasData: items.length > 0,
      lastDate: items[0]?.date || null,
    });
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
