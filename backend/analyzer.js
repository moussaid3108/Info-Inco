import OpenAI from 'openai';
import { getUnprocessedArticles, getRecentArticles, markProcessed } from './rss-fetcher.js';
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

const SYSTEM_PROMPT = `Tu es un analyste expert en biais médiatiques. Analyse les articles fournis et détecte :
- OMISSION : fait couvert par certaines sources, ignoré par d'autres
- DIVERGENCE : même sujet traité avec angles radicalement opposés
- INCOHÉRENCE : une source se contredit dans ses propres articles
- SILENCE : sujet important ignoré par la quasi-totalité des sources

Retourne UNIQUEMENT un tableau JSON valide (sans markdown) de 10 à 12 analyses couvrant les 4 types et plusieurs catégories.

Structure de chaque analyse :
{"type":"OMISSION"|"DIVERGENCE"|"INCOHÉRENCE"|"SILENCE","category":"Géopolitique"|"Économie"|"Société"|"Climat"|"Justice","title":"max 15 mots","summary":"2-3 phrases","detail":"4-5 phrases avec exemples précis","sourceIds":["id"],"silentSourceIds":["id"],"severity":1|2|3,"isPriority":true|false,"sourceQuotes":[{"sourceId":"id","quote":"citation"}]}`;

function hasAnalysisToday() {
  const today = new Date().toISOString().split('T')[0];
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM press_items WHERE date = ?`).get(today);
  return row.cnt > 0;
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

export async function analyzeArticles({ forceRefresh = false } = {}) {
  // Skip if already analyzed today (unless forced)
  if (!forceRefresh && hasAnalysisToday()) {
    console.log('[Analyzer] Already analyzed today — skipping API call');
    return [];
  }

  // Use unprocessed articles first, fall back to recent 48h
  let articles = getUnprocessedArticles(100);
  if (articles.length < 6) {
    articles = getRecentArticles(100);
  }

  if (articles.length < 6) {
    console.log('[Analyzer] Not enough articles to analyze');
    return [];
  }

  console.log(`[Analyzer] Sending ${articles.length} articles to GPT-4o-mini...`);

  const articleText = articles
    .map(a => `[${a.source_id}] ${a.title}${a.content ? '\n' + a.content.slice(0, 150) : ''}`)
    .join('\n---\n');

  const userMessage = `Sources: ${JSON.stringify(SOURCE_NAMES)}\n\nArticles:\n\n${articleText}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 6000,
    });

    const raw = response.choices[0].message.content.trim();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in GPT response');

    const analyses = JSON.parse(match[0]);
    const ids = insertAnalyses(analyses);
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
