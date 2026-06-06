import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RevuePage from './pages/RevuePage';
import SourcesPage from './pages/SourcesPage';
import ConfrontationPage from './pages/ConfrontationPage';
import FavorisPage from './pages/FavorisPage';
import SujetsPage from './pages/SujetsPage';
import AboutPage from './pages/AboutPage';
import { Page } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('revue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('inco-favorites') || '[]'); } catch { return []; }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('inco-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2500);
  };

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };

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
        {page === 'revue' && <RevuePage favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {page === 'sources' && <SourcesPage />}
        {page === 'confrontation' && <ConfrontationPage favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {page === 'favoris' && <FavorisPage favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {page === 'sujets' && <SujetsPage />}
        {page === 'apropos' && <AboutPage />}
      </main>
    </div>
  );
}
