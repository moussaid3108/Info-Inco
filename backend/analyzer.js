import OpenAI from 'openai';
import { getUnprocessedArticles, getRecentArticles } from './rss-fetcher.js';
import db from './database.js';
import { randomUUID } from 'crypto';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SOURCE_NAMES = {
  lemonde: 'Le Monde', lefigaro: 'Le Figaro', liberation: 'Libération',
  bbc: 'BBC News', guardian: 'The Guardian', nyt: 'New York Times',
  foxnews: 'Fox News', ft: 'Financial Times', reuters: 'Reuters',
  aljazeera: 'Al Jazeera', dw: 'Deutsche Welle', haaretz: 'Haaretz',
  france24: 'France 24', rfi: 'RFI', mediapart: 'Mediapart',
  radiocanada: 'Radio-Canada',
};

const BASE_SCHEMA = `Chaque analyse doit respecter cette structure exacte :
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

const PROMPT_OMISSION_DIVERGENCE = `Tu es un analyste critique expert en biais médiatiques et en analyse comparative de la presse internationale.

On te fournit une liste d'articles récents de différentes sources médiatiques. Ton rôle est de détecter uniquement :

- OMISSION : un fait couvert par certaines sources et délibérément ignoré par d'autres
- DIVERGENCE : des sources traitant le même sujet avec des angles ou conclusions radicalement opposés

Retourne UNIQUEMENT un tableau JSON valide (sans markdown, sans texte autour) contenant entre 6 et 8 analyses de type OMISSION ou DIVERGENCE.
Sois exhaustif : cherche des cas dans des domaines variés (géopolitique, économie, société, climat, justice).

${BASE_SCHEMA}`;

const PROMPT_INCOHERENCE_SILENCE = `Tu es un analyste critique expert en biais médiatiques et en analyse comparative de la presse internationale.

On te fournit une liste d'articles récents de différentes sources médiatiques. Ton rôle est de détecter uniquement :

- INCOHÉRENCE : une même source qui se contredit dans ses propres articles sur une même période
- SILENCE : un sujet important (économique, social, géopolitique, climatique) ignoré par la quasi-totalité des sources francophones ou anglophones

Retourne UNIQUEMENT un tableau JSON valide (sans markdown, sans texte autour) contenant entre 4 et 6 analyses de type INCOHÉRENCE ou SILENCE.
Pour SILENCE, cherche des sujets couverts par seulement 1-2 sources sur 16 disponibles.

${BASE_SCHEMA}`;

function buildUserMessage(articles) {
  const articleText = articles
    .map(a => `[${a.source_id}] ${a.title}${a.content ? '\n' + a.content.slice(0, 300) : ''}`)
    .join('\n---\n');
  return `Sources disponibles: ${JSON.stringify(SOURCE_NAMES)}\n\nArticles du corpus:\n\n${articleText}`;
}

async function callGPT(systemPrompt, userMessage) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  });

  const raw = response.choices[0].message.content.trim();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in GPT response');
  return JSON.parse(match[0]);
}

function insertAnalyses(analyses) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO press_items
      (id, type, category, title, summary, detail, source_ids, silent_source_ids, severity, is_priority, date, source_quotes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().split('T')[0];
  const ids = [];
  for (const a of analyses) {
    if (!a.type || !a.title) continue;
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
  return ids;
}

export async function analyzeArticles() {
  // Use unprocessed first, fall back to recent articles from last 48h
  let articles = getUnprocessedArticles(120);
  if (articles.length < 6) {
    articles = getRecentArticles(120);
  }

  if (articles.length < 6) {
    console.log('[Analyzer] Not enough articles to analyze');
    return [];
  }

  console.log(`[Analyzer] Analyzing ${articles.length} articles with GPT-4o-mini (2 parallel calls)...`);

  const userMessage = buildUserMessage(articles);

  try {
    // Run both analysis types in parallel
    const [omDiv, incoSil] = await Promise.all([
      callGPT(PROMPT_OMISSION_DIVERGENCE, userMessage).catch(err => {
        console.error('[Analyzer] OMISSION/DIVERGENCE call failed:', err.message);
        return [];
      }),
      callGPT(PROMPT_INCOHERENCE_SILENCE, userMessage).catch(err => {
        console.error('[Analyzer] INCOHÉRENCE/SILENCE call failed:', err.message);
        return [];
      }),
    ]);

    const allAnalyses = [...omDiv, ...incoSil];
    const ids = insertAnalyses(allAnalyses);

    console.log(`[Analyzer] Inserted ${ids.length} press items (${omDiv.length} OMISSION/DIVERGENCE + ${incoSil.length} INCOHÉRENCE/SILENCE)`);
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
