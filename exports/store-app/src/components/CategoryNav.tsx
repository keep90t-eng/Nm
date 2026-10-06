import React from 'react';
import { 
  LayoutGrid, 
  Sparkles, 
  Fish, 
  Bird, 
  Beef, 
  Egg, 
  TreePine, 
  Gift,
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
    case 'Sparkles': return <Sparkles className="w-4 h-4" />;
    case 'Fish': return <Fish className="w-4 h-4" />;
    case 'Bird': return <Bird className="w-4 h-4" />;
    case 'Beef': return <Beef className="w-4 h-4" />;
    case 'Egg': return <Egg className="w-4 h-4" />;
    case 'TreePine': return <TreePine className="w-4 h-4" />;
    case 'Gift': return <Gift className="w-4 h-4" />;
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
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>أقسام مزارع ومناحل الثنيان</span>
          <span className="text-xs font-normal text-slate-500">اختر القسم للتصفح الفوري</span>
        </h2>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#025380] text-white border-2 border-[#025380] shadow-md scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-[#f0f7ff] hover:text-[#025380] border border-slate-200/90 shadow-2xs'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-[#025380]'}>
                {getCategoryIcon(cat.iconName)}
              </span>
              <span>{cat.name}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
