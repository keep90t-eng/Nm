import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Plus, Minus, Check } from 'lucide-react';
import { FruitProduct, CartItem } from '../types';

interface OffersCarouselProps {
  products: FruitProduct[];
  cart: CartItem[];
  onAddToCart: (product: FruitProduct) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onOpenProductDetail: (product: FruitProduct) => void;
}

export const OffersCarousel: React.FC<OffersCarouselProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onOpenProductDetail,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter products that belong to offers / best sellers
  const offerProducts = products.filter(
    p => p.category === 'promos' || p.isBestSeller || p.badge?.includes('عرض') || p.badge?.includes('حصري')
  ).slice(0, 8);

  const getProductCartQty = (productId: string) => {
    const item = cart.find(ci => ci.product.id === productId);
    return item ? item.quantity : 0;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (offerProducts.length === 0) return null;

  return (
    <div className="space-y-3 py-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            عروض اليوم
          </h2>
          <span className="bg-[#fff1f0] text-[#d90217] text-[11px] font-black px-2 py-0.5 rounded-full border border-[#fecaca]">
            خصومات لفترة محدودة
          </span>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth"
      >
        {offerProducts.map((product) => {
          const qty = getProductCartQty(product.id);

          return (
            <div
              key={product.id}
              className="w-44 sm:w-48 bg-white rounded-3xl border border-slate-200/90 p-3 flex flex-col justify-between shrink-0 shadow-2xs hover:shadow-md hover:border-[#025380]/40 transition-all group"
            >
              {/* Product Image */}
              <div 
                onClick={() => onOpenProductDetail(product)}
                className="w-full h-36 rounded-2xl bg-slate-100 overflow-hidden relative cursor-pointer mb-2.5"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="absolute top-2 right-2 bg-[#d90217] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                    خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Title & Price matching ProductCartVerticalDescription */}
              <div 
                onClick={() => onOpenProductDetail(product)}
                className="cursor-pointer space-y-1 mb-3"
              >
                <h5 className="font-black text-slate-900 text-sm sm:text-base font-mono">
                  {(product.price ?? 0).toFixed(3)} <span className="text-xs font-bold text-slate-600">د.ك</span>
                </h5>
                <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#025380] transition-colors">
                  {product.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {product.unit}
                </p>
              </div>

              {/* Add Button or Counter */}
              {qty === 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full py-2 bg-[#f1f5f9] hover:bg-[#025380] hover:text-white text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              ) : (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8.5 bg-[#f1f5f9] border border-slate-200 rounded-xl flex items-center justify-between px-2 text-xs font-black"
                >
                  <button
                    onClick={() => onUpdateCartQty(product.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-[#025380]">{qty}</span>
                  <button
                    onClick={() => onUpdateCartQty(product.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-[#025380] hover:text-white transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
