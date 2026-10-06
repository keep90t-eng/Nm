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
import { OffersCarousel } from './components/OffersCarousel';
import { NoticeModal } from './components/NoticeModal';
import { MobileCartBar } from './components/MobileCartBar';
import { Footer } from './components/Footer';
import { AboutUsModal } from './components/AboutUsModal';
import { ContactModal } from './components/ContactModal';
import { 
  saveOrderToCloud, 
  updateOrderStatusInCloud, 
  assignDriverInCloud, 
  subscribeToCloudOrders,
  saveProductToCloud,
  deleteProductFromCloud,
  subscribeToCloudProducts,
  saveSettingsToCloud,
  subscribeToCloudSettings,
  saveCouponToCloud,
  deleteCouponFromCloud,
  subscribeToCloudCoupons,
  saveDriverToCloud,
  deleteDriverFromCloud,
  subscribeToCloudDrivers
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

  // Products State (Authentic Al-Thenayan Catalog)
  const [products, setProducts] = useState<FruitProduct[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_v5_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return FRUIT_PRODUCTS;
    } catch {
      return FRUIT_PRODUCTS;
    }
  });

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  // Fleet Drivers State
  const [drivers, setDrivers] = useState<AdminDriver[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_drivers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('thenayan_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      return INITIAL_STORE_SETTINGS;
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
      const saved = localStorage.getItem('thenayan_orders') || localStorage.getItem('deera_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCustomBasketOpen, setIsCustomBasketOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);
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
      localStorage.setItem('thenayan_v5_products', JSON.stringify(products));
      localStorage.removeItem('deera_products');
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('thenayan_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('thenayan_drivers', JSON.stringify(drivers));
    } catch (e) {
      console.error(e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem('thenayan_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [storeSettings]);

  // Real-Time Cloud Firestore Sync Subscriptions
  useEffect(() => {
    // 1. Synchronize Orders with Cloud Firestore
    const unsubOrders = subscribeToCloudOrders([], (cloudOrders) => {
      setOrders(cloudOrders || []);
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

    // 4. Synchronize Coupons with Cloud Firestore
    const unsubCoupons = subscribeToCloudCoupons(INITIAL_COUPONS, (cloudCoupons) => {
      if (cloudCoupons && cloudCoupons.length > 0) {
        setCoupons(cloudCoupons);
      }
    });

    // 5. Synchronize Drivers with Cloud Firestore
    const unsubDrivers = subscribeToCloudDrivers(INITIAL_DRIVERS, (cloudDrivers) => {
      if (cloudDrivers && cloudDrivers.length > 0) {
        setDrivers(cloudDrivers);
      }
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubSettings === 'function') unsubSettings();
      if (typeof unsubCoupons === 'function') unsubCoupons();
      if (typeof unsubDrivers === 'function') unsubDrivers();
    };
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
      if (cartSubtotal < (matched.minOrder ?? 0)) {
        showToast(`هذا الكوبون يتطلب حداً أدنى للطلب ${(matched.minOrder ?? 0).toFixed(3)} د.ك`);
        return false;
      }
      const disc = (cartSubtotal * matched.discountPercent) / 100;
      setPromoDiscount(disc);
      setPromoCode(`${matched.code} (${matched.discountPercent}%)`);
      showToast(`تم تفعيل كود الخصم (${matched.discountPercent}%) بنجاح! 🎟️`);
      return true;
    }

    if (cleanCode === 'THENAYAN10' || cleanCode === 'DEERA10') {
      const disc = cartSubtotal * 0.10;
      setPromoDiscount(disc);
      setPromoCode('THENAYAN10 (10%)');
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
    showToast('تم استلام وتأكيد طلبك بنجاح! شكراً لاختيارك مزارع الثنيان 🌿');
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
    saveCouponToCloud(newCoupon);
    showToast(`تم إنشاء كود الخصم ${newCoupon.code} بنجاح 🎟️`);
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons(prev => {
      const updated = prev.map(c => c.code === code ? { ...c, isActive: !c.isActive } : c);
      const target = updated.find(c => c.code === code);
      if (target) saveCouponToCloud(target);
      return updated;
    });
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    deleteCouponFromCloud(code);
    showToast(`تم حذف الكوبون.`);
  };

  const handleAddDriver = (newDriver: AdminDriver) => {
    setDrivers(prev => [...prev, newDriver]);
    saveDriverToCloud(newDriver);
    showToast(`تمت إضافة المندوب ${newDriver.name} إلى أسطول التوصيل 🚚`);
  };

  const handleToggleDriverStatus = (driverId: string) => {
    setDrivers(prev => {
      const updated = prev.map(d => {
        if (d.id === driverId) {
          const nextStatus = d.status === 'available' ? 'break' : 'available';
          const u = { ...d, status: nextStatus };
          saveDriverToCloud(u);
          return u;
        }
        return d;
      });
      return updated;
    });
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    try {
      localStorage.setItem('thenayan_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
    saveSettingsToCloud(newSettings);
    showToast('تم حفظ إعدادات المتجر والتوصيل بنجاح ⚙️');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#e0f2fe] selection:text-[#025380]">
      
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
        onSelectCategory={(categoryId) => {
          setActiveCategory(categoryId);
          const el = document.getElementById('products-catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full space-y-4">
        
        {/* Promotional Hero Banner matching mazarie-althanyan.com */}
        <HeroBanner
          onExploreClick={() => {
            const el = document.getElementById('products-catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onCustomBasketClick={() => setIsCustomBasketOpen(true)}
          cityDeliveryMinutes={currentCityObj.timeMinutes}
          onSelectCategory={(categoryId) => {
            setActiveCategory(categoryId);
            const el = document.getElementById('products-catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Offers of the Day Horizontal Carousel matching mazarie-althanyan.com */}
        <OffersCarousel
          products={products}
          cart={cartItems}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateQuantity}
          onOpenProductDetail={setQuickViewProduct}
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
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                {activeCategory === 'all' ? 'كافة منتجات مزارع ومناحل الثنيان المتاحة اليوم' : CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">({filteredProducts.length} صنف)</span>
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

          {/* Products Grid matching mazarie-althanyan.com 2-column horizontal cards */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
              <SearchX className="w-16 h-16 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 text-base">لم نجد منتجات مطابقة لبحثك</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمات البحث أو استعراض جميع منتجات مزارع ومناحل الثنيان الطازجة
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setOrganicOnly(false);
                  setDiscountOnly(false);
                }}
                className="px-5 py-2.5 bg-[#025380] text-white rounded-xl text-xs font-bold shadow hover:bg-[#004070] transition-colors cursor-pointer"
              >
                عرض كل منتجات المزرعة 🌿
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

      </main>

      {/* Mobile Sticky Floating Cart Bar matching CartButtonMob_wrapper */}
      <MobileCartBar
        cartCount={totalCartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Store Footer matching mazarie-althanyan.com */}
      <Footer 
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenCustomBasket={() => setIsCustomBasketOpen(true)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
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

      {/* About Us Modal */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        onExploreProducts={() => {
          setActiveCategory('all');
          const el = document.getElementById('products-catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Customer Notice Modal matching mazarie-althanyan.com */}
      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />

      {/* Sticky Bottom Mobile Cart Bar matching mazarie-althanyan.com CartButtonMob */}
      <MobileCartBar
        cartCount={totalCartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

    </div>
  );
}
