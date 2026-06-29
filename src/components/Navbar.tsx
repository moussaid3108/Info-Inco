import { Menu, RefreshCw, Zap } from 'lucide-react';
import { Page } from '../types';
import NotificationBell from './NotificationBell';
import clsx from 'clsx';

interface Props {
  onMenuToggle: () => void;
  onAnalyze: () => void;
  onHome: () => void;
  isAnalyzing: boolean;
  currentPage: Page;
}

export default function Navbar({ onMenuToggle, onAnalyze, onHome, isAnalyzing }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Inco-Info</span>
        </button>

        <NotificationBell />

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            isAnalyzing
              ? 'bg-blue-100 text-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm'
          )}
        >
          <RefreshCw size={14} className={clsx(isAnalyzing && 'animate-spin')} />
          <span className="hidden sm:inline">{isAnalyzing ? 'Analyse…' : 'Analyser'}</span>
        </button>
      </div>
    </header>
  );
}
