import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Gift, 
  Tag, 
  Sparkles, 
  ArrowLeft,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { CartItem, CustomBasketConfig } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customBasket: CustomBasketConfig | null;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onRemoveCustomBasket: () => void;
  onProceedToCheckout: () => void;
  subtotal: number;
  promoCode: string;
  promoDiscount: number;
  onApplyPromo: (code: string) => boolean;
  driverTip: number;
  onSelectTip: (tip: number) => void;
  freeDeliveryThreshold?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  customBasket,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveCustomBasket,
  onProceedToCheckout,
  subtotal,
  promoCode,
  promoDiscount,
  onApplyPromo,
  driverTip,
  onSelectTip,
  freeDeliveryThreshold = 8.0,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  if (!isOpen) return null;

  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 1.0;
  const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryFee + driverTip);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = onApplyPromo(couponInput.trim());
    if (success) {
      setCouponSuccess(true);
      setCouponError('');
    } else {
      setCouponError('كوبون غير صالح. جرب كود THENAYAN10 أو TAZA');
      setCouponSuccess(false);
    }
  };

  const isEmpty = items.length === 0 && !customBasket;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end">
      <div 
        className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#025380] text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-black text-base">سلة المشتريات</h2>
              <p className="text-xs text-white/80">
                {items.length + (customBasket ? 1 : 0)} منتجات مختارة
              </p>
            </div>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {!isEmpty && (
          <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-100 text-xs">
            <div className="flex items-center justify-between text-emerald-950 font-bold mb-1.5">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {remainingForFreeDelivery === 0 ? (
                    <strong className="text-emerald-700">مبروك! حصلت على توصيل مجاني بالكويت 🚀</strong>
                  ) : (
                    <>أضف بـ <strong className="text-emerald-800">{remainingForFreeDelivery.toFixed(3)} د.ك</strong> للتوصيل المجاني</>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono font-black">{Math.round(freeDeliveryProgress)}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-4xl shadow-inner">
                🧺
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">سلتك فارغة حالياً</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  اختر من منتجات مزارع ومناحل الثنيان الطازجة أو صمم بوكس المزرعة المخصص
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                تصفح منتجات المزرعة الآن 🌿
              </button>
            </div>
          ) : (
            <>
              {/* Custom Gift Basket Item if exists */}
              {customBasket && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-base">
                        🎁
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{customBasket.sizeName}</h4>
                        <p className="text-[11px] text-amber-800 font-medium">
                          شريطة {customBasket.ribbonColor} • {customBasket.selectedFruits.length} أصناف
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onRemoveCustomBasket}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="حذف السلة المخصصة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {customBasket.greetingCard && (
                    <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-amber-100 italic">
                      "{customBasket.greetingCard}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">سعر السلة المتكاملة:</span>
                    <span className="font-black text-slate-900">
                      {(customBasket.basePrice + customBasket.selectedFruits.reduce((s, i) => s + (i.pricePerUnit * i.quantity), 0)).toFixed(3)} د.ك
                    </span>
                  </div>
                </div>
              )}

              {/* Standard Fruit Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition-colors"
                  >
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {(item.product.price ?? 0).toFixed(3)} د.ك / {item.product.unit}
                      </p>
                      <span className="text-xs font-black text-emerald-800 mt-0.5 block">
                        {((item.product.price ?? 0) * item.quantity).toFixed(3)} د.ك
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            onRemoveItem(item.product.id);
                          } else {
                            onUpdateQuantity(item.product.id, item.quantity - 1);
                          }
                        }}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div className="pt-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      placeholder="أدخل كود الخصم (مثل THENAYAN10)"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    تطبيق
                  </button>
                </form>

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> تم تطبيق الخصم بنجاح!
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1.5">
                    {couponError}
                  </p>
                )}
              </div>

              {/* Courier Tip Options */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                  <div className="flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>إكرامية لمندوب التوصيل السريع (اختياري)</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 0.500, 1.000, 1.500].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => onSelectTip(tip)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        driverTip === tip 
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tip === 0 ? 'بدون' : `${tip.toFixed(3)} د.ك`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Total & Checkout Bar */}
        {!isEmpty && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3 shadow-lg">
            
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{(subtotal ?? 0).toFixed(3)} د.ك</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>خصم الكود ({promoCode}):</span>
                  <span>-{(promoDiscount ?? 0).toFixed(3)} د.ك</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>رسوم التوصيل السريع:</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700 font-bold">مجاناً 🚀</strong> : `${(deliveryFee ?? 0).toFixed(3)} د.ك`}</span>
              </div>

              {driverTip > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>إكرامية المندوب:</span>
                  <span>{(driverTip ?? 0).toFixed(3)} د.ك</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm sm:text-base">
                <span className="font-black text-slate-900">الإجمالي النهائي:</span>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-[#025380]">{(finalTotal ?? 0).toFixed(3)}</span>
                  <span className="text-xs font-bold text-[#025380] mr-1">د.ك</span>
                  <p className="text-[10px] text-slate-400">شامل التغليف والنقل المبرد الفوري</p>
                </div>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              id="proceed-to-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-6 bg-[#025380] hover:bg-[#004070] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>اذهب إلى الدفع</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
