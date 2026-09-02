import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tag, 
  Truck, 
  Settings, 
  ArrowRight, 
  Store, 
  Sparkles, 
  ShieldCheck, 
  X,
  Bell,
  RefreshCw,
  Plus,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { Order, FruitProduct, Coupon, AdminDriver, StoreSettings } from '../../types';
import { AdminOverview } from './AdminOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCoupons } from './AdminCoupons';
import { AdminFleet } from './AdminFleet';
import { AdminSettings as AdminSettingsView } from './AdminSettings';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: FruitProduct[];
  coupons: Coupon[];
  drivers: AdminDriver[];
  settings: StoreSettings;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onAssignDriver: (orderId: string, driver: Order['driver']) => void;
  onAddProduct: (product: FruitProduct) => void;
  onUpdateProduct: (product: FruitProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onToggleCoupon: (code: string) => void;
  onDeleteCoupon: (code: string) => void;
  onAddDriver: (driver: AdminDriver) => void;
  onToggleDriverStatus: (driverId: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  coupons,
  drivers,
  settings,
  onUpdateOrderStatus,
  onAssignDriver,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
  onAddDriver,
  onToggleDriverStatus,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'coupons' | 'fleet' | 'settings'>('overview');
  
  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('deera_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      setPinInput('');
      setAuthError(false);
      setErrorMessage('');
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const validPin = settings.adminPin || '2025';

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === validPin.trim()) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('deera_admin_auth', 'true');
      } catch (err) {
        console.error(err);
      }
      setAuthError(false);
      setErrorMessage('');
    } else {
      setAuthError(true);
      setErrorMessage('رمز المرور غير صحيح، يرجى المحاولة مرة أخرى');
      setTimeout(() => setAuthError(false), 2500);
    }
  };

  const handleClose = () => {
    try {
      if (window.location.pathname.includes('/admin') || window.location.search.includes('admin') || window.location.hash.includes('admin')) {
        window.history.pushState({}, '', window.location.pathname.replace(/\/admin/gi, '/') || '/');
      }
    } catch {
      // ignore
    }
    onClose();
  };

  const handleCopyAdminLink = () => {
    try {
      const baseUrl = window.location.origin;
      const adminUrl = `${baseUrl}/?admin=1`;
      navigator.clipboard.writeText(adminUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    try {
      sessionStorage.removeItem('deera_admin_auth');
    } catch (err) {
      console.error(err);
    }
    handleClose();
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 8) {
      setPinInput(prev => prev + val);
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  // If NOT authenticated, show Owner Gate / Login Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
          
          {/* Close / Return Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="إلغاء والعودة للمتجر"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">تسجيل دخول مالك المتجر</h2>
              <p className="text-xs text-slate-400 mt-1">
                منطقة محمية خاصة بإدارة وعمليات متجر سلة الديرة
              </p>
            </div>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block text-right">
                أدخل رمز المرور السري (PIN):
              </label>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  maxLength={10}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className={`w-full bg-slate-800/90 text-white text-center text-2xl font-mono tracking-widest py-3 px-12 rounded-2xl border ${
                    authError 
                      ? 'border-rose-500 ring-2 ring-rose-500/20 animate-shake' 
                      : 'border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  } focus:outline-none transition-all`}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                <KeyRound className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium justify-center pt-1 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Numeric Keypad for Fast Entry */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-lg border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput('')}
                className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 font-bold text-xs border border-slate-700/60 transition-all cursor-pointer"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-lg border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700/60 transition-all cursor-pointer"
              >
                ⌫
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>تحقق ودخول لوحة التحكم</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                العودة إلى واجهة المتجر
              </button>
            </div>
          </form>

          {/* Hint */}
          <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 text-center">
            <span>🔑 الرمز الافتراضي: <strong className="text-emerald-400 font-mono">2025</strong> (يمكنك تغييره من الإعدادات لاحقاً)</span>
          </div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter(o => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'on_way').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Admin Top Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0 px-4 sm:px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">لوحة تحكم سلة الديرة</h1>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  منطقة المالك المصرح بها 👑
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">نظام إدارة الفواكه والطلبات ومزامنة العمليات المباشرة</p>
            </div>
          </div>

          {/* Quick Actions & Exit to Store */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">الطلبات النشطة:</span>
              <strong className="text-amber-300 font-mono">{activeOrdersCount}</strong>
            </div>

            {/* Copy Admin Direct URL button */}
            <button
              onClick={handleCopyAdminLink}
              id="copy-admin-link-btn"
              className={`px-3 py-2 text-xs font-bold rounded-2xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="نسخ رابط الدخول المباشر للوحة التحكم"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">نسخ الرابط المباشر</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              id="exit-admin-btn"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer group"
            >
              <Store className="w-4 h-4 group-hover:rotate-12 transition-transform text-emerald-400" />
              <span>معاينة المتجر</span>
            </button>

            <button
              onClick={handleLogout}
              id="logout-admin-btn"
              className="px-3.5 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-200 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="تسجيل خروج وقفل اللوحة"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">قفل اللوحة</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2 shrink-0 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2">
          {[
            { id: 'overview', label: 'نظرة عامة وإحصائيات', icon: LayoutDashboard },
            { id: 'orders', label: `إدارة الطلبات (${orders.length})`, icon: ShoppingBag, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
            { id: 'products', label: `الفواكه والمخزون (${products.length})`, icon: Package },
            { id: 'coupons', label: `الكوبونات والعروض (${coupons.length})`, icon: Tag },
            { id: 'fleet', label: `أسطول التوصيل المبرد (${drivers.length})`, icon: Truck },
            { id: 'settings', label: 'إعدادات المتجر', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto pb-12">
          {activeTab === 'overview' && (
            <AdminOverview
              orders={orders}
              products={products}
              drivers={drivers}
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenNewProductModal={() => setActiveTab('products')}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              drivers={drivers}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onAssignDriver={onAssignDriver}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}

          {activeTab === 'coupons' && (
            <AdminCoupons
              coupons={coupons}
              onAddCoupon={onAddCoupon}
              onToggleCoupon={onToggleCoupon}
              onDeleteCoupon={onDeleteCoupon}
            />
          )}

          {activeTab === 'fleet' && (
            <AdminFleet
              drivers={drivers}
              onAddDriver={onAddDriver}
              onToggleDriverStatus={onToggleDriverStatus}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

