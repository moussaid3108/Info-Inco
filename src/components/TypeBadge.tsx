import { AnalysisType } from '../types';
import clsx from 'clsx';

interface Props {
  type: AnalysisType;
  size?: 'sm' | 'md';
}

const config: Record<AnalysisType, { label: string; className: string }> = {
  OMISSION: { label: 'OMISSION', className: 'bg-red-600 text-white' },
  DIVERGENCE: { label: 'DIVERGENCE', className: 'bg-amber-500 text-white' },
  'INCOHÉRENCE': { label: 'INCOHÉRENCE', className: 'bg-violet-600 text-white' },
  SILENCE: { label: 'SILENCE', className: 'bg-gray-500 text-white' },
};

export default function TypeBadge({ type, size = 'md' }: Props) {
  const { label, className } = config[type];
  return (
    <span className={clsx(
      'inline-flex items-center font-bold tracking-wide rounded-full uppercase',
      className,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {label}
    </span>
  );
}
