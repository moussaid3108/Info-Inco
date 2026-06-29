import { PressItem, Category } from '../types';
import TypeBadge from '../components/TypeBadge';

const categories: Category[] = ['Guerre', 'Économie', 'Géopolitique', 'Société', 'Climat', 'Justice'];
const categoryIcons: Record<Category, string> = {
  Guerre: '⚔️', Géopolitique: '🌍', Économie: '📈', Société: '🏙️', Climat: '🌿', Justice: '⚖️',
};

interface Props { pressItems: PressItem[]; }

export default function SujetsPage({ pressItems }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Sujets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analyses regroupées par thème</p>
      </div>
      <div className="space-y-4">
        {categories.map(cat => {
          const items = pressItems.filter(i => i.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">{categoryIcons[cat]}</span>
                <h2 className="font-bold text-gray-900">{cat}</h2>
                <span className="ml-auto text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{items.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5"><TypeBadge type={item.type} size="sm" /></div>
                    <p className="text-sm text-gray-800 font-medium leading-snug flex-1">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
