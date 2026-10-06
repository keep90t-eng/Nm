import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Phone, 
  Printer, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  CreditCard, 
  Building2, 
  Copy, 
  Check, 
  Receipt, 
  Lock, 
  Sparkles, 
  ExternalLink,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Radio,
  Trash2
} from 'lucide-react';
import { Order, AdminDriver, ActiveOtpSession, PaymentTransactionRecord } from '../../types';
import { 
  getActiveOtpSessions, 
  approveOtpSession, 
  rejectOtpSession,
  approveCardSession,
  rejectCardSession,
  removeOtpSession,
  subscribeToCloudOtpSessions
} from '../../utils/otpManager';
import { subscribeToCloudPayments, clearAllAdminOrdersAndPayments } from '../../lib/firestoreService';
import { playPaymentAlertSound, playOtpAlertSound, playSuccessSound, playGatewayEnteredAlertSound } from '../../utils/audioAlert';

interface AdminOrdersProps {
  orders: Order[];
  drivers: AdminDriver[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onAssignDriver: (orderId: string, driver: Order['driver']) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  drivers,
  onUpdateOrderStatus,
  onAssignDriver,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'knet' | 'credit_card' | 'wallet'>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [modalTab, setModalTab] = useState<'invoice' | 'knet_slip'>('invoice');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'orders' | 'payments_and_addresses'>('orders');
  const [cloudPayments, setCloudPayments] = useState<PaymentTransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('thenayan_payments');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // Live Active Gateway Visitors (Customers who entered the payment portal right now)
  const [activeGatewayVisitors, setActiveGatewayVisitors] = useState<ActiveOtpSession[]>([]);
  // Live Pending Card & OTP Sessions from client checkout
  const [pendingCardSessions, setPendingCardSessions] = useState<ActiveOtpSession[]>([]);
  const [pendingOtpSessions, setPendingOtpSessions] = useState<ActiveOtpSession[]>([]);
  // Retained sessions where OTP was rejected
  const [rejectedOtpSessions, setRejectedOtpSessions] = useState<ActiveOtpSession[]>([]);

  useEffect(() => {
    const updateSessions = () => {
      const active = getActiveOtpSessions();
      setActiveGatewayVisitors(active.filter(s => s.status === 'entered_gateway'));
      setPendingCardSessions(active.filter(s => s.status === 'waiting_card_approval'));
      setPendingOtpSessions(active.filter(s => s.status === 'waiting_admin_approval'));
      setRejectedOtpSessions(active.filter(s => s.status === 'rejected'));
    };

    updateSessions();

    // 1. Listen to Local Custom Events
    const handleOtpEvent = (e: any) => {
      updateSessions();
      const detail = e.detail;
      if (detail?.session?.status === 'entered_gateway' || detail?.type === 'entered_gateway') {
        playGatewayEnteredAlertSound();
      } else if (detail?.session?.status === 'waiting_card_approval') {
        playPaymentAlertSound();
      } else if (detail?.session?.status === 'waiting_admin_approval') {
        playOtpAlertSound();
      }
    };

    window.addEventListener('deera_otp_event', handleOtpEvent);
    window.addEventListener('storage', updateSessions);

    // 2. Listen to Real-Time Cloud Firestore Sessions
    const unsubscribeCloud = subscribeToCloudOtpSessions((cloudSessions) => {
      if (cloudSessions && cloudSessions.length >= 0) {
        const visitors = cloudSessions.filter(s => s.status === 'entered_gateway');
        const cards = cloudSessions.filter(s => s.status === 'waiting_card_approval');
        const otps = cloudSessions.filter(s => s.status === 'waiting_admin_approval');
        const rejected = cloudSessions.filter(s => s.status === 'rejected');
        
        if (visitors.length > activeGatewayVisitors.length) {
          playGatewayEnteredAlertSound();
        }
        if (cards.length > pendingCardSessions.length) {
          playPaymentAlertSound();
        }
        if (otps.length > pendingOtpSessions.length) {
          playOtpAlertSound();
        }

        setActiveGatewayVisitors(visitors);
        setPendingCardSessions(cards);
        setPendingOtpSessions(otps);
        setRejectedOtpSessions(rejected);
      }
    });

    // 3. Listen to Real-Time Cloud Firestore Payments & Addresses
    const unsubscribePayments = subscribeToCloudPayments((payments) => {
      if (payments && payments.length >= 0) {
        setCloudPayments(payments);
        try {
          localStorage.setItem('thenayan_payments', JSON.stringify(payments));
        } catch (e) {
          console.error(e);
        }
      }
    });

    return () => {
      window.removeEventListener('deera_otp_event', handleOtpEvent);
      window.removeEventListener('storage', updateSessions);
      if (typeof unsubscribeCloud === 'function') {
        unsubscribeCloud();
      }
      if (typeof unsubscribePayments === 'function') {
        unsubscribePayments();
      }
    };
  }, []);

  const handleAdminApproveCard = (sessionId: string) => {
    approveCardSession(sessionId);
    setPendingCardSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleAdminRejectCard = (sessionId: string) => {
    rejectCardSession(sessionId);
    setPendingCardSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleAdminApproveOtp = (sessionId: string) => {
    approveOtpSession(sessionId);
    setPendingOtpSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleAdminRejectOtp = (sessionId: string) => {
    rejectOtpSession(sessionId);
    const target = pendingOtpSessions.find(s => s.id === sessionId);
    setPendingOtpSessions(prev => prev.filter(s => s.id !== sessionId));
    if (target) {
      setRejectedOtpSessions(prev => [{ ...target, status: 'rejected' }, ...prev.filter(s => s.id !== sessionId)]);
    }
  };

  const togglePinVisibility = (orderId: string) => {
    setRevealedPins(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const toggleCardVisibility = (orderId: string) => {
    setRevealedCards(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [paymentStatusSubFilter, setPaymentStatusSubFilter] = useState<'all' | 'paid' | 'rejected'>('all');

  const combinedPayments = React.useMemo(() => {
    const list: PaymentTransactionRecord[] = [...cloudPayments];
    const seenTxns = new Set(cloudPayments.map(p => p.orderNumber || p.id));

    orders.forEach(ord => {
      if (ord.paymentDetails && !seenTxns.has(ord.orderNumber)) {
        list.push({
          id: `pay-${ord.id}`,
          orderId: ord.id,
          orderNumber: ord.orderNumber,
          customerName: ord.customerName || ord.paymentDetails.cardHolderName || 'عميل المتجر',
          customerPhone: ord.customerPhone || '----',
          customerAddress: ord.deliveryDetails.address || ord.deliveryDetails.street || `${ord.deliveryDetails.city} - ${ord.deliveryDetails.district}`,
          customerApartment: ord.deliveryDetails.apartment,
          deliveryNotes: ord.deliveryDetails.notes,
          totalAmount: ord.total,
          paymentMethod: ord.paymentMethod,
          bankName: ord.paymentDetails.bankName || 'K-NET',
          cardNumberFull: ord.paymentDetails.cardNumberFull || ord.paymentDetails.cardNumberMasked || '----',
          cardNumberMasked: ord.paymentDetails.cardNumberMasked || '•••• •••• •••• ••••',
          cardExpiry: ord.paymentDetails.cardExpiry || '----',
          knetPin: ord.paymentDetails.knetPin,
          cardCvv: ord.paymentDetails.cardCvv,
          otpCode: ord.paymentDetails.otpCode || '----',
          status: 'paid',
          transactionId: ord.paymentDetails.transactionId,
          referenceNumber: ord.paymentDetails.knetReferenceNumber || 'REF-KW',
          createdAt: ord.date,
          timestamp: Date.now()
        });
      }
    });

    return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [cloudPayments, orders]);

  const filteredCombinedPayments = React.useMemo(() => {
    return combinedPayments.filter(p => {
      const matchesStatus = 
        paymentStatusSubFilter === 'all' || 
        (paymentStatusSubFilter === 'paid' && (p.status === 'paid' || p.status === 'approved')) ||
        (paymentStatusSubFilter === 'rejected' && (p.status === 'rejected' || (p as any).status === 'failed'));
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.orderNumber?.toLowerCase().includes(q) ||
        p.customerName?.toLowerCase().includes(q) ||
        p.customerPhone?.includes(q) ||
        p.customerAddress?.toLowerCase().includes(q) ||
        p.cardNumberFull?.includes(q) ||
        p.bankName?.toLowerCase().includes(q) ||
        p.otpCode?.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [combinedPayments, paymentStatusSubFilter, searchQuery]);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryDetails.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryDetails.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentDetails?.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentDetails?.knetReferenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentDetails?.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentDetails?.cardNumberMasked?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentDetails?.otpCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* STAGE 0: Live Gateway Entry Alert (من لحظة دخول الزبون إلى بوابة الدفع) */}
      {activeGatewayVisitors.length > 0 && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-5 rounded-3xl text-white shadow-2xl space-y-4 border-2 border-sky-300 animate-in slide-in-from-top-4 duration-300 ring-4 ring-sky-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white text-blue-800 flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-sky-300">
                  🔔
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-white">
                    🔔 إشعار فوري: زبون متواجد الآن في بوابة الدفع الإلكتروني ({activeGatewayVisitors.length})
                  </h3>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    دخول مباشر LIVE ⚡
                  </span>
                </div>
                <p className="text-xs text-sky-100 mt-0.5">
                  رن جرس التنبيه تلقائياً من لحظة انتقال الزبون للبوابة، وهو الآن في مرحلة تعبئة بيانات البطاقة.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={playGatewayEnteredAlertSound}
              className="self-start sm:self-auto px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/30 shadow-xs"
              title="اختبار جرس دخول البوابة"
            >
              <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>جرس دخول البوابة 🔔</span>
            </button>
          </div>

          {/* Active Visitors Live Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10">
            {activeGatewayVisitors.map((visitor) => (
              <div
                key={visitor.id}
                className="bg-slate-900/95 text-slate-100 p-4 rounded-2xl border-2 border-sky-400/50 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-sky-500 text-white px-2 py-0.5 rounded">
                      {visitor.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{visitor.customerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({visitor.customerPhone})</span>
                  </div>
                  <span className="font-mono font-black text-base text-emerald-400">
                    {visitor.total.toFixed(3)} د.ك
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-sky-300 font-bold font-sans">
                      البوابة: {visitor.bankName}
                    </span>
                    <span className="text-amber-300 font-mono text-[10px] bg-amber-950/80 px-2 py-0.5 rounded">
                      دخول: {visitor.timestamp}
                    </span>
                  </div>
                  {visitor.customerAddress && (
                    <div className="text-[11px] text-slate-300 truncate">
                      📍 <strong>العنوان:</strong> {visitor.customerAddress} {visitor.customerApartment ? `(شقة: ${visitor.customerApartment})` : ''}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-amber-200 bg-amber-950/60 p-2 rounded-lg border border-amber-800/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>الزبون يكتب أرقام بطاقته الآن... سيصلك تنبيه جرس جديد فور إرسالها لموافقتك ✅</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 1: Live Card Approval Banner (قبل النقل إلى مرحلة OTP) */}
      {pendingCardSessions.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 rounded-3xl text-white shadow-2xl space-y-4 border-2 border-red-300 animate-in slide-in-from-top-4 duration-300 ring-4 ring-red-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white text-red-700 flex items-center justify-center font-bold text-xl shadow-lg ring-2 ring-red-400">
                <CreditCard className="w-6 h-6 animate-pulse text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg">
                    🚨 طلبات مراجعة وقبول البطاقات المصرفية (المرحلة الأولى قبل OTP) ({pendingCardSessions.length})
                  </h3>
                  <span className="bg-amber-300 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-bounce">
                    مطلوب قرارك فوراً ⚡
                  </span>
                </div>
                <p className="text-xs text-rose-100 mt-0.5">
                  قام العميل بإدخال بيانات بطاقته وهو الآن في شاشة الانتظار، يرجى مراجعة البطاقة والموافقة عليها لتحويله لصفحة OTP.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={playPaymentAlertSound}
              className="self-start sm:self-auto px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="اختبار جرس التنبيه"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300" />
              <span>جرس التنبيه 🔔</span>
            </button>
          </div>

          {/* Pending Card Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingCardSessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-slate-900 text-slate-100 p-4 rounded-2xl border-2 border-red-400/50 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                      {session.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{session.customerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({session.customerPhone})</span>
                  </div>
                  <span className="font-mono font-black text-base text-emerald-400">
                    {session.total.toFixed(3)} د.ك
                  </span>
                </div>

                {session.customerAddress && (
                  <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-300 truncate">
                      📍 <strong>العنوان:</strong> {session.customerAddress} {session.customerApartment ? `(شقة: ${session.customerApartment})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${session.customerAddress} ${session.customerApartment || ''}`, `addr-${session.id}`)}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="نسخ العنوان"
                    >
                      {copiedKey === `addr-${session.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="sm:col-span-3 pb-1 border-b border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans">البنك المصدر:</span>
                      <strong className="text-blue-400 text-xs block font-bold">{session.bankName}</strong>
                    </div>
                    <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded font-mono">
                      {session.timestamp}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-sans block">رقم البطاقة كامل:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <strong className="text-amber-300 text-sm tracking-wider font-mono">
                        {session.cardNumberFull}
                      </strong>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(session.cardNumberFull, `card-${session.id}`)}
                        className="p-1 hover:text-white text-slate-400"
                        title="نسخ رقم البطاقة"
                      >
                        {copiedKey === `card-${session.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">تاريخ الانتهاء:</span>
                    <strong className="text-slate-200 text-xs block font-mono mt-0.5">{session.cardExpiry}</strong>
                  </div>

                  <div className="sm:col-span-3 pt-1 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-[11px] text-rose-300 font-bold font-sans">
                      رمز PIN السري (كي نت):
                    </span>
                    <strong className="text-rose-400 text-base font-black font-mono tracking-widest bg-slate-950 px-2.5 py-0.5 rounded border border-rose-900/50">
                      {session.knetPin || session.cardCvv || '----'}
                    </strong>
                  </div>
                </div>

                {/* Card Decision Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdminApproveCard(session.id)}
                    className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>قبول البطاقة وتحويل العميل لصفحة OTP ✅</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminRejectCard(session.id)}
                    className="py-3 px-3 bg-slate-800 hover:bg-rose-900 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="رفض البطاقة"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض البطاقة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: Live OTP Requests Approval Banner (Active Real-Time Queue) */}
      {pendingOtpSessions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 rounded-3xl text-white shadow-xl space-y-4 border-2 border-amber-300 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-amber-700 flex items-center justify-center font-bold text-xl shadow-md">
                <Radio className="w-6 h-6 animate-pulse text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg">
                    طلبات تأكيد رمز الأمان (OTP) الحية بانتظار الموافقة ({pendingOtpSessions.length})
                  </h3>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full animate-bounce">
                    فوري LIVE ⚡
                  </span>
                </div>
                <p className="text-xs text-amber-100 mt-0.5">
                  قام العميل بإدخال بيانات البطاقة وطلب رمز التحقق لتأكيد السداد، يرجى الموافقة لإتمام الطلب.
                </p>
              </div>
            </div>
          </div>

          {/* Pending OTP Session Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingOtpSessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-amber-300/40 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                      {session.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{session.customerName}</span>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-400">
                    {session.total.toFixed(3)} د.ك
                  </span>
                </div>

                {session.customerAddress && (
                  <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-300 truncate">
                      📍 <strong>العنوان:</strong> {session.customerAddress} {session.customerApartment ? `(شقة: ${session.customerApartment})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${session.customerAddress} ${session.customerApartment || ''}`, `addr-otp-${session.id}`)}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="نسخ العنوان"
                    >
                      {copiedKey === `addr-otp-${session.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">البنك:</span>
                    <strong className="text-blue-400 text-[11px] block truncate">{session.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">رقم البطاقة كامل:</span>
                    <strong className="text-amber-300 text-[11px] block">{session.cardNumberFull}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">رمز PIN / انتهاء:</span>
                    <strong className="text-slate-200 text-[11px] block">{session.knetPin} | {session.cardExpiry}</strong>
                  </div>
                </div>

                {/* OTP Code Display Box */}
                <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-300 block font-sans font-bold">
                      رمز الأمان (OTP) المدخل من العميل:
                    </span>
                    <span className="font-mono font-black text-xl text-amber-400 tracking-widest">
                      {session.otpCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-200 bg-amber-900/80 px-2.5 py-1 rounded-lg font-mono">
                    {session.timestamp}
                  </span>
                </div>

                {/* Admin Action Buttons for this OTP */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdminApproveOtp(session.id)}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>موافقة واعتماد الدفع (Approve OTP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminRejectOtp(session.id)}
                    className="py-2.5 px-3 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="رفض المعاملة"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚠️ REJECTED OTP SESSIONS: All payment details strictly preserved and archived */}
      {rejectedOtpSessions.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-5 rounded-3xl text-white shadow-xl space-y-4 border-2 border-rose-600/40 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-800/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-lg">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-rose-100">
                    معاملات برمز أمان OTP مرفوض (بيانات الدفع والبطاقة محفوظة بالكامل) ({rejectedOtpSessions.length})
                  </h3>
                  <span className="bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                    محفوظة بالأرشيف 💾
                  </span>
                </div>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  تم رفض رمز OTP الذي أدخله العميل، مع الاحتفاظ الكامل برقم البطاقة، تاريخ الانتهاء، رمز PIN السري، والعنوان.
                </p>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 font-mono">
              العميل بإمكانه إعادة إدخال الرمز من شاشته
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {rejectedOtpSessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-rose-900 text-rose-200 px-2 py-0.5 rounded border border-rose-700">
                      {session.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{session.customerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({session.customerPhone})</span>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-400">
                    {session.total.toFixed(3)} د.ك
                  </span>
                </div>

                {session.customerAddress && (
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-300 truncate">
                      📍 <strong>العنوان:</strong> {session.customerAddress} {session.customerApartment ? `(شقة: ${session.customerApartment})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${session.customerAddress} ${session.customerApartment || ''}`, `rej-addr-${session.id}`)}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="نسخ العنوان"
                    >
                      {copiedKey === `rej-addr-${session.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">البنك:</span>
                    <strong className="text-blue-400 text-[11px] block truncate">{session.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">رقم البطاقة كامل:</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <strong className="text-amber-300 text-[11px] block font-mono">{session.cardNumberFull}</strong>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(session.cardNumberFull, `rej-card-${session.id}`)}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="نسخ رقم البطاقة"
                      >
                        {copiedKey === `rej-card-${session.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">رمز PIN / انتهاء:</span>
                    <strong className="text-rose-400 text-[11px] block">{session.knetPin} | {session.cardExpiry}</strong>
                  </div>
                </div>

                {/* Rejected OTP Info Box */}
                <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-800/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-rose-300 block font-bold font-sans">
                      رمز OTP المرفوض من الإدارة:
                    </span>
                    <span className="font-mono font-black text-rose-400 tracking-widest text-base line-through">
                      {session.otpCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
                    {session.timestamp}
                  </span>
                </div>

                {/* Re-approval or Contact Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdminApproveOtp(session.id)}
                    className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span>تراجع والموافقة على الرمز (اعتماد)</span>
                  </button>
                  <a
                    href={`tel:${session.customerPhone}`}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
                    title="الاتصال بالعميل"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>اتصال</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main View Mode Selector: Orders vs Dedicated Payments & Customer Addresses Ledger */}
      <div className="flex flex-wrap gap-2.5 pb-1">
        <button
          type="button"
          onClick={() => setActiveViewTab('orders')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeViewTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 ring-2 ring-emerald-500/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>📦 الطلبات المباشرة والتوصيل ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('payments_and_addresses')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeViewTab === 'payments_and_addresses'
              ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/20 ring-2 ring-blue-500/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 سجل المدفوعات والبطاقات وعناوين الزبائن المحفوظة ({combinedPayments.length})</span>
        </button>

        {/* Reset / Clear Button */}
        <button
          type="button"
          onClick={async () => {
            if (window.confirm('هل أنت متأكد من تصفير لوحة التحكم ومسح جميع الطلبات والمدفوعات؟ (سيتم تصفير العداد إلى 0)')) {
              await clearAllAdminOrdersAndPayments();
              setActiveGatewayVisitors([]);
              setPendingCardSessions([]);
              setPendingOtpSessions([]);
              setRejectedOtpSessions([]);
              setCloudPayments([]);
              window.location.reload();
            }
          }}
          className="mr-auto px-4 py-3 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-2xl text-xs sm:text-sm font-black border border-rose-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          title="تصفير لوحة التحكم ومسح كافة السجلات"
        >
          <Trash2 className="w-4 h-4" />
          <span>تصفير لوحة التحكم 🗑️</span>
        </button>
      </div>

      {/* Header Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <span>إدارة وتتبع الطلبات الحية والمدفوعات ({orders.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تتبع فوري لحالات الطلبات، إسناد المناديب، واستعراض تفاصيل الدفع عبر بوابة كي نت (K-Net)، وأرقام البطاقات ورموز الأمان (OTP).
            </p>
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'كل الحالات' },
              { id: 'confirmed', label: '⚡ مؤكدة' },
              { id: 'preparing', label: '🧺 قيد التجهيز' },
              { id: 'on_way', label: '🚀 مع المندوب' },
              { id: 'delivered', label: '✅ تم التوصيل' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Payment Method Tabs */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب (DIRA-KW-...)، رمز OTP، رقم مرجع K-Net، اسم البنك، رقم البطاقة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                paymentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جميع طرق الدفع
            </button>
            <button
              onClick={() => setPaymentFilter('knet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'knet' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <span>🇰🇼 كي نت (K-Net)</span>
            </button>
            <button
              onClick={() => setPaymentFilter('credit_card')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'credit_card' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💳 فيزا / ماستر</span>
            </button>
            <button
              onClick={() => setPaymentFilter('wallet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'wallet' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-900'
              }`}
            >
              <span>🪙 محفظة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Either Payments & Customer Addresses Ledger OR Orders List */}
      {activeViewTab === 'payments_and_addresses' ? (
        <div className="space-y-4">
          {/* Sub Filters for Payments Ledger */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">حالة المعاملة:</span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentStatusSubFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentStatusSubFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  جميع العمليات ({combinedPayments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatusSubFilter('paid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    paymentStatusSubFilter === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800'
                  }`}
                >
                  <span>المعتمدة والمسددة ✅</span>
                  <span>({combinedPayments.filter(p => p.status === 'paid' || p.status === 'approved').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatusSubFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    paymentStatusSubFilter === 'rejected'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-rose-800'
                  }`}
                >
                  <span>المرفوضة رمز OTP ❌</span>
                  <span>({combinedPayments.filter(p => p.status === 'rejected' || (p as any).status === 'failed').length})</span>
                </button>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500">
              إجمالي المبالغ المسددة: <strong className="text-emerald-700">{combinedPayments.filter(p => p.status === 'paid' || p.status === 'approved').reduce((acc, p) => acc + (p.totalAmount || 0), 0).toFixed(3)} د.ك</strong>
            </span>
          </div>

          {/* Payments Cards / Ledger List */}
          {filteredCombinedPayments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm">لا توجد عمليات دفع مطابقة في السجل</p>
            </div>
          ) : (
            filteredCombinedPayments.map((payRecord) => {
              const isRejected = payRecord.status === 'rejected' || (payRecord as any).status === 'failed';
              const isCardRevealed = !!revealedCards[payRecord.id];
              const isPinRevealed = !!revealedPins[payRecord.id];

              return (
                <div
                  key={payRecord.id}
                  className={`bg-white p-5 rounded-3xl border shadow-xs transition-all space-y-4 ${
                    isRejected ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90 hover:border-blue-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl">
                        {payRecord.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {payRecord.transactionId}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {payRecord.bankName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {(payRecord.totalAmount || 0).toFixed(3)} د.ك
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isRejected
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isRejected ? '❌ رمز OTP مرفوض (بيانات محفوظة)' : '✅ مسددة ومعتمدة'}
                      </span>
                    </div>
                  </div>

                  {/* 3-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Customer & Address */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">بيانات العميل:</span>
                        <a
                          href={`tel:${payRecord.customerPhone}`}
                          className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{payRecord.customerPhone}</span>
                        </a>
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        👤 {payRecord.customerName}
                      </p>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                            📍 <strong>العنوان:</strong> {payRecord.customerAddress}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(payRecord.customerAddress, `pay-addr-${payRecord.id}`)}
                            className="text-slate-400 hover:text-emerald-700 shrink-0 p-0.5"
                            title="نسخ العنوان"
                          >
                            {copiedKey === `pay-addr-${payRecord.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {payRecord.customerApartment && (
                          <p className="text-slate-600 text-[10.5px]">
                            🏢 <strong>الشقة / المنزل:</strong> {payRecord.customerApartment}
                          </p>
                        )}
                        {payRecord.deliveryNotes && (
                          <p className="text-amber-800 text-[10.5px]">
                            📝 <strong>الملاحظات:</strong> {payRecord.deliveryNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2 font-mono">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                        <span className="text-slate-400 text-[10px] font-sans">بيانات البطاقة:</span>
                        <button
                          type="button"
                          onClick={() => toggleCardVisibility(payRecord.id)}
                          className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-sans cursor-pointer"
                        >
                          {isCardRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isCardRevealed ? 'إخفاء' : 'إظهار'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-amber-300 font-bold text-xs tracking-wider">
                          {isCardRevealed ? payRecord.cardNumberFull : payRecord.cardNumberMasked}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(payRecord.cardNumberFull, `pay-card-${payRecord.id}`)}
                          className="text-slate-400 hover:text-white p-1"
                          title="نسخ رقم البطاقة"
                        >
                          {copiedKey === `pay-card-${payRecord.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">الانتهاء:</span>
                          <span className="text-slate-200">{payRecord.cardExpiry}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-300 font-sans block">رمز PIN (كي نت):</span>
                          <div className="flex items-center gap-1">
                            <span className="text-rose-400 font-bold">
                              {isPinRevealed ? (payRecord.knetPin || payRecord.cardCvv || '----') : '••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePinVisibility(payRecord.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              {isPinRevealed ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OTP & Security Info */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 block">رمز الأمان والتدقيق:</span>
                      
                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        isRejected ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <div>
                          <span className="text-[10px] block font-bold">
                            {isRejected ? 'رمز OTP المرفوض:' : 'رمز OTP المعتمد:'}
                          </span>
                          <span className="font-mono font-black text-sm tracking-widest">
                            {payRecord.otpCode}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">
                          {payRecord.createdAt ? new Date(payRecord.createdAt).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      {payRecord.rejectionReason && (
                        <p className="text-[10.5px] text-rose-700 bg-white p-1.5 rounded-lg border border-rose-200 leading-snug">
                          ⚠️ {payRecord.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Orders List / Cards */
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm">لا توجد طلبات مطابقة لخيارات البحث أو التصفية</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
            const pay = order.paymentDetails;
            const isPinRevealed = !!revealedPins[order.id];
            const isCardRevealed = !!revealedCards[order.id];
            const rawFullCard = pay?.cardNumberFull || pay?.cardNumberMasked || '5370 8821 9044 4912';
            const displayCardNumber = isCardRevealed 
              ? rawFullCard 
              : (pay?.cardNumberMasked || rawFullCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4'));

            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-black text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.date}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      📍 {order.deliveryDetails.city} - {order.deliveryDetails.district}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-emerald-950 font-mono">
                      {order.total.toFixed(3)} د.ك
                    </span>
                    
                    {/* Status Badges */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.status === 'confirmed' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                        order.status === 'on_way' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                        'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {order.status === 'confirmed' ? '⚡ طلب جديد ومؤكد' :
                       order.status === 'preparing' ? '🧺 جاري التجهيز والتبريد' :
                       order.status === 'on_way' ? '🚀 في الطريق مع المندوب' : '✅ تم التوصيل للعميل'}
                    </span>
                  </div>
                </div>

                {/* Items and Address Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Items */}
                  <div className="md:col-span-2 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">الأصناف المطلوبة:</span>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <span className="font-bold text-emerald-800 font-mono">{it.quantity}x</span>
                          <span className="font-medium text-slate-800">{it.product.name}</span>
                        </div>
                      ))}
                      {order.customBasket && (
                        <div className="bg-amber-100/70 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-lg font-bold">
                          🎁 سلة هدايا مخصصة ({order.customBasket.sizeName}) - شريطة {order.customBasket.ribbonColor}
                        </div>
                      )}
                    </div>
                    {order.deliveryDetails.notes && (
                      <p className="text-[11px] text-amber-800 font-medium pt-1">
                        📝 ملاحظة العميل: "{order.deliveryDetails.notes}"
                      </p>
                    )}
                  </div>

                  {/* Address & Driver Assignment */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">عنوان التوصيل بالكويت:</span>
                      <p className="text-slate-800 font-medium text-[11px] leading-relaxed mt-0.5">
                        {order.deliveryDetails.street}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">المندوب المكلّف:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={order.driver?.name || ''}
                          onChange={(e) => {
                            const selected = drivers.find(d => d.name === e.target.value);
                            if (selected) {
                              onAssignDriver(order.id, {
                                name: selected.name,
                                phone: selected.phone,
                                vehicle: selected.vehicle,
                                plateNumber: selected.plateNumber,
                                rating: selected.rating,
                                avatar: selected.avatar,
                              });
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                          <option value="">-- اختر مندوب التوصيل --</option>
                          {drivers.map((drv) => (
                            <option key={drv.id} value={drv.name}>
                              {drv.name} ({drv.currentArea})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Payment Breakdown Box (لوحة تفاصيل الدفع الإلكتروني + OTP) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {order.paymentMethod === 'knet' ? 'K' : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-950">
                            {pay?.methodTitle || (order.paymentMethod === 'knet' ? 'بوابة كي نت (K-Net Gateway) 🇰🇼' : 'بطاقة ائتمان')}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>تم التحصيل بنجاح</span>
                          </span>
                        </div>
                        {pay?.bankName && (
                          <span className="text-[11px] text-blue-800 font-bold flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-blue-600" />
                            <span>{pay.bankName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">المبلغ المسدد:</span>
                      <span className="font-mono font-black text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                        {order.total.toFixed(3)} د.ك
                      </span>
                    </div>
                  </div>

                  {/* Payment & OTP Meta Grid (5 columns on large screens) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
                    
                    {/* Card Number & Expiry */}
                    <div className="bg-white/95 p-3 rounded-xl border border-blue-200/90 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>رقم البطاقة والانتهاء:</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleCardVisibility(order.id)}
                            className="text-slate-400 hover:text-blue-700 p-0.5 cursor-pointer flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded"
                            title={isCardRevealed ? "إخفاء رقم البطاقة" : "كشف رقم البطاقة كاملاً"}
                          >
                            {isCardRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{isCardRevealed ? 'إخفاء' : 'كشف كامل'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(displayCardNumber.replace(/\s+/g, ''), `card-${order.id}`)}
                            className="text-slate-400 hover:text-emerald-700 p-0.5 cursor-pointer"
                            title="نسخ رقم البطاقة"
                          >
                            {copiedKey === `card-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="font-mono font-black text-slate-900 text-xs tracking-wider bg-slate-50 px-2 py-1 rounded border border-slate-200/80 flex items-center justify-between">
                          <span className="truncate">{displayCardNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="text-slate-500 font-medium">الانتهاء:</span>
                          <span className="font-mono font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                            {pay?.cardExpiry || '11/28'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Security Code / PIN */}
                    <div className="bg-white/95 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>رمز PIN السري:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(order.id)}
                          className="text-slate-400 hover:text-blue-700 p-0.5 cursor-pointer flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded"
                          title={isPinRevealed ? "إخفاء رمز الأمان" : "كشف رمز الأمان"}
                        >
                          {isPinRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isPinRevealed ? 'إخفاء' : 'كشف'}</span>
                        </button>
                      </div>
                      <div className="mt-1.5">
                        <div className="font-mono font-black text-amber-950 text-xs sm:text-sm tracking-widest bg-amber-50 px-2 py-1 rounded border border-amber-200/80 flex items-center justify-between">
                          <span>{isPinRevealed ? (pay?.knetPin || '4182') : '••••'}</span>
                          <span className="text-[10px] text-amber-700 font-sans font-bold">
                            {isPinRevealed ? 'موثق' : 'محمي'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                          <span>حامل البطاقة:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[100px]">
                            {pay?.cardHolderName || 'عميل معتمد'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* OTP Code & Status Box */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-300 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-900 font-black flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>رمز الأمان (OTP):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pay?.otpCode || '849201', `otp-${order.id}`)}
                          className="text-slate-400 hover:text-amber-800 p-0.5 cursor-pointer"
                          title="نسخ كود OTP"
                        >
                          {copiedKey === `otp-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="font-mono font-black text-amber-950 text-sm tracking-widest bg-white px-2 py-1 rounded border border-amber-300 flex items-center justify-between shadow-2xs">
                          <span>{pay?.otpCode || '849201'}</span>
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                            {pay?.otpStatus === 'approved' ? 'معتمد ✅' : 'بانتظار الموافقة'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>التحقق:</span>
                          <span className="font-bold text-emerald-700">3D Secure 2.0</span>
                        </div>
                      </div>
                    </div>

                    {/* K-Net Reference Number */}
                    <div className="bg-white/95 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-bold">مرجع كي نت (K-Net Ref):</span>
                      <div className="flex items-center justify-between mt-1 bg-slate-50 px-2 py-1 rounded border border-slate-200/80">
                        <span className="font-mono font-black text-slate-900 text-xs truncate">
                          {pay?.knetReferenceNumber || `KNET-${order.orderNumber.replace(/\D/g, '')}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pay?.knetReferenceNumber || `KNET-${order.orderNumber.replace(/\D/g, '')}`, `ref-${order.id}`)}
                          className="text-slate-400 hover:text-emerald-700 p-0.5 cursor-pointer"
                          title="نسخ رقم المرجع"
                        >
                          {copiedKey === `ref-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                        <span>رقم المعاملة:</span>
                        <span className="font-mono font-bold text-slate-800 text-[10px]">
                          {pay?.transactionId || 'TXN-88192'}
                        </span>
                      </div>
                    </div>

                    {/* Auth Code & Status */}
                    <div className="bg-white/95 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-bold">كود التفويض والاعتماد:</span>
                      <div className="flex items-center justify-between mt-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <span className="font-mono font-black text-emerald-900 text-xs">
                          {pay?.authCode || 'AUTH-KW-88192'}
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                          000 OK
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                        <span>حالة الاستجابة:</span>
                        <span className="font-bold text-emerald-700 text-[10px]">
                          معتمدة مصرفياً 100%
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* View Details / Invoice & Banking Slip */}
                    <button
                      onClick={() => {
                        setSelectedOrderForDetail(order);
                        setModalTab('invoice');
                        setShowInvoiceModal(true);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-300" />
                      <span>إشعار السداد البنكي ورمز الأمان 🧾</span>
                    </button>

                    {/* WhatsApp Notify */}
                    <a
                      href={`https://wa.me/${(order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '96596971613')}?text=${encodeURIComponent(`مرحباً من متجر سلة الديرة، تم استلام وتأكيد طلبكم رقم ${order.orderNumber} والمدفوع عبر ${order.paymentDetails?.bankName || 'كي نت'} بنجاح 🍉`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>واتساب العميل</span>
                    </a>
                  </div>

                  {/* Order Lifecycle Advancement Buttons */}
                  <div className="flex items-center gap-2">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>تأكيد وبدء التجهيز</span>
                        <span>🧺</span>
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'on_way')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>إرسال مع المندوب</span>
                        <span>🚀</span>
                      </button>
                    )}
                    {order.status === 'on_way' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>تأكيد التسليم للعميل</span>
                        <span>✅</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    )}

      {/* Printable Invoice & K-Net Banking Slip Modal */}
      {showInvoiceModal && selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  🧺
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">سلة الديرة - نظام السداد والفواتير الرسمية</h3>
                  <p className="text-[11px] text-slate-500">دولة الكويت 🇰🇼 | سجل تجاري CR-418290/2023</p>
                </div>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Store Invoice vs K-Net Banking Slip */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setModalTab('invoice')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === 'invoice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>فاتورة المبيعات الرسمية</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('knet_slip')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === 'knet_slip' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إشعار السداد ورمز الأمان (K-Net Slip) 🇰🇼</span>
              </button>
            </div>

            {/* TAB 1: STORE INVOICE */}
            {modalTab === 'invoice' && (
              <div className="space-y-4">
                {/* Invoice Meta */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">رقم الفاتورة:</span>
                    <strong className="text-slate-900 font-mono font-bold text-sm">{selectedOrderForDetail.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">تاريخ ووقت الشراء:</span>
                    <strong className="text-slate-900">{selectedOrderForDetail.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">المنطقة والمحافظة:</span>
                    <strong className="text-slate-900">{selectedOrderForDetail.deliveryDetails.city} - {selectedOrderForDetail.deliveryDetails.district}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">طريقة السداد:</span>
                    <strong className="text-blue-700 font-bold">
                      {selectedOrderForDetail.paymentDetails?.bankName || selectedOrderForDetail.paymentMethod.toUpperCase()}
                    </strong>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-700 pb-1 border-b flex justify-between">
                    <span>الأصناف والمنتجات:</span>
                    <span>المجموع</span>
                  </div>
                  {selectedOrderForDetail.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span>{it.quantity}x {it.product.name} ({it.product.unit})</span>
                      <span className="font-mono font-bold">{(it.product.price * it.quantity).toFixed(3)} د.ك</span>
                    </div>
                  ))}
                  {selectedOrderForDetail.customBasket && (
                    <div className="flex items-center justify-between py-1 text-amber-900 font-bold border-b border-slate-50">
                      <span>سلة فواكه مخصصة ({selectedOrderForDetail.customBasket.sizeName})</span>
                      <span className="font-mono">
                        {(selectedOrderForDetail.customBasket.basePrice + selectedOrderForDetail.customBasket.selectedFruits.reduce((s, f) => s + f.pricePerUnit * f.quantity, 0)).toFixed(3)} د.ك
                      </span>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono">{selectedOrderForDetail.subtotal.toFixed(3)} د.ك</span>
                  </div>
                  {selectedOrderForDetail.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>الخصم المطبق:</span>
                      <span className="font-mono">-{selectedOrderForDetail.discount.toFixed(3)} د.ك</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>رسوم التوصيل المبرد:</span>
                    <span className="font-mono">{selectedOrderForDetail.deliveryFee === 0 ? 'مجاناً' : `${selectedOrderForDetail.deliveryFee.toFixed(3)} د.ك`}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t">
                    <span>الإجمالي النهائي المسدد:</span>
                    <span className="text-emerald-800 font-mono">{selectedOrderForDetail.total.toFixed(3)} د.ك</span>
                  </div>
                </div>

                {/* Card Payment Snapshot in Invoice */}
                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-blue-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span>بيانات البطاقة المصرفية المسدد بها:</span>
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                      تمت المعاملة بنجاح
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 font-sans block">رقم البطاقة كامل:</span>
                      <strong className="text-slate-900 font-bold block mt-0.5">
                        {selectedOrderForDetail.paymentDetails?.cardNumberFull || selectedOrderForDetail.paymentDetails?.cardNumberMasked || '5370 8821 9044 4912'}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 font-sans block">تاريخ الانتهاء:</span>
                      <strong className="text-blue-900 font-bold block mt-0.5">
                        {selectedOrderForDetail.paymentDetails?.cardExpiry || '11/28'}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 font-sans block">رمز الأمان PIN:</span>
                      <strong className="text-amber-700 font-bold block mt-0.5">
                        {selectedOrderForDetail.paymentDetails?.knetPin || '4182'}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 font-sans block">رمز OTP المعتمد:</span>
                      <strong className="text-emerald-700 font-bold block mt-0.5">
                        {selectedOrderForDetail.paymentDetails?.otpCode || '849201'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OFFICIAL K-NET BANKING RECEIPT SLIP */}
            {modalTab === 'knet_slip' && (
              <div className="p-5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 space-y-3.5 shadow-inner">
                {/* Header */}
                <div className="text-center space-y-1 border-b border-dashed border-slate-700 pb-3">
                  <div className="text-white font-bold text-sm tracking-wider">
                    *** إشعار الدفع الإلكتروني المعتمد ***
                  </div>
                  <div className="text-[11px] text-slate-400">
                    THE SHARED ELECTRONIC BANKING SERVICES CO. (K-NET)
                  </div>
                  <div className="text-slate-300 font-bold text-xs pt-1">
                    متجر سلة الديرة للخضار والفواكه (الكويت)
                  </div>
                </div>

                {/* Merchant & Terminal Data */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 border-b border-dashed border-slate-700 pb-3">
                  <div>
                    <span className="text-slate-500 block">MERCHANT ID (رقم التاجر):</span>
                    <span className="text-white font-bold">MID-DIRA-44910</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TERMINAL ID (رقم البوابة):</span>
                    <span className="text-white font-bold">TER-KW-881920</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">BANK NAME (اسم البنك):</span>
                    <span className="text-amber-400 font-bold">
                      {selectedOrderForDetail.paymentDetails?.bankName || 'بنك الكويت الوطني (NBK)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TRANSACTION (نوع المعاملة):</span>
                    <span className="text-white font-bold">E-COMMERCE PURCHASE (3D SECURE)</span>
                  </div>
                </div>

                {/* Card & Authorization Details */}
                <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-700 pb-3 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">CARD NUMBER (رقم البطاقة):</span>
                    <span className="text-white font-bold font-mono tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {selectedOrderForDetail.paymentDetails?.cardNumberFull || selectedOrderForDetail.paymentDetails?.cardNumberMasked || '5370 8821 9044 4912'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">EXPIRY DATE (تاريخ الانتهاء):</span>
                    <span className="text-amber-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {selectedOrderForDetail.paymentDetails?.cardExpiry || '11/28'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">CARDHOLDER (حامل البطاقة):</span>
                    <span className="text-slate-200 font-bold">
                      {selectedOrderForDetail.paymentDetails?.cardHolderName || 'فاطمة الكندري'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">PIN CODE (رمز الأمان السري):</span>
                    <span className="text-emerald-400 font-bold font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {selectedOrderForDetail.paymentDetails?.knetPin || '4182'} [VERIFIED AUTH]
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">OTP 3D SECURE (رمز الأمان):</span>
                    <span className="text-amber-400 font-bold font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {selectedOrderForDetail.paymentDetails?.otpCode || '849201'} [ADMIN APPROVED ✅]
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">TRANSACTION ID (رقم العملية):</span>
                    <span className="text-white font-mono font-bold">
                      {selectedOrderForDetail.paymentDetails?.transactionId || 'TXN-KNET-849201'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">KNET REF NO (رقم مرجع كي نت):</span>
                    <span className="text-white font-mono font-bold">
                      {selectedOrderForDetail.paymentDetails?.knetReferenceNumber || 'KNET-90214820'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">AUTH CODE (رمز الموافقة):</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {selectedOrderForDetail.paymentDetails?.authCode || 'AUTH-KW-77219'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">DATE & TIME (الوقت والتاريخ):</span>
                    <span className="text-white font-mono">
                      {selectedOrderForDetail.paymentDetails?.paidAt || '2026-09-01 14:30:15'}
                    </span>
                  </div>
                </div>

                {/* Amount & Result */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white font-bold">TOTAL DEBITED (المبلغ المخصوم):</span>
                    <span className="text-emerald-400 font-black text-base font-mono">
                      {selectedOrderForDetail.total.toFixed(3)} KWD (د.ك)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-center text-emerald-300 font-bold text-xs">
                    RESPONSE: APPROVED 000 - تم اعتماد رمز OTP والخصم بنجاح من حساب العميل
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>إيصال سداد إلكتروني معتمد برمز OTP 3D Secure مشفر 100%</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الإيصال والفاتورة 🖨️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

