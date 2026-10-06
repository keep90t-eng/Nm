import React from 'react';
import { 
  Plus, 
  Minus, 
  Heart, 
  Star, 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  Eye
} from 'lucide-react';
import { FruitProduct } from '../types';

interface ProductCardProps {
  product: FruitProduct;
  cartQuantity: number;
  isWishlisted: boolean;
  onAddToCart: (product: FruitProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onToggleWishlist: (product: FruitProduct) => void;
  onQuickView: (product: FruitProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  isWishlisted,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
  onQuickView,
}) => {
  return (
    <div 
      className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#025380]/40 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-stretch justify-between gap-3 sm:gap-4 group relative"
      data-id={product.id}
    >
      
      {/* 1. Content Information (Right in RTL) */}
      <div 
        onClick={() => onQuickView(product)}
        className="flex-1 flex flex-col justify-between cursor-pointer space-y-2 order-2 sm:order-1"
      >
        <div>
          {/* Badge & Rating */}
          <div className="flex items-center gap-2 mb-1">
            {product.badge ? (
              <span className="bg-[#fff1f0] text-[#d90217] text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-[#fecaca]">
                {product.badge}
              </span>
            ) : (
              <span className="bg-[#f0fdf4] text-[#16a34a] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#bbf7d0]">
                طازج اليوم 🌿
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-mono">
              {product.origin}
            </span>
          </div>

          {/* Title matching Typography_h5__MRrA0 ProductCardHorizontal_name__z0EMu */}
          <h5 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#025380] transition-colors leading-snug">
            {product.name}
          </h5>

          {/* Description matching ProductCardHorizontal_description__YSUl2 */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          <span className="inline-block text-[11px] text-slate-400 font-semibold mt-1">
            الوحدة: {product.unit}
          </span>
        </div>

        {/* Bottom Price & Add Action Row */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between pt-2 border-t border-slate-100"
        >
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <h5 className="font-black text-slate-900 text-base sm:text-lg font-mono">
              {(product.price ?? 0).toFixed(3)}
            </h5>
            <span className="text-xs font-bold text-slate-600">د.ك</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono">
                {(product.originalPrice ?? 0).toFixed(3)}
              </span>
            )}
          </div>

          {/* Add / Stepper Button matching ProductCardHorizontal_productButton */}
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="h-9 px-4 bg-[#f1f5f9] hover:bg-[#025380] hover:text-white text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-98"
              data-test-id="addBtnProductCard"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          ) : (
            <div className="h-9 bg-[#f1f5f9] border border-slate-200 rounded-xl flex items-center gap-2 px-2 text-xs font-black shadow-2xs">
              <button
                onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
                title="تقليل"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono font-bold text-[#025380] min-w-[16px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-[#025380] hover:text-white transition-colors shadow-2xs cursor-pointer"
                title="زيادة"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Product Image on Left (in RTL) */}
      <div 
        onClick={() => onQuickView(product)}
        className="w-full sm:w-36 h-40 sm:h-36 rounded-2xl bg-slate-100 overflow-hidden relative cursor-pointer shrink-0 order-1 sm:order-2 group-hover:scale-101 transition-transform"
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isWishlisted 
              ? 'bg-rose-500 text-white fill-rose-500' 
              : 'bg-white/80 hover:bg-white text-slate-600'
          }`}
          title="حفظ في المفضلة"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {product.isExpressDelivery && (
          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            ⚡ 40 دقيقة
          </span>
        )}
      </div>

    </div>
  );
};
