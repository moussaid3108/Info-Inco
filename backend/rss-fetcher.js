import Parser from 'rss-parser';
import db from './database.js';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IncoInfo/1.0; +https://inco-info.fr)' },
});

export const RSS_SOURCES = [
  // Presse française
  { id: 'lemonde',     name: 'Le Monde',        url: 'https://www.lemonde.fr/rss/une.xml' },
  { id: 'lefigaro',   name: 'Le Figaro',        url: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
  { id: 'liberation', name: 'Libération',       url: 'https://www.liberation.fr/arc/outboundfeeds/rss/' },
  { id: 'france24',   name: 'France 24',        url: 'https://www.france24.com/fr/rss' },
  { id: 'rfi',        name: 'RFI',              url: 'https://www.rfi.fr/fr/rss' },
  { id: 'mediapart',  name: 'Mediapart',        url: 'https://www.mediapart.fr/articles/feed' },
  // Presse anglophone
  { id: 'bbc',        name: 'BBC News',         url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'guardian',   name: 'The Guardian',     url: 'https://www.theguardian.com/world/rss' },
  { id: 'nyt',        name: 'New York Times',   url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { id: 'foxnews',    name: 'Fox News',         url: 'https://feeds.foxnews.com/foxnews/world' },
  { id: 'ft',         name: 'Financial Times',  url: 'https://www.ft.com/rss/home/uk' },
  { id: 'reuters',    name: 'Reuters',          url: 'https://feeds.reuters.com/reuters/worldNews' },
  // Presse internationale
  { id: 'aljazeera',  name: 'Al Jazeera',      url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'dw',         name: 'Deutsche Welle',   url: 'https://rss.dw.com/rdf/rss-en-all' },
  { id: 'haaretz',    name: 'Haaretz',          url: 'https://www.haaretz.com/srv/haaretz-feed-world-news.rss' },
  { id: 'radiocanada',name: 'Radio-Canada',     url: 'https://ici.radio-canada.ca/rss/4201' },
];

function fingerprint(sourceId, title) {
  return crypto.createHash('md5').update(`${sourceId}::${title}`).digest('hex');
}

export async function fetchAllSources() {
  let totalNew = 0;
  const results = [];

  for (const source of RSS_SOURCES) {
    try {
      console.log(`[RSS] Fetching ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).slice(0, 25);

      const insert = db.prepare(`
        INSERT OR IGNORE INTO raw_articles (id, source_id, title, link, content, pub_date, fingerprint)
        VALUES (@id, @source_id, @title, @link, @content, @pub_date, @fingerprint)
      `);

      let newCount = 0;
      for (const item of items) {
        const fp = fingerprint(source.id, item.title || '');
        const info = insert.run({
          id: fp,
          source_id: source.id,
          title: (item.title || '').slice(0, 500),
          link: item.link || '',
          content: (item.contentSnippet || item.summary || '').slice(0, 800),
          pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
          fingerprint: fp,
        });
        if (info.changes > 0) newCount++;
      }

      totalNew += newCount;
      results.push({ source: source.name, new: newCount });
      console.log(`[RSS] ${source.name}: ${newCount} new articles`);
    } catch (err) {
      console.error(`[RSS] Error fetching ${source.name}:`, err.message);
      results.push({ source: source.name, error: err.message });
    }
  }

  return { totalNew, results };
}

export function getUnprocessedArticles(limit = 80) {
  return db.prepare(`
    SELECT * FROM raw_articles
    WHERE processed = 0
    ORDER BY pub_date DESC
    LIMIT ?
  `).all(limit);
}

export function markProcessed(ids) {
  if (!ids.length) return;
  const ph = ids.map(() => '?').join(',');
  db.prepare(`UPDATE raw_articles SET processed = 1 WHERE id IN (${ph})`).run(...ids);
}
