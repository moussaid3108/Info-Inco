import { pressItems } from '../data/mockData';
import PressCard from '../components/PressCard';
import { Star } from 'lucide-react';

interface Props {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function FavorisPage({ favorites, onToggleFavorite }: Props) {
  const favItems = pressItems.filter(i => favorites.includes(i.id));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Favoris</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {favItems.length} analyse{favItems.length !== 1 ? 's' : ''} sauvegardée{favItems.length !== 1 ? 's' : ''}
        </p>
      </div>
      {favItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Aucun favori pour l&apos;instant</p>
          <p className="text-sm mt-1">Appuyez sur l&apos;étoile d&apos;une analyse pour la retrouver ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favItems.map(item => (
            <PressCard
              key={item.id}
              item={item}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
