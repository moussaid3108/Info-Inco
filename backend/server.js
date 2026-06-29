import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPressItems } from './analyzer.js';
import { startScheduler, runNow } from './scheduler.js';
import { resetAllProcessed } from './rss-fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve built React app
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

app.post('/api/analyze', async (_req, res) => {
  try {
    // Reset processed flag so all recent articles are re-analyzed fresh
    resetAllProcessed();
    const result = await runNow();
    res.json({ success: true, ...result });
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

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  startScheduler();
  // First run if DB is empty
  const items = getPressItems(1);
  if (items.length === 0 && process.env.OPENAI_API_KEY) {
    console.log('[Server] No data yet — launching initial analysis...');
    runNow().catch(console.error);
  }
});
