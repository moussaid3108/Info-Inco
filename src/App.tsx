import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RevuePage from './pages/RevuePage';
import SourcesPage from './pages/SourcesPage';
import ConfrontationPage from './pages/ConfrontationPage';
import FavorisPage from './pages/FavorisPage';
import SujetsPage from './pages/SujetsPage';
import AboutPage from './pages/AboutPage';
import { Page, PressItem } from './types';
import { fetchPressItems, triggerAnalysis, fetchAvailableDates } from './api';

export default function App() {
  const [page, setPage] = useState<Page>('revue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('inco-favorites') || '[]'); } catch { return []; }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revueKey, setRevueKey] = useState(0);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('inco-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Charger les dates disponibles au démarrage
  useEffect(() => {
    fetchAvailableDates().then(setAvailableDates);
  }, []);

  // Recharger les articles quand la date change
  useEffect(() => {
    setLoading(true);
    fetchPressItems(selectedDate ?? undefined).then(items => {
      setPressItems(items);
      setLoading(false);
    });
  }, [selectedDate]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await triggerAnalysis();
      const [items, dates] = await Promise.all([
        fetchPressItems(),
        fetchAvailableDates(),
      ]);
      setPressItems(items);
      setAvailableDates(dates);
      setSelectedDate(null);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date);
  };

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };
  const goHome = () => { setPage('revue'); setSidebarOpen(false); setSelectedDate(null); setRevueKey(k => k + 1); };
  const sharedProps = { pressItems, favorites, onToggleFavorite: toggleFavorite };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar
        onMenuToggle={() => setSidebarOpen(true)}
        onAnalyze={handleAnalyze}
        onHome={goHome}
        isAnalyzing={isAnalyzing}
        currentPage={page}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={navigate}
        currentPage={page}
        favoritesCount={favorites.length}
      />
      <main className="pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Chargement des analyses…
          </div>
        ) : (
          <>
            {page === 'revue' && (
              <RevuePage
                key={revueKey}
                {...sharedProps}
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            )}
            {page === 'sources' && <SourcesPage pressItems={pressItems} />}
            {page === 'confrontation' && <ConfrontationPage {...sharedProps} />}
            {page === 'favoris' && <FavorisPage {...sharedProps} />}
            {page === 'sujets' && <SujetsPage pressItems={pressItems} />}
            {page === 'apropos' && <AboutPage />}
          </>
        )}
      </main>
    </div>
  );
}
