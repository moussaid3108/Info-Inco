import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PressCard from '../components/PressCard';
import StatsBar from '../components/StatsBar';
import { AnalysisType, Category, PressItem } from '../types';
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
  { value: 'Guerre', label: '⚔️ Guerre' },
  { value: 'Économie', label: 'Économie' },
  { value: 'Géopolitique', label: 'Géopolitique' },
  { value: 'Société', label: 'Société' },
  { value: 'Climat', label: 'Climat' },
  { value: 'Justice', label: 'Justice' },
];

interface Props {
  pressItems: PressItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

function formatDate(dateStr: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === yesterday) return 'Hier';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function RevuePage({ pressItems, favorites, onToggleFavorite, availableDates, selectedDate, onSelectDate }: Props) {
  const [typeFilter, setTypeFilter] = useState<AnalysisType | 'Tous'>('Tous');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'Tous'>('Tous');

  const filtered = pressItems.filter(item => {
    const typeOk = typeFilter === 'Tous' || item.type === typeFilter;
    const catOk = categoryFilter === 'Tous' || item.category === categoryFilter;
    return typeOk && catOk;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.severity - a.severity;
  });

  const currentIdx = selectedDate ? availableDates.indexOf(selectedDate) : -1;
  const canPrev = currentIdx < availableDates.length - 1;
  const canNext = currentIdx > 0 || selectedDate !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <StatsBar pressItems={pressItems} />

      {/* Sélecteur de date */}
      {availableDates.length > 1 && (
        <div className="flex items-center justify-between mb-3 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2">
          <button
            onClick={() => onSelectDate(canPrev ? availableDates[currentIdx + 1] : null)}
            disabled={!canPrev}
            className="p-1 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {availableDates.map(d => (
              <button
                key={d}
                onClick={() => onSelectDate(d === selectedDate ? null : d)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                  (selectedDate === d || (!selectedDate && d === availableDates[0]))
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                {formatDate(d)}
              </button>
            ))}
          </div>

          <button
            onClick={() => onSelectDate(canNext ? (currentIdx > 0 ? availableDates[currentIdx - 1] : null) : null)}
            disabled={!canNext}
            className="p-1 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Filtres type */}
      <div className="flex flex-wrap gap-2 mb-3">
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

      {/* Filtres catégorie */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold">Aucun résultat</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou lancez une analyse.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(item => (
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
        {pressItems.length} analyse{pressItems.length !== 1 ? 's' : ''} dans le corpus
      </p>
    </div>
  );
}
