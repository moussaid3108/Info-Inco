import { useState } from 'react';
import { pressItems, sources } from '../data/mockData';
import { PressItem, AnalysisType } from '../types';
import TypeBadge from '../components/TypeBadge';
import { Star, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const borderColors: Record<AnalysisType, string> = {
  OMISSION: 'border-red-200 bg-red-50',
  DIVERGENCE: 'border-amber-200 bg-amber-50',
  'INCOHÉRENCE': 'border-violet-200 bg-violet-50',
  SILENCE: 'border-gray-200 bg-gray-50',
};

const tagColors: Record<string, string> = {
  lemonde: 'bg-blue-100 text-blue-800',
  lefigaro: 'bg-orange-100 text-orange-800',
  liberation: 'bg-pink-100 text-pink-800',
  cnbc: 'bg-green-100 text-green-800',
  bbc: 'bg-red-100 text-red-800',
  aljazeera: 'bg-yellow-100 text-yellow-800',
  reuters: 'bg-orange-100 text-orange-800',
  ft: 'bg-rose-100 text-rose-800',
  cnn: 'bg-red-100 text-red-800',
  thecradle: 'bg-purple-100 text-purple-800',
  radiocanada: 'bg-red-100 text-red-800',
  nyt: 'bg-gray-100 text-gray-800',
};

function ConfrontationCard({ item, isFavorite, onToggleFavorite }: {
  item: PressItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const activeSources = sources.filter(s => item.sourceIds.includes(s.id));
  const silentSources = sources.filter(s => (item.silentSourceIds || []).includes(s.id));

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <TypeBadge type={item.type} />
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{item.title}</h3>
          </div>
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={clsx('p-1.5 flex-shrink-0', isFavorite ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500')}
          >
            <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {item.sourceQuotes && item.sourceQuotes.length > 0 && (
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Comparer les positions
          </p>
          {item.sourceQuotes.map((q, i) => {
            const src = sources.find(s => s.id === q.sourceId);
            const isSelected = selected === String(i);
            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : String(i))}
                className={clsx(
                  'w-full text-left rounded-xl border p-3 transition-all',
                  isSelected
                    ? `${borderColors[item.type]} border-2`
                    : 'border-gray-100 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-md', tagColors[q.sourceId] || 'bg-gray-100 text-gray-700')}>
                    {src?.flag} {src?.name}
                  </span>
                  <ChevronRight size={14} className={clsx('text-gray-400 transition-transform', isSelected && 'rotate-90')} />
                </div>
                {isSelected ? (
                  <p className="mt-2 text-sm text-gray-800 italic leading-relaxed">{q.quote}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-500 truncate">{q.quote}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {(activeSources.length > 0 || silentSources.length > 0) && (
        <div className="px-4 pb-4 space-y-3">
          {activeSources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sources actives</p>
              <div className="flex flex-wrap gap-1.5">
                {activeSources.map(s => (
                  <span key={s.id} className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', tagColors[s.id] || 'bg-gray-100 text-gray-700')}>
                    {s.flag} {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {silentSources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sources silencieuses</p>
              <div className="flex flex-wrap gap-1.5">
                {silentSources.map(s => (
                  <span key={s.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 line-through">
                    {s.flag} {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConfrontationPage({ favorites, onToggleFavorite }: Props) {
  const withContent = pressItems.filter(i =>
    (i.sourceQuotes && i.sourceQuotes.length > 0) || (i.silentSourceIds && i.silentSourceIds.length > 0)
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Confrontation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Comparez directement les positions de chaque source sur un même sujet.</p>
      </div>
      <div className="space-y-3">
        {withContent.map(item => (
          <ConfrontationCard
            key={item.id}
            item={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
