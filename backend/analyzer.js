import OpenAI from 'openai';
import { getUnprocessedArticles, markProcessed } from './rss-fetcher.js';
import db from './database.js';
import { randomUUID } from 'crypto';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const SOURCE_NAMES = {
  lemonde: 'Le Monde', lefigaro: 'Le Figaro', liberation: 'Libération',
  bbc: 'BBC News', aljazeera: 'Al Jazeera', reuters: 'Reuters',
  cnbc: 'CNBC', radiocanada: 'Radio-Canada', ft: 'Financial Times',
};

const SYSTEM_PROMPT = `Tu es un analyste critique expert en biais médiatiques et en analyse comparative de la presse internationale.

On te fournit une liste d'articles récents de différentes sources médiatiques. Ton rôle est de détecter :

- OMISSION : un fait couvert par certaines sources et ignoré par d'autres
- DIVERGENCE : des sources traitant le même sujet avec des angles ou conclusions radicalement opposés
- INCOHÉRENCE : une même source qui se contredit dans ses propres articles
- SILENCE : un sujet important ignoré par la quasi-totalité des sources

Retourne UNIQUEMENT un tableau JSON valide (sans markdown, sans texte autour) contenant entre 3 et 6 analyses.

Chaque analyse doit respecter cette structure exacte :
{
  "type": "OMISSION" | "DIVERGENCE" | "INCOHÉRENCE" | "SILENCE",
  "category": "Géopolitique" | "Économie" | "Société" | "Climat" | "Justice",
  "title": "Titre court et percutant (max 15 mots)",
  "summary": "Résumé en 2-3 phrases expliquant le problème détecté",
  "detail": "Analyse approfondie en 4-6 phrases avec exemples précis tirés des articles",
  "sourceIds": ["id_source1", "id_source2"],
  "silentSourceIds": ["id_source3"],
  "severity": 1 | 2 | 3,
  "isPriority": true | false,
  "sourceQuotes": [
    { "sourceId": "id_source1", "quote": "Citation ou paraphrase précise de l'article" }
  ]
}`;

export async function analyzeArticles() {
  const articles = getUnprocessedArticles(80);

  if (articles.length < 6) {
    console.log('[Analyzer] Not enough articles to analyze');
    return [];
  }

  console.log(`[Analyzer] Analyzing ${articles.length} articles with DeepSeek...`);

  const articleText = articles
    .map(a => `[${a.source_id}] ${a.title}${a.content ? '\n' + a.content.slice(0, 300) : ''}`)
    .join('\n---\n');

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Sources disponibles: ${JSON.stringify(SOURCE_NAMES)}\n\nArticles du corpus:\n\n${articleText}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 4096,
    });

    const raw = response.choices[0].message.content.trim();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in DeepSeek response');

    const analyses = JSON.parse(match[0]);
    const today = new Date().toISOString().split('T')[0];

    const insert = db.prepare(`
      INSERT OR IGNORE INTO press_items
        (id, type, category, title, summary, detail, source_ids, silent_source_ids, severity, is_priority, date, source_quotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const ids = [];
    for (const a of analyses) {
      const id = randomUUID();
      insert.run(
        id, a.type, a.category, a.title, a.summary, a.detail,
        JSON.stringify(a.sourceIds || []),
        JSON.stringify(a.silentSourceIds || []),
        a.severity || 1,
        a.isPriority ? 1 : 0,
        today,
        JSON.stringify(a.sourceQuotes || [])
      );
      ids.push(id);
    }

    markProcessed(articles.map(a => a.id));
    console.log(`[Analyzer] Inserted ${ids.length} press items`);
    return ids;
  } catch (err) {
    console.error('[Analyzer] Error:', err.message);
    return [];
  }
}

export function getPressItems(limit = 100) {
  return db.prepare(`
    SELECT * FROM press_items
    ORDER BY is_priority DESC, severity DESC, date DESC
    LIMIT ?
  `).all(limit).map(row => ({
    id: row.id,
    type: row.type,
    category: row.category,
    title: row.title,
    summary: row.summary,
    detail: row.detail,
    sourceIds: JSON.parse(row.source_ids || '[]'),
    silentSourceIds: JSON.parse(row.silent_source_ids || '[]'),
    severity: row.severity,
    isPriority: row.is_priority === 1,
    date: row.date,
    sourceQuotes: JSON.parse(row.source_quotes || '[]'),
  }));
}
