import { sources, pressItems } from '../data/mockData';
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

export default function SourcesPage() {
  const sourcesWithStats = sources.map(s => {
    const active = pressItems.filter(i => i.sourceIds.includes(s.id)).length;
    const silent = pressItems.filter(i => (i.silentSourceIds || []).includes(s.id)).length;
    return { ...s, active, silent };
  }).sort((a, b) => (b.active + b.articleCount) - (a.active + a.articleCount));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Sources</h1>
        <p className="text-sm text-gray-500 mt-0.5">{sources.length} médias dans le corpus d&apos;analyse</p>
      </div>

      <div className="space-y-2">
        {sourcesWithStats.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-2xl">{s.flag}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', biasColors[s.bias] || 'bg-gray-100 text-gray-600')}>
                  {s.bias}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{s.country}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-600 font-medium">{s.articleCount} articles</span>
                {s.active > 0 && (
                  <span className="text-xs text-blue-600 font-medium">{s.active} analyses</span>
                )}
                {s.silent > 0 && (
                  <span className="text-xs text-red-500 font-medium">{s.silent}× silencieux</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-gray-900">{s.articleCount}</div>
              <div className="text-[10px] text-gray-400">articles</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
