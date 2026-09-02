import React from 'react';
import { 
  Plus, 
  Minus, 
  Heart, 
  Star, 
  MapPin, 
  Sparkles, 
  Eye, 
  Flame, 
  Zap,
  ShoppingBag
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
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Image Container */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="bg-emerald-800/90 backdrop-blur-xs text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              {product.badge}
            </span>
          )}
          {product.isOrganic && !product.badge?.includes('عضوي') && (
            <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              عضوي 🌿
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <button
          id={`quickview-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-x-4 bottom-3 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-700" />
          <span>تفاصيل الحبة والمصدر</span>
        </button>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Origin & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-emerald-800 font-medium truncate max-w-[65%]">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-bold text-slate-800">{product.rating}</span>
            <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Name & Short Description */}
        <div className="cursor-pointer" onClick={() => onQuickView(product)}>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Sweetness & Calories Bar */}
        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-amber-600 font-semibold">الحلاوة:</span>
            <span className="tracking-tighter">
              {'🍯'.repeat(product.sweetness)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>{product.calories} سعرة / 100غ</span>
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-emerald-900">
                {product.price.toFixed(3)}
              </span>
              <span className="text-xs font-bold text-emerald-700">د.ك</span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {product.originalPrice.toFixed(3)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">لكل {product.unit}</p>
          </div>

          {/* Cart Buttons */}
          <div>
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-2xl p-1 shadow-2xs">
                <button
                  id={`decrement-qty-${product.id}`}
                  onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                  className="w-7 h-7 bg-white hover:bg-emerald-100 text-emerald-900 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-emerald-950">
                  {cartQuantity}
                </span>
                <button
                  id={`increment-qty-${product.id}`}
                  onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                  className="w-7 h-7 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id={`add-to-cart-btn-${product.id}`}
                onClick={() => onAddToCart(product)}
                className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>أضف للسلة</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
