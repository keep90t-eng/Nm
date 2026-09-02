import React from 'react';
import { 
  LayoutGrid, 
  TreePine, 
  Gift, 
  Sun, 
  Sparkles, 
  Heart, 
  Leaf,
  Layers
} from 'lucide-react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'LayoutGrid': return <LayoutGrid className="w-4 h-4" />;
    case 'TreePine': return <TreePine className="w-4 h-4" />;
    case 'Gift': return <Gift className="w-4 h-4" />;
    case 'Sun': return <Sun className="w-4 h-4" />;
    case 'Sparkles': return <Sparkles className="w-4 h-4" />;
    case 'Heart': return <Heart className="w-4 h-4" />;
    case 'Leaf': return <Leaf className="w-4 h-4" />;
    default: return <Layers className="w-4 h-4" />;
  }
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>أقسام الفواكه الطازجة</span>
          <span className="text-xs font-normal text-slate-500">اختر القسم للتصفح السريع</span>
        </h2>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-800 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-emerald-600'}>
                {getCategoryIcon(cat.iconName)}
              </span>
              <span>{cat.name}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
