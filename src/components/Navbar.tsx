import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  MapPin, 
  Gift, 
  Sparkles, 
  Clock, 
  ChevronDown,
  X,
  Flame,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { KUWAIT_AREAS } from '../data/products';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCustomBasket: () => void;
  onOpenAdvisor: () => void;
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenWishlist,
  onOpenCustomBasket,
  onOpenAdvisor,
  selectedCity,
  onSelectCity,
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const currentCityObj = KUWAIT_AREAS.find(c => c.id === selectedCity) || KUWAIT_AREAS[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/70 shadow-xs">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs sm:text-sm py-2 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 text-amber-900" /> عرض اليوم
            </span>
            <span className="hidden sm:inline">توصيل مجاني لجميع مناطق الكويت للطلبات فوق 8 د.ك كود: </span>
            <span className="font-bold tracking-wider bg-white/15 px-2 py-0.5 rounded text-amber-200">DEERA10</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1 text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>توصيل طيارة بالكويت خلال <strong className="text-white">{currentCityObj.timeMinutes} دقيقة</strong> 🚀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-emerald-700 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20 border border-emerald-400/40">
                <span className="text-2xl">🧺</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">سلة الديرة</span>
                  <span className="text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">الكويت 🇰🇼</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">فواكه طازجة لباب بيتك بكل مناطق الكويت</p>
              </div>
            </div>

            {/* City & Delivery Area Selector */}
            <div className="relative">
              <button
                id="city-selector-btn"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 font-medium rounded-full border border-emerald-200 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{currentCityObj.name}</span>
                <span className="text-slate-400 text-xs hidden md:inline">({currentCityObj.districts[0]})</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCityDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-xs font-bold text-slate-500 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span>اختر المحافظة / المنطقة للتوصيل السريع</span>
                    <button onClick={() => setShowCityDropdown(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                    {KUWAIT_AREAS.map((city) => (
                      <button
                        key={city.id}
                        id={`city-option-${city.id}`}
                        onClick={() => {
                          onSelectCity(city.id);
                          setShowCityDropdown(false);
                        }}
                        className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedCity === city.id 
                            ? 'bg-emerald-50 text-emerald-900 font-bold' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${selectedCity === city.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <div className="text-right">
                            <div className="font-bold">{city.name}</div>
                            <div className="text-[10px] text-slate-400">{city.districts.slice(0, 3).join('، ')}...</div>
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-medium shrink-0">
                          ⚡ {city.timeMinutes} د
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-2 hidden md:block">
            <div className="relative">
              <input
                id="search-fruit-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن فراولة العبدلي، رقي الوفرة، مانجو، سلات هدايا..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 pr-10 pl-4 py-2.5 rounded-full border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Custom Basket Builder Shortcut */}
            <button
              id="custom-basket-nav-btn"
              onClick={onOpenCustomBasket}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>صمّم سلتك 🎁</span>
            </button>

            {/* Smart Nutrition Advisor Shortcut */}
            <button
              id="nutrition-advisor-nav-btn"
              onClick={onOpenAdvisor}
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200/80 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>مستشار الفواكه</span>
            </button>

            {/* Wishlist */}
            <button
              id="wishlist-nav-btn"
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button with KWD Total */}
            <button
              id="cart-drawer-toggle-btn"
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all cursor-pointer font-bold text-xs sm:text-sm group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-emerald-950 text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">السلة</span>
              {cartTotal > 0 && (
                <span className="bg-emerald-900/50 px-2 py-0.5 rounded-full text-xs text-amber-200">
                  {cartTotal.toFixed(3)} د.ك
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 block md:hidden">
          <div className="relative">
            <input
              id="mobile-search-fruit-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن الفواكه، سلات الهدايا..."
              className="w-full bg-slate-100 text-sm text-slate-900 pr-9 pl-4 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
};
