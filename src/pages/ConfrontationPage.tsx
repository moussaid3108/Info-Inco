import { useState } from 'react';
import { sources } from '../data/mockData';
import { PressItem, AnalysisType } from '../types';
import TypeBadge from '../components/TypeBadge';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  pressItems: PressItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const typeColors: Record<AnalysisType, string> = {
  OMISSION: 'border-red-200 bg-red-50',
  DIVERGENCE: 'border-amber-200 bg-amber-50',
  'INCOHÉRENCE': 'border-violet-200 bg-violet-50',
  SILENCE: 'border-gray-200 bg-gray-50',
};

const sourceColors: Record<string, string> = {
  lemonde: 'bg-blue-100 text-blue-800',
  lefigaro: 'bg-orange-100 text-orange-800',
  liberation: 'bg-pink-100 text-pink-800',
  bbc: 'bg-red-100 text-red-800',
  guardian: 'bg-teal-100 text-teal-800',
  nyt: 'bg-gray-100 text-gray-800',
  foxnews: 'bg-blue-100 text-blue-900',
  ft: 'bg-rose-100 text-rose-800',
  reuters: 'bg-orange-100 text-orange-900',
  aljazeera: 'bg-yellow-100 text-yellow-800',
  dw: 'bg-indigo-100 text-indigo-800',
  haaretz: 'bg-purple-100 text-purple-800',
  france24: 'bg-blue-100 text-blue-700',
  rfi: 'bg-sky-100 text-sky-800',
  mediapart: 'bg-green-100 text-green-800',
  radiocanada: 'bg-red-100 text-red-700',
};

function ConfrontationCard({ item, isFavorite, onToggleFavorite }: {
  item: PressItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const activeSources = sources.filter(s => item.sourceIds.includes(s.id));
  const silentSources = sources.filter(s => (item.silentSourceIds || []).includes(s.id));

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-2 mb-2">
          <TypeBadge type={item.type} />
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={clsx('p-1.5 flex-shrink-0 rounded-full', isFavorite ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500')}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1">{item.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{item.summary}</p>
      </div>

      {/* Sources actives vs silencieuses */}
      <div className="px-4 py-3 flex gap-3 flex-wrap">
        {activeSources.map(s => (
          <span key={s.id} className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', sourceColors[s.id] || 'bg-gray-100 text-gray-700')}>
            {s.flag} {s.name}
          </span>
        ))}
        {silentSources.map(s => (
          <span key={s.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 line-through">
            {s.flag} {s.name}
          </span>
        ))}
      </div>

      {/* Citations / analyse détaillée */}
      {((item.sourceQuotes && item.sourceQuotes.length > 0) || item.detail) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 pb-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {expanded ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les positions</>}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
              {/* Analyse détaillée */}
              {item.detail && (
                <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-3">
                  {item.detail}
                </p>
              )}

              {/* Citations par source */}
              {item.sourceQuotes && item.sourceQuotes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Positions des sources</p>
                  {item.sourceQuotes.map((q, i) => {
                    const src = sources.find(s => s.id === q.sourceId);
                    return (
                      <div key={i} className={clsx('rounded-xl border p-3', typeColors[item.type])}>
                        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-md', sourceColors[q.sourceId] || 'bg-gray-100 text-gray-700')}>
                          {src?.flag} {src?.name || q.sourceId}
                        </span>
                        <p className="mt-2 text-sm text-gray-800 italic leading-relaxed">{q.quote}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const typeFilters: { value: AnalysisType | 'Tous'; label: string }[] = [
  { value: 'Tous', label: 'Tous' },
  { value: 'DIVERGENCE', label: 'Divergences' },
  { value: 'OMISSION', label: 'Omissions' },
  { value: 'SILENCE', label: 'Silences' },
  { value: 'INCOHÉRENCE', label: 'Incohérences' },
];

export default function ConfrontationPage({ pressItems, favorites, onToggleFavorite }: Props) {
  const [typeFilter, setTypeFilter] = useState<AnalysisType | 'Tous'>('Tous');

  // Toutes les analyses avec au moins 2 sources ou des silences
  const confrontable = pressItems.filter(i =>
    i.sourceIds.length >= 1 || (i.silentSourceIds && i.silentSourceIds.length > 0)
  );

  const filtered = confrontable.filter(i =>
    typeFilter === 'Tous' || i.type === typeFilter
  );

  // DIVERGENCE en premier, puis par sévérité
  const sorted = [...filtered].sort((a, b) => {
    if (a.type === 'DIVERGENCE' && b.type !== 'DIVERGENCE') return -1;
    if (a.type !== 'DIVERGENCE' && b.type === 'DIVERGENCE') return 1;
    return b.severity - a.severity;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Confrontation</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Positions des médias sur chaque sujet — qui parle, qui se tait.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value as AnalysisType | 'Tous')}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              typeFilter === f.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map(item => (
          <ConfrontationCard
            key={item.id}
            item={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-semibold">Aucune confrontation</p>
            <p className="text-sm mt-1">Lance une analyse pour alimenter cette page.</p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        {sorted.length} confrontation{sorted.length !== 1 ? 's' : ''} disponible{sorted.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
