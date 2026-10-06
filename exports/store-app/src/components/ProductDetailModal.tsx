import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Flame, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingBag,
  Info,
  CheckCircle2,
  Share2,
  Scissors,
  Check
} from 'lucide-react';
import { FruitProduct } from '../types';
import { CUSTOMER_REVIEWS } from '../data/products';

interface ProductDetailModalProps {
  product: FruitProduct | null;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (product: FruitProduct, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: FruitProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  cartQuantity,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [selectedCut, setSelectedCut] = useState<string>('');
  const [selectedCleaning, setSelectedCleaning] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Action Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer ${
                isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/90 text-slate-700 hover:text-emerald-700 flex items-center justify-center backdrop-blur-md shadow-md transition-all cursor-pointer relative"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                  تم النسخ!
                </span>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-95 cursor-pointer pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Image Preview */}
            <div className="md:col-span-5 relative rounded-3xl overflow-hidden aspect-square bg-slate-100 shadow-inner">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/top1.png';
                }}
              />
              {product.badge && (
                <div className="absolute bottom-3 right-3 bg-[#153e2b]/95 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{product.badge}</span>
                </div>
              )}
            </div>

            {/* Info and Specifications */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Origin badge & ratings */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-950 text-xs font-bold rounded-full border border-emerald-200">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {product.origin}
                </span>

                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewsCount} تقييم)</span>
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{product.nameEn}</p>
                
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                    {(product.price ?? 0).toFixed(3)}
                  </span>
                  <span className="text-sm font-bold text-amber-700">د.ك</span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono">
                      {(product.originalPrice ?? 0).toFixed(3)} د.ك
                    </span>
                  )}
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    لكل {product.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                {product.description}
              </p>

              {/* Custom Cutting Options (If applicable for fish/meat/poultry) */}
              {product.cutOptions && product.cutOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-600" />
                    <span>طريقة التقطيع والتجهيز المفضلة:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.cutOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedCut(opt)}
                        className={`p-2 rounded-xl text-xs font-bold border text-right transition-all cursor-pointer ${
                          selectedCut === opt
                            ? 'bg-[#153e2b] text-white border-[#153e2b] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cleaning & Preparation Options */}
              {product.cleaningOptions && product.cleaningOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>خيارات التنظيف والتغليف:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.cleaningOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedCleaning(opt)}
                        className={`p-2 rounded-xl text-xs font-bold border text-right transition-all cursor-pointer ${
                          selectedCleaning === opt
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitamins & Benefits */}
              {product.vitamins && product.vitamins.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>المكونات والقيم الغذائية البارزة:</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.vitamins.map((vit, idx) => (
                      <span key={idx} className="bg-emerald-100/70 text-emerald-950 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                        {vit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Tips */}
              {product.storageTips && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">إرشادات الحفظ والطهي:</span>
                    <span className="text-amber-900 leading-relaxed">{product.storageTips}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Freshness & Farm Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">توصيل مبرد سريع</p>
                <p className="text-[11px] text-emerald-700">بسيارات مكيفة تحفظ طزاجة المزرعة</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">إشراف بيطري وصحي</p>
                <p className="text-[11px] text-emerald-700">فحص مخبري دوري معتمد</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">طبيعي 100%</p>
                <p className="text-[11px] text-emerald-700">أعلاف نقية وبدون هرمونات</p>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
              <span>آراء وتجارب العملاء المعتمدة</span>
              <span className="text-xs text-emerald-700 font-normal">تقييمات مؤكدة بالشراء</span>
            </h3>
            <div className="space-y-2.5">
              {CUSTOMER_REVIEWS.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{rev.author}</span>
                      <span className="text-slate-400 text-[11px]">({rev.city})</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {'⭐'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer / Add to Cart Action */}
        <div className="p-4 sm:px-8 sm:py-5 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1 border border-slate-200">
            <button
              id="modal-dec-qty"
              onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
              className="w-8 h-8 bg-white hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-slate-900 font-mono">
              {selectedQty}
            </span>
            <button
              id="modal-inc-qty"
              onClick={() => setSelectedQty(selectedQty + 1)}
              className="w-8 h-8 bg-[#025380] hover:bg-[#004070] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            id="modal-add-to-cart-submit"
            onClick={() => {
              onAddToCart(product, selectedQty);
              onClose();
            }}
            className="flex-1 py-3.5 px-6 bg-[#025380] hover:bg-[#004070] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>أضف للطلب • { (((product.price ?? 0) * selectedQty)).toFixed(3) } د.ك</span>
          </button>

        </div>

      </div>
    </div>
  );
};
