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
import { fetchPressItems, triggerAnalysis } from './api';

export default function App() {
  const [page, setPage] = useState<Page>('revue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('inco-favorites') || '[]'); } catch { return []; }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('inco-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    fetchPressItems().then(items => {
      setPressItems(items);
      setLoading(false);
    });
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await triggerAnalysis();
      const items = await fetchPressItems();
      setPressItems(items);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };
  const sharedProps = { pressItems, favorites, onToggleFavorite: toggleFavorite };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar
        onMenuToggle={() => setSidebarOpen(true)}
        onAnalyze={handleAnalyze}
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
            {page === 'revue' && <RevuePage {...sharedProps} />}
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
