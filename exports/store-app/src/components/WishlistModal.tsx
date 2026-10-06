import React from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { FruitProduct } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: FruitProduct[];
  onAddToCart: (product: FruitProduct) => void;
  onRemoveFromWishlist: (product: FruitProduct) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  onAddToCart,
  onRemoveFromWishlist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-900 p-5 sm:px-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black">قائمة المفضلة</h2>
              <p className="text-xs text-rose-200">{wishlist.length} منتجات من المزرعة محفوظة لطلبها لاحقاً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3">
          {wishlist.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center text-3xl mx-auto">
                ❤️
              </div>
              <h3 className="font-bold text-slate-700 text-sm">قائمة المفضلة فارغة</h3>
              <p className="text-xs text-slate-500">اضغط على رمز القلب عند أي منتج لحفظه في مفضلتك</p>
            </div>
          ) : (
            wishlist.map((fruit) => (
              <div 
                key={fruit.id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-rose-200 transition-colors"
              >
                <img 
                  src={fruit.image} 
                  alt={fruit.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {fruit.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {fruit.origin}
                  </p>
                  <span className="text-xs font-black text-emerald-800 mt-0.5 block">
                    {fruit.price.toFixed(3)} د.ك / {fruit.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(fruit);
                      onRemoveFromWishlist(fruit);
                    }}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>للسلة</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(fruit)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="حذف من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
