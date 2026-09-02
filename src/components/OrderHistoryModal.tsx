import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Search,
  Copy,
  Check,
  CreditCard,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onReorder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedOrderId(id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch {
      // ignore
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter === 'active' && order.status === 'delivered') return false;
    if (statusFilter === 'delivered' && order.status !== 'delivered') return false;

    // Search term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const matchOrderNum = order.orderNumber.toLowerCase().includes(term);
    const matchPhone = order.customerPhone?.toLowerCase().includes(term);
    const matchName = order.customerName?.toLowerCase().includes(term);
    const matchItems = order.items.some(i => i.product.name.toLowerCase().includes(term));
    const matchCity = order.deliveryDetails?.city?.toLowerCase().includes(term);
    return matchOrderNum || matchPhone || matchName || matchItems || matchCity;
  });

  const activeCount = orders.filter(o => o.status !== 'delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 p-5 sm:px-8 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700/50 flex items-center justify-center text-amber-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">طلباتي السابقة وتتبع الشحنات</h2>
              <p className="text-xs text-emerald-200">سجل فواتيرك، حالة الدفع والتوصيل الحي</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200/80 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث برقم الطلب (DIRA-KW-...) أو الهاتف أو اسم الصنف..."
                className="w-full bg-white text-xs sm:text-sm text-slate-900 pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'active'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>جاري التوصيل</span>
                {activeCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'delivered'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>تم التوصيل</span>
                {deliveredCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {deliveredCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                📦
              </div>
              <h3 className="font-bold text-slate-700 text-sm sm:text-base">
                {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد طلبات سابقة حتى الآن'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm 
                  ? 'تأكد من كتابة رقم الطلب أو رقم الهاتف المسجل بشكل صحيح'
                  : 'اطلب سلتك الأولى من الفواكه الطازجة وسيتم تسجيل جميع فواتيرك وتفاصيل التتبع هنا تلقائياً'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isDelivered = order.status === 'delivered';
              const isExpanded = expandedOrderId === order.id;

              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                        <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                          {order.orderNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(order.orderNumber, order.id)}
                          className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5"
                          title="نسخ رقم الطلب"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {order.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Payment Status Pill */}
                      {order.paymentDetails && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60 hidden sm:inline-flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span>{order.paymentDetails.method === 'knet' ? 'K-NET 🇰🇼' : order.paymentDetails.method === 'wallet' ? 'محفظة' : 'فيزا/ماستر'}</span>
                        </span>
                      )}

                      {/* Delivery Status */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isDelivered 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-900 animate-pulse'
                      }`}>
                        {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>
                          {order.status === 'delivered' && 'تم التوصيل بنجاح'}
                          {order.status === 'on_way' && 'المندوب في الطريق إليك 🚚'}
                          {order.status === 'preparing' && 'جاري تجهيز السلة الطازجة 🧺'}
                          {order.status === 'confirmed' && 'تم تأكيد الطلب والدفع ✅'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    
                    {/* Customer & Delivery address snippet */}
                    {order.deliveryDetails && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>عنوان التوصيل:</strong> {order.deliveryDetails.city} - {order.deliveryDetails.district}
                          {order.deliveryDetails.street && `، ق ${order.deliveryDetails.street}`}
                        </span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-500">أصناف الطلب:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {order.items.map((it) => (
                          <div 
                            key={it.product.id} 
                            className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              {it.product.image && (
                                <img 
                                  src={it.product.image} 
                                  alt={it.product.name} 
                                  className="w-7 h-7 rounded-lg object-cover"
                                />
                              )}
                              <span className="font-medium text-slate-800">
                                {it.quantity}x {it.product.name}
                              </span>
                            </div>
                            <span className="font-mono text-slate-600 font-bold">
                              {(it.product.price * it.quantity).toFixed(3)} د.ك
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.customBasket && (
                        <div className="text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>🎁</span>
                            <span className="font-bold">سلة إهداء: {order.customBasket.sizeName}</span>
                            <span className="text-amber-700">({order.customBasket.selectedFruits.length} أصناف فواكه)</span>
                          </div>
                          <span className="font-bold">{order.customBasket.basePrice.toFixed(3)} د.ك</span>
                        </div>
                      )}
                    </div>

                    {/* Extended Details Toggle */}
                    {isExpanded && order.paymentDetails && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200 text-xs space-y-2 bg-slate-50 p-3 rounded-2xl animate-in fade-in duration-150">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>بيانات الفاتورة والدفع المصرفي:</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                          <div><span className="text-slate-400 block">رقم المعاملة:</span><span className="font-mono font-bold text-slate-800">{order.paymentDetails.transactionId}</span></div>
                          <div><span className="text-slate-400 block">المرجع المصرفي:</span><span className="font-mono font-bold text-slate-800">{order.paymentDetails.knetReferenceNumber || '-'}</span></div>
                          <div><span className="text-slate-400 block">طريقة الدفع:</span><span className="font-bold text-slate-800">{order.paymentDetails.methodTitle}</span></div>
                          <div><span className="text-slate-400 block">رمز الأمان OTP:</span><span className="font-mono font-bold text-emerald-700">معتمد وموثق ✅</span></div>
                          <div><span className="text-slate-400 block">وقت المعاملة:</span><span className="text-slate-800">{order.paymentDetails.paidAt}</span></div>
                          <div><span className="text-slate-400 block">حالة الدفع:</span><span className="text-emerald-700 font-bold">مدفوع بنجاح (Paid)</span></div>
                        </div>
                      </div>
                    )}

                    {/* Total & Action Buttons Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-500">الإجمالي النهائي: </span>
                        <strong className="text-base font-black text-emerald-950">{order.total.toFixed(3)} د.ك</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.paymentDetails && (
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>{isExpanded ? 'إخفاء الفاتورة' : 'تفاصيل الفاتورة'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onTrackOrder(order)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تتبع الطلب مباشرة</span>
                        </button>

                        <button
                          onClick={() => onReorder(order)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-300" />
                          <span>إعادة الطلب</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

