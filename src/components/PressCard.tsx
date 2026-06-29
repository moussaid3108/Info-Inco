import { useState } from 'react';
import { Star, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { PressItem, AnalysisType } from '../types';
import { sources } from '../data/mockData';
import TypeBadge from './TypeBadge';
import SeverityDots from './SeverityDots';
import clsx from 'clsx';

interface Props {
  item: PressItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const borderColors: Record<AnalysisType, string> = {
  OMISSION: 'border-l-red-600',
  DIVERGENCE: 'border-l-amber-500',
  'INCOHÉRENCE': 'border-l-violet-600',
  SILENCE: 'border-l-gray-400',
};

const bgColors: Record<AnalysisType, string> = {
  OMISSION: 'bg-red-50',
  DIVERGENCE: 'bg-amber-50',
  'INCOHÉRENCE': 'bg-violet-50',
  SILENCE: 'bg-gray-50',
};

export default function PressCard({ item, isFavorite, onToggleFavorite }: Props) {
  const [expanded, setExpanded] = useState(false);

  const activeSources = sources.filter(s => item.sourceIds.includes(s.id));
  const silentSources = sources.filter(s => (item.silentSourceIds || []).includes(s.id));

  const daysAgo = Math.floor((Date.now() - new Date(item.date).getTime()) / 86400000);

  return (
    <article className={clsx(
      'bg-white rounded-2xl border-l-4 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md',
      borderColors[item.type]
    )}>
      {item.isPriority && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border-b border-red-100">
          <AlertTriangle size={13} className="text-red-600" />
          <span className="text-xs font-semibold text-red-700">Signalement prioritaire</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={item.type} />
            <span className="text-xs text-gray-400 font-medium">
              {daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? 'Il y a 1 jour' : `Il y a ${daysAgo} jours`}
            </span>
            <SeverityDots level={item.severity} />
          </div>
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={clsx(
              'p-1.5 rounded-full transition-all flex-shrink-0',
              isFavorite ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500'
            )}
          >
            <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {activeSources.map(s => (
            <span key={s.id} className="text-xs text-gray-500 font-medium">
              {s.flag} {s.name}
            </span>
          ))}
          {activeSources.length > 0 && item.silentSourceIds && item.silentSourceIds.length > 0 && (
            <span className="text-xs text-gray-300 mx-0.5">·</span>
          )}
        </div>

        <h2 className="font-bold text-gray-900 text-[15px] leading-snug mb-2">{item.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{item.summary}</p>

        {expanded && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-3">
              {item.detail}
            </p>

            {item.sourceQuotes && item.sourceQuotes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Citations directes</p>
                {item.sourceQuotes.map((q, i) => {
                  const src = sources.find(s => s.id === q.sourceId);
                  return (
                    <div key={i} className={clsx('rounded-xl p-3', bgColors[item.type])}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {src?.flag} {src?.name} {q.date && `— ${q.date}`}
                      </p>
                      <p className="text-sm text-gray-800 italic">{q.quote}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {silentSources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {item.type === 'SILENCE' ? 'Médias absents' : 'Sources silencieuses'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {silentSources.map(s => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full line-through"
                    >
                      {s.flag} {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catégorie</p>
              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                {item.category}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {expanded ? (
            <><ChevronUp size={14} /> Réduire</>
          ) : (
            <><ChevronDown size={14} /> Voir l'analyse complète</>
          )}
        </button>
      </div>
    </article>
  );
}
