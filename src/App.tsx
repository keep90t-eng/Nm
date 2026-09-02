import React, { useState, useMemo, useEffect } from 'react';
import { 
  FruitProduct, 
  CartItem, 
  CustomBasketConfig, 
  Order,
  Coupon,
  AdminDriver,
  StoreSettings
} from './types';
import { CATEGORIES, FRUIT_PRODUCTS, KUWAIT_AREAS } from './data/products';
import { 
  INITIAL_COUPONS, 
  INITIAL_DRIVERS, 
  INITIAL_STORE_SETTINGS, 
  INITIAL_DEMO_ORDERS 
} from './data/adminData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomBasketBuilderModal } from './components/CustomBasketBuilderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { FruitNutritionAdvisorModal } from './components/FruitNutritionAdvisorModal';
import { WishlistModal } from './components/WishlistModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { FreshnessGuaranteeBanner } from './components/FreshnessGuaranteeBanner';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  saveOrderToCloud, 
  updateOrderStatusInCloud, 
  assignDriverInCloud, 
  subscribeToCloudOrders,
  saveProductToCloud,
  deleteProductFromCloud,
  subscribeToCloudProducts,
  saveSettingsToCloud,
  subscribeToCloudSettings
} from './lib/firestoreService';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Flame, 
  Leaf, 
  ArrowUpDown, 
  CheckCircle2,
  SearchX,
  Truck,
  Gift,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Store Navigation & Filter State
  const [selectedCity, setSelectedCity] = useState<string>('capital');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'sweetness'>('featured');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [discountOnly, setDiscountOnly] = useState<boolean>(false);

  // Products State (Managed by Admin + Default Catalog)
  const [products, setProducts] = useState<FruitProduct[]>(() => {
    try {
      const saved = localStorage.getItem('deera_products');
      return saved ? JSON.parse(saved) : FRUIT_PRODUCTS;
    } catch {
      return FRUIT_PRODUCTS;
    }
  });

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('deera_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  // Fleet Drivers State
  const [drivers, setDrivers] = useState<AdminDriver[]>(() => {
    try {
      const saved = localStorage.getItem('deera_drivers');
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('deera_settings');
      return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  // Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customBasket, setCustomBasket] = useState<CustomBasketConfig | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [driverTip, setDriverTip] = useState<number>(0);

  // Wishlist & History Persistence
  const [wishlist, setWishlist] = useState<FruitProduct[]>(() => {
    try {
      const saved = localStorage.getItem('deera_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('deera_orders');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ORDERS;
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  });

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCustomBasketOpen, setIsCustomBasketOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activeTrackerOrder, setActiveTrackerOrder] = useState<Order | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<FruitProduct | null>(null);

  // Quick feedback toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Persist Wishlist, Orders, Products, Coupons, Drivers & Settings
  useEffect(() => {
    try {
      localStorage.setItem('deera_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('deera_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('deera_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('deera_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('deera_drivers', JSON.stringify(drivers));
    } catch (e) {
      console.error(e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem('deera_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [storeSettings]);

  // Real-Time Cloud Firestore Sync Subscriptions
  useEffect(() => {
    // 1. Synchronize Orders with Cloud Firestore
    const unsubOrders = subscribeToCloudOrders(INITIAL_DEMO_ORDERS, (cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    });

    // 2. Synchronize Products with Cloud Firestore
    const unsubProducts = subscribeToCloudProducts(FRUIT_PRODUCTS, (cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
      }
    });

    // 3. Synchronize Store Settings with Cloud Firestore
    const unsubSettings = subscribeToCloudSettings(INITIAL_STORE_SETTINGS, (cloudSettings) => {
      if (cloudSettings) {
        setStoreSettings(cloudSettings);
      }
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubSettings === 'function') unsubSettings();
    };
  }, []);

  // Admin Routing: Check path (/admin) or search param (?admin=1 or #admin)
  const [isAdminPath, setIsAdminPath] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      return path.includes('/admin') || search.includes('admin') || hash.includes('admin');
    } catch {
      return false;
    }
  });

  // Keep isAdminOpen in sync with routing
  useEffect(() => {
    const checkAdminRoute = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const isAdmin = path.includes('/admin') || search.includes('admin') || hash.includes('admin');
        setIsAdminPath(isAdmin);
        if (isAdmin) {
          setIsAdminOpen(true);
        }
      } catch {
        // ignore
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Keyboard Shortcut (Alt+A) for Store Owner to open Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // City Object
  const currentCityObj = KUWAIT_AREAS.find(c => c.id === selectedCity) || KUWAIT_AREAS[0];

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    const itemsTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const basketTotal = customBasket 
      ? customBasket.basePrice + customBasket.selectedFruits.reduce((s, i) => s + (i.pricePerUnit * i.quantity), 0)
      : 0;
    return itemsTotal + basketTotal;
  }, [cartItems, customBasket]);

  const totalCartCount = useMemo(() => {
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return itemsCount + (customBasket ? 1 : 0);
  }, [cartItems, customBasket]);

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'organic') {
          if (!product.isOrganic) return false;
        } else if (product.category !== activeCategory) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesOrigin = product.origin.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesEn = product.nameEn.toLowerCase().includes(query);
        if (!matchesName && !matchesOrigin && !matchesDesc && !matchesEn) {
          return false;
        }
      }

      // Quick Filters
      if (organicOnly && !product.isOrganic) return false;
      if (discountOnly && !product.originalPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'sweetness') return b.sweetness - a.sweetness;
      return 0; // featured default
    });
  }, [products, activeCategory, searchQuery, sortBy, organicOnly, discountOnly]);

  // Cart Handlers
  const handleAddToCart = (product: FruitProduct, quantity: number = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    showToast(`تمت إضافة ${quantity}x ${product.name} إلى السلة 🧺`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleAddCustomBasket = (basketConfig: CustomBasketConfig) => {
    setCustomBasket(basketConfig);
    setIsCartOpen(true);
    showToast('تمت إضافة سلة الهدايا المخصصة إلى سلتك 🎁');
  };

  const handleRemoveCustomBasket = () => {
    setCustomBasket(null);
  };

  // Promo Code Handler
  const handleApplyPromo = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const matched = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (matched) {
      if (cartSubtotal < matched.minOrder) {
        showToast(`هذا الكوبون يتطلب حداً أدنى للطلب ${matched.minOrder.toFixed(3)} د.ك`);
        return false;
      }
      const disc = (cartSubtotal * matched.discountPercent) / 100;
      setPromoDiscount(disc);
      setPromoCode(`${matched.code} (${matched.discountPercent}%)`);
      showToast(`تم تفعيل كود الخصم (${matched.discountPercent}%) بنجاح! 🎟️`);
      return true;
    }

    if (cleanCode === 'DEERA10') {
      const disc = cartSubtotal * 0.10;
      setPromoDiscount(disc);
      setPromoCode('DEERA10 (10%)');
      return true;
    }
    if (cleanCode === 'TAZA') {
      const disc = cartSubtotal * 0.15;
      setPromoDiscount(disc);
      setPromoCode('TAZA (15%)');
      return true;
    }
    if (cleanCode === 'WELCOME') {
      const disc = cartSubtotal * 0.20;
      setPromoDiscount(disc);
      setPromoCode('WELCOME (20%)');
      return true;
    }
    return false;
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: FruitProduct) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast(`تمت إزالة ${product.name} من المفضلة`);
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(`تم حفظ ${product.name} في المفضلة ❤️`);
        return [...prev, product];
      }
    });
  };

  // Order Placement Handler
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    // Save to Firestore cloud database
    saveOrderToCloud(newOrder);

    // Clear Cart
    setCartItems([]);
    setCustomBasket(null);
    setPromoDiscount(0);
    setPromoCode('');
    setDriverTip(0);
    // Open live tracker immediately!
    setActiveTrackerOrder(newOrder);
  };

  // Re-order past order
  const handleReorder = (order: Order) => {
    setCartItems(order.items);
    if (order.customBasket) setCustomBasket(order.customBasket);
    setIsOrdersOpen(false);
    setIsCartOpen(true);
    showToast('تمت استعادة أصناف الطلب السابق إلى سلتك 🧺');
  };

  // Add nutrition advice bundle
  const handleAddProductsBundle = (bundle: FruitProduct[]) => {
    bundle.forEach(p => handleAddToCart(p, 1));
    setIsCartOpen(true);
  };

  // --- ADMIN HANDLERS ---
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus };
        if (activeTrackerOrder && activeTrackerOrder.id === orderId) {
          setActiveTrackerOrder(updated);
        }
        return updated;
      }
      return o;
    }));
    // Sync update to Firestore cloud
    updateOrderStatusInCloud(orderId, newStatus);
    showToast(`تم تحديث حالة الطلب #${orderId} إلى: ${newStatus}`);
  };

  const handleAssignDriver = (orderId: string, driver: Order['driver']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, driver };
        if (activeTrackerOrder && activeTrackerOrder.id === orderId) {
          setActiveTrackerOrder(updated);
        }
        return updated;
      }
      return o;
    }));
    if (driver) {
      assignDriverInCloud(orderId, driver.name, driver.name);
    }
    showToast(`تم إسناد الطلب #${orderId} إلى المندوب: ${driver?.name}`);
  };

  const handleAddProduct = (newProd: FruitProduct) => {
    setProducts(prev => [newProd, ...prev]);
    saveProductToCloud(newProd);
    showToast(`تمت إضافة منتج ${newProd.name} إلى قائمة الفواكه بالمتجر بنجاح 🍎`);
  };

  const handleUpdateProduct = (updatedProd: FruitProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    saveProductToCloud(updatedProd);
    showToast(`تم حفظ تعديلات ${updatedProd.name} بنجاح ✅`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    deleteProductFromCloud(productId);
    showToast('تم حذف المنتج من المتجر.');
  };

  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
    showToast(`تم إنشاء كود الخصم ${newCoupon.code} بنجاح 🎟️`);
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, isActive: !c.isActive } : c));
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    showToast(`تم حذف الكوبون.`);
  };

  const handleAddDriver = (newDriver: AdminDriver) => {
    setDrivers(prev => [...prev, newDriver]);
    showToast(`تمت إضافة المندوب ${newDriver.name} إلى أسطول التوصيل 🚚`);
  };

  const handleToggleDriverStatus = (driverId: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const nextStatus = d.status === 'available' ? 'break' : d.status === 'break' ? 'available' : 'available';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    saveSettingsToCloud(newSettings);
    showToast('تم حفظ إعدادات المتجر والتوصيل بنجاح ⚙️');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-slate-900 selection:bg-emerald-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        cartCount={totalCartCount}
        cartTotal={cartSubtotal}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCustomBasket={() => setIsCustomBasketOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {/* Main Body */}
      <main className="flex-1">
        
        {/* Promotional Hero Banner */}
        <HeroBanner
          onExploreClick={() => {
            const el = document.getElementById('products-catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onCustomBasketClick={() => setIsCustomBasketOpen(true)}
          cityDeliveryMinutes={currentCityObj.timeMinutes}
        />

        {/* Categories Section */}
        <CategoryNav
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Product Catalog Section */}
        <section id="products-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Controls Bar: Sorting & Filter Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Results Title */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {activeCategory === 'all' ? 'جميع الفواكه الطازجة المتاحة اليوم' : CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h3>
              <span className="text-xs text-slate-400">({filteredProducts.length} صنف)</span>
            </div>

            {/* Quick Filter Toggles & Sorting */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Organic toggle */}
              <button
                onClick={() => setOrganicOnly(!organicOnly)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  organicOnly 
                    ? 'bg-emerald-700 text-white border-emerald-700' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>عضوي 100%</span>
              </button>

              {/* Discount toggle */}
              <button
                onClick={() => setDiscountOnly(!discountOnly)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  discountOnly 
                    ? 'bg-amber-600 text-white border-amber-600' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>عروض وخصومات</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">الموصى به (مميز)</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً ⭐</option>
                  <option value="sweetness">الأعلى حلاوة 🍯</option>
                </select>
              </div>

            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
              <SearchX className="w-16 h-16 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 text-base">لم نجد فواكه مطابقة لبحثك</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمات البحث أو استعراض جميع الفواكه الطازجة
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setOrganicOnly(false);
                  setDiscountOnly(false);
                }}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                عرض كل التشكيلة 🍉
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const cartItem = cartItems.find(it => it.product.id === product.id);
                const isWishlisted = wishlist.some(p => p.id === product.id);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={cartItem?.quantity || 0}
                    isWishlisted={isWishlisted}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={setQuickViewProduct}
                  />
                );
              })}
            </div>
          )}

        </section>

        {/* Custom Gift Basket Callout Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-400/40">
            <div className="flex items-center gap-4 text-center md:text-right">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 shadow-inner">
                🎁
              </div>
              <div className="space-y-1">
                <span className="bg-emerald-900 text-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full inline-block">
                  خدمة مخصصة للمناسبات
                </span>
                <h3 className="text-xl sm:text-2xl font-black">صمّم سلتك بنفسك وأهديها لأحبابك</h3>
                <p className="text-xs sm:text-sm text-amber-100 max-w-lg">
                  اختر حجم السلة الخشبية وفواكهك المفضلة، ونحن ننسقها بشرائط ساتان أنيقة وبطاقة إهداء مكتوبة بخط راقٍ ونوصلها لباب المستلم!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCustomBasketOpen(true)}
              className="px-6 py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>ابدأ تصميم السلة الآن 🧺</span>
            </button>
          </div>
        </section>

        {/* 100% Fresh Guarantee & Fast Delivery Promise */}
        <FreshnessGuaranteeBanner />

      </main>

      {/* Store Footer */}
      <Footer 
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenCustomBasket={() => setIsCustomBasketOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* --- MODALS & DRAWERS --- */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        customBasket={customBasket}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onRemoveCustomBasket={handleRemoveCustomBasket}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        subtotal={cartSubtotal}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        onApplyPromo={handleApplyPromo}
        driverTip={driverTip}
        onSelectTip={setDriverTip}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        customBasket={customBasket}
        subtotal={cartSubtotal}
        promoDiscount={promoDiscount}
        driverTip={driverTip}
        selectedCity={selectedCity}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Product Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        cartQuantity={quickViewProduct ? (cartItems.find(i => i.product.id === quickViewProduct.id)?.quantity || 0) : 0}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.some(p => p.id === quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Custom Gift Basket Creator Modal */}
      <CustomBasketBuilderModal
        isOpen={isCustomBasketOpen}
        onClose={() => setIsCustomBasketOpen(false)}
        availableFruits={products}
        onAddCustomBasketToCart={handleAddCustomBasket}
      />

      {/* Fruit Nutrition & Smoothie Advisor Modal */}
      <FruitNutritionAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        products={products}
        onAddProductsBundle={handleAddProductsBundle}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onAddToCart={handleAddToCart}
        onRemoveFromWishlist={(p) => handleToggleWishlist(p)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onTrackOrder={(o) => {
          setIsOrdersOpen(false);
          setActiveTrackerOrder(o);
        }}
        onReorder={handleReorder}
      />

      {/* Live Order Tracker Modal */}
      <OrderTrackerModal
        order={activeTrackerOrder}
        onClose={() => setActiveTrackerOrder(null)}
      />

      {/* Admin Dashboard Control Panel Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        products={products}
        coupons={coupons}
        drivers={drivers}
        settings={storeSettings}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAssignDriver={handleAssignDriver}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCoupon={handleAddCoupon}
        onToggleCoupon={handleToggleCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        onAddDriver={handleAddDriver}
        onToggleDriverStatus={handleToggleDriverStatus}
        onUpdateSettings={handleUpdateSettings}
      />

    </div>
  );
}
