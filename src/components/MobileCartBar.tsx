import React from 'react';

interface MobileCartBarProps {
  cartCount?: number;
  itemCount?: number;
  cartTotal?: number;
  totalAmount?: number;
  onOpenCart: () => void;
}

export const MobileCartBar: React.FC<MobileCartBarProps> = ({
  cartCount,
  itemCount,
  cartTotal,
  totalAmount,
  onOpenCart,
}) => {
  const count = cartCount ?? itemCount ?? 0;
  const total = Number(cartTotal ?? totalAmount ?? 0);

  if (count <= 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-3 sm:inset-x-6 z-40 max-w-xl mx-auto animate-in slide-in-from-bottom duration-300">
      <div 
        onClick={onOpenCart}
        className="bg-[#025380] hover:bg-[#004070] text-white p-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 border border-white/20"
      >
        {/* Left: Count and Label */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-mono font-black text-sm">
            {count}
          </div>
          <div>
            <h5 className="font-extrabold text-sm sm:text-base leading-none">
              سلة المشتريات
            </h5>
            <p className="text-[11px] text-white/80 mt-0.5">
              التوصيل مبرد خلال 40 دقيقة
            </p>
          </div>
        </div>

        {/* Center/Right: Total & Action */}
        <div className="flex items-center gap-3">
          <div className="text-left font-mono">
            <span className="text-base sm:text-lg font-black">
              {total.toFixed(3)}
            </span>
            <span className="text-xs text-white/90 mr-1">د.ك</span>
          </div>

          <div className="bg-white text-[#025380] px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-sm">
            <span>اذهب للسلة</span>
            <img 
              src="/images/mazarie/go_to_checkout.b2db30ab.svg" 
              alt="go" 
              className="w-3.5 h-3.5 object-contain rotate-180"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
