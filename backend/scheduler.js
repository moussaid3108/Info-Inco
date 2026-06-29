import cron from 'node-cron';
import { fetchAllSources } from './rss-fetcher.js';
import { analyzeArticles } from './analyzer.js';

export function startScheduler() {
  // Every 6 hours: 00:00, 06:00, 12:00, 18:00
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Starting scheduled run...');
    await fetchAllSources();
    await analyzeArticles();
    console.log('[Scheduler] Scheduled run complete.');
  });

  console.log('[Scheduler] Running every 6 hours');
}

export async function runNow() {
  console.log('[Manual] Triggering manual analysis...');
  const { totalNew, results } = await fetchAllSources();
  const inserted = await analyzeArticles();
  return { articlesNew: totalNew, itemsGenerated: inserted.length, sources: results };
}
