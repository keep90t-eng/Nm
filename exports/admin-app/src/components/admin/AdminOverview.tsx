import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  CreditCard,
  Flame,
  Plus,
  ArrowUpRight,
  Sparkles,
  Package
} from 'lucide-react';
import { Order, FruitProduct, AdminDriver } from '../../types';
import { KUWAIT_AREAS } from '../../data/products';

interface AdminOverviewProps {
  orders: Order[];
  products: FruitProduct[];
  drivers: AdminDriver[];
  onSelectTab: (tab: 'orders' | 'products' | 'coupons' | 'fleet' | 'settings') => void;
  onOpenNewProductModal: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  products,
  drivers,
  onSelectTab,
  onOpenNewProductModal,
  onUpdateOrderStatus
}) => {
  // Calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const activeOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'on_way');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const averageBasketValue = orders.length > 0 ? (totalRevenue / orders.length) : 0;
  
  // Payment methods count
  const knetOrdersCount = orders.filter(o => o.paymentMethod === 'knet').length;
  const applePayCount = orders.filter(o => o.paymentMethod === 'apple_pay').length;
  const otherPayCount = orders.length - (knetOrdersCount + applePayCount);

  // Available drivers count
  const availableDrivers = drivers.filter(d => d.status === 'available' || d.status === 'delivering');

  return (
    <div className="space-y-6">
      {/* Top Banner / Live Store Status */}
      <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold bg-emerald-700/80 text-emerald-200 px-2.5 py-0.5 rounded-full">
                بث حي ومباشر للعمليات 🇰🇼
              </span>
              <span className="text-xs text-slate-300">تحديث فوري لجميع محافظات الكويت</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">لوحة العمليات والتحكم المركزي - مزارع ومناحل الثنيان</h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
              إدارة المخزون، متابعة رحلات المناديب المبردة (4°C)، استقبال واعتماد مدفوعات K-Net والبطاقات، وتجهيز بوكسات ومنتجات المزرعة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewProductModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج مزرعة جديد 🌿</span>
            </button>
            <button
              onClick={() => onSelectTab('orders')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>متابعة الطلبات ({activeOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المبيعات اليوم</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalRevenue.toFixed(3)}</span>
              <span className="text-xs font-bold text-emerald-700">د.ك</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% مقارنة بالأمس</span>
            </div>
          </div>
        </div>

        {/* Active Live Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الطلبات النشطة الآن</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeOrders.length}</span>
              <span className="text-xs text-slate-500 font-medium">طلب جاري</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold mt-1">
              <span>⚡ متوسط التوصيل: 28 دقيقة</span>
            </div>
          </div>
        </div>

        {/* Total Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الطلبات المكتملة</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{orders.length}</span>
              <span className="text-xs text-slate-500 font-medium">إجمالي الطلبات</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold mt-1">
              <span>{deliveredOrders.length} تم تسليمها بنجاح</span>
            </div>
          </div>
        </div>

        {/* Average Basket */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط قيمة السلة</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{averageBasketValue.toFixed(3)}</span>
              <span className="text-xs font-bold text-purple-700">د.ك</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-purple-600 font-bold mt-1">
              <span>سلال الهدايا ترفع المتوسط</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two Columns: Active Orders Stream & Kuwait Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Center: Recent Active Orders (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-black text-slate-900">الطلبات الحية وقيد التوصيل بالكويت</h3>
              </div>
              <button
                onClick={() => onSelectTab('orders')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>عرض كل الطلبات</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        📍 {order.deliveryDetails.city} - منطقة {order.deliveryDetails.district}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {order.total.toFixed(3)} د.ك
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          order.status === 'confirmed' ? 'bg-amber-100 text-amber-900' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-900' :
                          order.status === 'on_way' ? 'bg-emerald-100 text-emerald-900' :
                          'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {order.status === 'confirmed' ? '⚡ تم التأكيد' :
                         order.status === 'preparing' ? '🧺 قيد التجهيز' :
                         order.status === 'on_way' ? '🚀 مع المندوب' : '✅ تم التوصيل'}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    {order.items.map((it, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                        {it.quantity}x {it.product.name}
                      </span>
                    ))}
                    {order.customBasket && (
                      <span className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md text-[11px] font-bold">
                        🎁 سلة مخصصة ({order.customBasket.sizeName})
                      </span>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>المندوب: {order.driver?.name || 'غير معيّن'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          بدء التجهيز 🧺
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'on_way')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          تسليم للمندوب 🚀
                        </button>
                      )}
                      {order.status === 'on_way' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          تأكيد التسليم ✅
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Payment & Fleet Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Gateway Status */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>حالة بوابات الدفع في الكويت 💳</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-bold text-blue-950">كي نت (K-Net Gateway)</span>
                  </div>
                  <span className="font-bold text-blue-900 font-mono">{knetOrdersCount} طلبات</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">Apple Pay </span>
                  </div>
                  <span className="font-bold text-slate-700 font-mono">{applePayCount} طلبات</span>
                </div>
              </div>
            </div>

            {/* Refrigerated Fleet Live */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>أسطول التبريد الفوري (4°C) ❄️</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">مناديب جاهزون للتوصيل:</span>
                  <span className="font-bold text-emerald-700">{availableDrivers.length} سيارة مبردة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">درجة حرارة الصناديق:</span>
                  <span className="font-bold text-blue-700 font-mono">3.8°C - 4.1°C (ممتاز)</span>
                </div>
                <button
                  onClick={() => onSelectTab('fleet')}
                  className="w-full mt-1 text-[11px] text-center font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  إدارة وتتبع مسار المناديب ←
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Kuwait Governorates Distribution & Quick Inventory (1 Col) */}
        <div className="space-y-4">
          {/* Kuwait Governorates Coverage */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>تغطية المحافظات بالكويت 🇰🇼</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                6 محافظات
              </span>
            </div>

            <div className="space-y-2.5">
              {KUWAIT_AREAS.map((area) => {
                const ordersInArea = orders.filter(o => o.deliveryDetails.city.includes(area.name) || area.name.includes(o.deliveryDetails.city)).length;
                return (
                  <div key={area.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{area.name}</span>
                      <span className="text-emerald-700 font-bold text-[11px]">⚡ {area.timeMinutes} دقيقة</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{area.districts.slice(0, 2).join('، ')}...</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                        {ordersInArea} طلبات
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Selling Fruits Quick View */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>الأكثر طلباً اليوم</span>
              </h3>
              <button
                onClick={() => onSelectTab('products')}
                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                المخزون
              </button>
            </div>

            <div className="space-y-2">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                    <p className="text-[10px] text-slate-500">{p.origin}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-800 font-mono">
                    {p.price.toFixed(3)} د.ك
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
