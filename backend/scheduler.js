import cron from 'node-cron';
import { fetchAllSources } from './rss-fetcher.js';
import { analyzeArticles } from './analyzer.js';

export function startScheduler() {
  // Every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Starting daily run...');
    await fetchAllSources();
    await analyzeArticles();
    console.log('[Scheduler] Daily run complete.');
  });

  console.log('[Scheduler] Running once a day at midnight');
}

export async function runNow() {
  console.log('[Manual] Triggering manual analysis...');
  const { totalNew, results } = await fetchAllSources();
  const inserted = await analyzeArticles();
  return { articlesNew: totalNew, itemsGenerated: inserted.length, sources: results };
}
