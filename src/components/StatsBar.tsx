import { PressItem } from '../types';

interface Props { pressItems: PressItem[]; }

export default function StatsBar({ pressItems }: Props) {
  const counts = {
    OMISSION: pressItems.filter(i => i.type === 'OMISSION').length,
    DIVERGENCE: pressItems.filter(i => i.type === 'DIVERGENCE').length,
    INCOHÉRENCE: pressItems.filter(i => i.type === 'INCOHÉRENCE').length,
    SILENCE: pressItems.filter(i => i.type === 'SILENCE').length,
  };

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <div className="bg-red-50 border border-red-100 rounded-xl p-2.5 text-center">
        <p className="text-xl font-bold text-red-600">{counts.OMISSION}</p>
        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">Omissions</p>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">
        <p className="text-xl font-bold text-amber-600">{counts.DIVERGENCE}</p>
        <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Divergences</p>
      </div>
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-2.5 text-center">
        <p className="text-xl font-bold text-violet-600">{counts.INCOHÉRENCE}</p>
        <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide">Incohérences</p>
      </div>
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-center">
        <p className="text-xl font-bold text-gray-600">{counts.SILENCE}</p>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Silences</p>
      </div>
    </div>
  );
}
