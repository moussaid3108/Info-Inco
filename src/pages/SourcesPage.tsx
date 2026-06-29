import { useEffect, useState } from 'react';
import { sources } from '../data/mockData';
import { PressItem } from '../types';
import { fetchSourceCounts } from '../api';
import clsx from 'clsx';

const biasColors: Record<string, string> = {
  'Centre-gauche': 'bg-blue-100 text-blue-700',
  'Centre-droite libéral': 'bg-orange-100 text-orange-700',
  'Centre-droite': 'bg-orange-100 text-orange-700',
  'Gauche': 'bg-red-100 text-red-700',
  'Centre': 'bg-gray-100 text-gray-700',
  'Centre / Agence': 'bg-gray-100 text-gray-700',
  'Centre (Sud global)': 'bg-yellow-100 text-yellow-700',
  'Centre / Public': 'bg-gray-100 text-gray-700',
  'Anti-impérialiste': 'bg-purple-100 text-purple-700',
};

function getBiasScore(sourceId: string, pressItems: PressItem[]): number {
  let score = 0;
  for (const item of pressItems) {
    // Silencieux sur un sujet = +3 points
    if ((item.silentSourceIds || []).includes(sourceId)) score += 3;
    // Impliqué dans une OMISSION = +2 points
    if (item.type === 'OMISSION' && item.sourceIds.includes(sourceId)) score += 2;
    // Impliqué dans une INCOHÉRENCE = +2 points
    if (item.type === 'INCOHÉRENCE' && item.sourceIds.includes(sourceId)) score += 2;
  }
  return score;
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  if (max === 0) return null;
  const pct = Math.round((score / max) * 100);
  const color = pct > 66 ? 'bg-red-500' : pct > 33 ? 'bg-amber-400' : 'bg-green-400';
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={clsx('text-[10px] font-bold', pct > 66 ? 'text-red-600' : pct > 33 ? 'text-amber-500' : 'text-green-600')}>
        {score} pts
      </span>
    </div>
  );
}

interface Props {
  pressItems: PressItem[];
}

export default function SourcesPage({ pressItems }: Props) {
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'biais' | 'articles'>('biais');

  useEffect(() => {
    fetchSourceCounts().then(setArticleCounts);
  }, []);

  const sourcesWithStats = sources.map(s => {
    const active = pressItems.filter(i => i.sourceIds.includes(s.id)).length;
    const silent = pressItems.filter(i => (i.silentSourceIds || []).includes(s.id)).length;
    const count = articleCounts[s.id] ?? 0;
    const biasScore = getBiasScore(s.id, pressItems);
    return { ...s, active, silent, articleCount: count, biasScore };
  });

  const maxScore = Math.max(...sourcesWithStats.map(s => s.biasScore), 1);

  const sorted = [...sourcesWithStats].sort((a, b) =>
    sortBy === 'biais'
      ? b.biasScore - a.biasScore
      : b.articleCount - a.articleCount
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Sources</h1>
        <p className="text-sm text-gray-500 mt-0.5">{sources.length} médias dans le corpus d&apos;analyse</p>
      </div>

      {/* Tri */}
      <div className="flex gap-2 mb-4">
        {(['biais', 'articles'] as const).map(opt => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              sortBy === opt ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'
            )}
          >
            {opt === 'biais' ? '⚡ Score de biais' : '📄 Nb articles'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
            {sortBy === 'biais' && (
              <div className="flex-shrink-0 w-6 text-center mt-0.5">
                <span className={clsx('text-xs font-bold', i === 0 ? 'text-red-600' : i === 1 ? 'text-amber-500' : i === 2 ? 'text-amber-400' : 'text-gray-400')}>
                  #{i + 1}
                </span>
              </div>
            )}
            <div className="text-2xl flex-shrink-0">{s.flag}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', biasColors[s.bias] || 'bg-gray-100 text-gray-600')}>
                  {s.bias}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{s.country}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">{s.articleCount} articles</span>
                {s.active > 0 && <span className="text-xs text-blue-600 font-medium">{s.active} analyses</span>}
                {s.silent > 0 && <span className="text-xs text-red-500 font-medium">{s.silent}× silencieux</span>}
              </div>
              <ScoreBar score={s.biasScore} max={maxScore} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 pb-2">
        Score calculé sur les silences, omissions et incohérences détectés
      </p>
    </div>
  );
}
