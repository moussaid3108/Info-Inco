import { X, Newspaper, Archive, Swords, Star, Tag, Info } from 'lucide-react';
import { Page } from '../types';
import clsx from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (p: Page) => void;
  currentPage: Page;
  favoritesCount: number;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'revue', label: 'Revue de presse', icon: <Newspaper size={20} /> },
  { page: 'confrontation', label: 'Confrontation', icon: <Swords size={20} /> },
  { page: 'sources', label: 'Sources', icon: <Archive size={20} /> },
  { page: 'favoris', label: 'Favoris', icon: <Star size={20} /> },
  { page: 'sujets', label: 'Sujets', icon: <Tag size={20} /> },
  { page: 'apropos', label: 'À propos / Contact', icon: <Info size={20} /> },
];

export default function Sidebar({ open, onClose, onNavigate, currentPage, favoritesCount }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">II</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">Inco-Info</p>
              <p className="text-xs text-gray-400 font-medium">Navigation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ page, label, icon }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                currentPage === page
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {icon}
              <span>{label}</span>
              {page === 'favoris' && favoritesCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">Dernière analyse</p>
          <p className="text-xs text-gray-600 mt-0.5">Aujourd'hui à 13:56</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">10 incohérences détectées</span>
          </div>
        </div>
      </aside>
    </>
  );
}
