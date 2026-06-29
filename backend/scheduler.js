import cron from 'node-cron';
import { fetchAllSources, resetAllProcessed } from './rss-fetcher.js';
import { analyzeArticles } from './analyzer.js';

export function startScheduler() {
  // Chaque jour à minuit : reset + fetch + analyse
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Starting daily run...');
    resetAllProcessed();
    await fetchAllSources();
    await analyzeArticles({ forceRefresh: true });
    console.log('[Scheduler] Daily run complete.');
  });

  console.log('[Scheduler] Running once a day at midnight');
}

export async function runNow({ forceRefresh = false } = {}) {
  console.log('[Manual] Triggering manual analysis...');
  const { totalNew, results } = await fetchAllSources();
  const inserted = await analyzeArticles({ forceRefresh });
  return { articlesNew: totalNew, itemsGenerated: inserted.length, sources: results };
}
