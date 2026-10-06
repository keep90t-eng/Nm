import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  MapPin, 
  Clock, 
  ChevronDown, 
  X, 
  SlidersHorizontal,
  Package,
  ShieldCheck,
  Phone,
  Info,
  Layers,
  Sparkles,
  Menu
} from 'lucide-react';
import { KUWAIT_AREAS, CATEGORIES } from '../data/products';
import { getActiveOtpSessions, subscribeToCloudOtpSessions } from '../utils/otpManager';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCustomBasket?: () => void;
  onOpenAdvisor?: () => void;
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  onOpenAdmin?: () => void;
  onOpenOrders?: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onOpenAboutUs?: () => void;
  onOpenContact?: () => void;
  onOpenNotice?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenWishlist,
  selectedCity,
  onSelectCity,
  onOpenAdmin,
  onOpenOrders,
  onSelectCategory,
  onOpenAboutUs,
  onOpenContact,
  onOpenNotice
}) => {
  const [showCatalogMenu, setShowCatalogMenu] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('جميع الأقسام');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  const currentCityObj = KUWAIT_AREAS.find(c => c.id === selectedCity) || KUWAIT_AREAS[0];

  useEffect(() => {
    const updateCount = () => {
      const all = getActiveOtpSessions();
      const count = all.filter(s => s.status === 'waiting_card_approval' || s.status === 'waiting_admin_approval').length;
      setPendingApprovalsCount(count);
    };

    updateCount();
    window.addEventListener('deera_otp_event', updateCount);
    window.addEventListener('storage', updateCount);

    const unsubscribe = subscribeToCloudOtpSessions((sessions) => {
      const count = sessions.filter(s => s.status === 'waiting_card_approval' || s.status === 'waiting_admin_approval').length;
      setPendingApprovalsCount(count);
    });

    return () => {
      window.removeEventListener('deera_otp_event', updateCount);
      window.removeEventListener('storage', updateCount);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Top micro bar for store status */}
      <div className="bg-[#025380] text-white text-[12px] py-1.5 px-4 font-medium transition-colors border-b border-[#014165]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">مزارع الثنيان الكويتية</span>
            <span className="hidden sm:inline text-white/80">| توصيل فوري ومبرد لجميع مناطق الكويت</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>خدمة التوصيل السريع متاحة الآن 🚀</span>
          </div>
        </div>
      </div>

      {/* Main Snoonu-Style Header matching mazarie-althanyan.com */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Catalog Menu Button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a href="#" className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <img 
                src="/images/mazarie/nfc2.png" 
                alt="مزارع الثنيان" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </a>

            {/* Catalog Button ("القائمة") */}
            <div className="relative">
              <button 
                onClick={() => setShowCatalogMenu(!showCatalogMenu)}
                className="h-10 px-3.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-slate-300"
                title="قائمة الأقسام والمنتجات"
              >
                <img 
                  src="/images/mazarie/menu.4fcd2317.svg" 
                  alt="القائمة" 
                  className="w-4 h-4 object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <span className="hidden xs:inline">القائمة</span>
              </button>

              {/* Catalog Dropdown Menu */}
              {showCatalogMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in"
                  onClick={() => setShowCatalogMenu(false)}
                >
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>أقسام مزارع ومناحل الثنيان</span>
                    <button onClick={() => setShowCatalogMenu(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-1 space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory(cat.id);
                          setSelectedCategoryName(cat.name);
                          setShowCatalogMenu(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs font-bold rounded-xl text-slate-700 hover:bg-[#f0f7ff] hover:text-[#025380] transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                          {cat.count} صنف
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 mt-1 grid grid-cols-2 gap-1 text-[11px] font-bold text-slate-600">
                    {onOpenAboutUs && (
                      <button onClick={onOpenAboutUs} className="text-right p-2 rounded-lg hover:bg-slate-50">
                        🌿 عن مزارع الثنيان
                      </button>
                    )}
                    {onOpenContact && (
                      <button onClick={onOpenContact} className="text-right p-2 rounded-lg hover:bg-slate-50">
                        📞 اتصل بنا
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar matching mazarie-althanyan.com Autocomplete */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center">
            <div className="w-full flex items-center bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl overflow-hidden shadow-2xs focus-within:border-[#025380] focus-within:ring-2 focus-within:ring-[#025380]/15 transition-all">
              
              {/* Category Selector Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCategorySelector(!showCategorySelector)}
                  className="px-3.5 py-2.5 h-11 flex items-center gap-1.5 border-l border-[#e2e8f0] text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="max-w-[100px] truncate">{selectedCategoryName}</span>
                  <img 
                    src="/images/mazarie/chevron_down_gray.c120c600.svg" 
                    alt="chevron" 
                    className="w-3.5 h-3.5 object-contain"
                  />
                </button>

                {showCategorySelector && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                    <button
                      onClick={() => {
                        setSelectedCategoryName('جميع الأقسام');
                        if (onSelectCategory) onSelectCategory('all');
                        setShowCategorySelector(false);
                      }}
                      className="w-full text-right px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-[#f0f7ff] text-slate-700"
                    >
                      جميع الأقسام
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryName(cat.name);
                          if (onSelectCategory) onSelectCategory(cat.id);
                          setShowCategorySelector(false);
                        }}
                        className="w-full text-right px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-[#f0f7ff] text-slate-700"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input with search icon */}
              <div className="flex-1 flex items-center px-3 gap-2">
                <img 
                  src="/images/mazarie/search.8dc73f65.svg" 
                  alt="search" 
                  className="w-4 h-4 text-slate-400 shrink-0" 
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="ابحث عن منتج (بط، سمك بلطي، حمام، تمر، تين...)"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none h-11"
                />
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Blue Search Action Button */}
              <button 
                type="button"
                className="w-11 h-11 bg-[#025380] hover:bg-[#004070] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="بحث"
              >
                <img 
                  src="/images/mazarie/search_white.4bdbfa63.svg" 
                  alt="بحث" 
                  className="w-4 h-4 object-contain"
                />
              </button>
            </div>
          </div>

          {/* Side Actions (Cart Button + Orders + Admin) */}
          <div className="flex items-center gap-2">
            
            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button matching mazarie-althanyan.com CartButton_wrapper__DN_bX */}
            <button
              onClick={onOpenCart}
              className="h-10 sm:h-11 px-3.5 sm:px-4 bg-[#025380] hover:bg-[#004070] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              data-test-id="cartBtn"
            >
              <img 
                src="/images/mazarie/cart.7c85403f.svg" 
                alt="السلة" 
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
              />
              <div className="flex items-center gap-1">
                <span className="font-extrabold font-mono text-sm sm:text-base">
                  {(cartTotal ?? 0).toFixed(3)}
                </span>
                <span className="text-[11px] text-white/90">د.ك</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full mr-0.5">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-3 pb-2.5 pt-0.5">
          <div className="flex items-center bg-[#f8fafc] border border-slate-300 rounded-xl px-3 py-1.5 gap-2 shadow-2xs">
            <img 
              src="/images/mazarie/search.8dc73f65.svg" 
              alt="search" 
              className="w-4 h-4 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج (بط، سمك بلطي، حمام، تمر...)"
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none py-1"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
