import { useState } from 'react';
import { pressItems } from '../data/mockData';
import PressCard from '../components/PressCard';
import StatsBar from '../components/StatsBar';
import { AnalysisType, Category } from '../types';
import clsx from 'clsx';

const typeFilters: { value: AnalysisType | 'Tous'; label: string }[] = [
  { value: 'Tous', label: 'Tous' },
  { value: 'OMISSION', label: 'Omissions' },
  { value: 'DIVERGENCE', label: 'Divergences' },
  { value: 'INCOHÉRENCE', label: 'Incohérences' },
  { value: 'SILENCE', label: 'Silences' },
];

const categoryFilters: { value: Category | 'Tous'; label: string }[] = [
  { value: 'Tous', label: 'Tous' },
  { value: 'Géopolitique', label: 'Géopolitique' },
  { value: 'Économie', label: 'Économie' },
  { value: 'Société', label: 'Société' },
  { value: 'Climat', label: 'Climat' },
  { value: 'Justice', label: 'Justice' },
];

interface Props {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function RevuePage({ favorites, onToggleFavorite }: Props) {
  const [typeFilter, setTypeFilter] = useState<AnalysisType | 'Tous'>('Tous');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'Tous'>('Tous');

  const filtered = pressItems.filter(item => {
    const typeOk = typeFilter === 'Tous' || item.type === typeFilter;
    const catOk = categoryFilter === 'Tous' || item.category === categoryFilter;
    return typeOk && catOk;
  });

  const priorityFirst = [...filtered].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.severity - a.severity;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <StatsBar />

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-3">
        <div className="flex gap-2 w-max">
          {typeFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value as AnalysisType | 'Tous')}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border',
                typeFilter === f.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {categoryFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value as Category | 'Tous')}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border',
                categoryFilter === f.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {priorityFirst.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold">Aucun résultat</p>
          <p className="text-sm mt-1">Modifiez vos filtres pour voir plus d'analyses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {priorityFirst.map(item => (
            <PressCard
              key={item.id}
              item={item}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        Analyse du 6 juin 2026 · {pressItems.length} items dans le corpus
      </p>
    </div>
  );
}
