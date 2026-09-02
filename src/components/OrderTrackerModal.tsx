import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Sparkles, 
  ShieldCheck, 
  Share2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
  onAdvanceStage?: (orderId: string) => void;
}

const STAGES = [
  { id: 'confirmed', title: 'تم استلام وتأكيد الطلب', icon: '📝', desc: 'تم استلام طلبك وبدأ معالجته في المستودع المبرد' },
  { id: 'preparing', title: 'جاري الفرز والتعقيم المبرد', icon: '🧺', desc: 'يتم انتقاء أجود حبات الفواكه وتغليفها بعناية فائقة' },
  { id: 'on_way', title: 'في مسار التوصيل السريع 🚀', icon: '🚚', desc: 'الطلب في الطريق إليك بسيارة مبردة لضمان أعلى درجات الطزاجة' },
  { id: 'delivered', title: 'تم التوصيل لباب بيتك', icon: '🎉', desc: 'وصلت سلتك الطازجة! بالهناء والعافية' },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  onClose,
  onAdvanceStage
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(32);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'confirmed') setCurrentStageIdx(0);
    else if (order.status === 'preparing') setCurrentStageIdx(1);
    else if (order.status === 'on_way') setCurrentStageIdx(2);
    else if (order.status === 'delivered') setCurrentStageIdx(3);
  }, [order]);

  // Simulated countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesRemaining(prev => Math.max(0, prev - 1));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  if (!order) return null;

  const handleAdvance = () => {
    const nextIdx = (currentStageIdx + 1) % 4;
    setCurrentStageIdx(nextIdx);
    if (onAdvanceStage) {
      onAdvanceStage(order.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 sm:px-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl shadow-md font-bold">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">تتبع التوصيل السريع المباشر</h2>
                <span className="bg-emerald-700/80 text-amber-200 text-xs px-2 py-0.5 rounded-md font-mono">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                وجهة التوصيل: {order.deliveryDetails.city} - {order.deliveryDetails.district}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* Estimated Time Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50/40 p-5 rounded-3xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-right">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-700/20">
                ⏱️
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">الوقت المتوقع لوصول الفواكه الطازجة</p>
                <h3 className="text-2xl font-black text-emerald-950">
                  {currentStageIdx === 3 ? 'تم التوصيل بنجاح 🎉' : `خلال ${minutesRemaining} دقيقة تقريباً`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdvance}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                title="اضغط لمحاكاة المراحل التالية للتوصيل"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>محاكاة المرحلة التالية</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulated Map Box */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 h-48 sm:h-56 shadow-inner flex items-center justify-center">
            
            {/* Map Background Grid Simulation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Simulated Road Path */}
            <svg className="absolute inset-0 w-full h-full stroke-emerald-500/50 stroke-dasharray-4 stroke-2" fill="none">
              <path d="M 60 160 Q 180 80, 320 120 T 560 60" />
            </svg>

            {/* Store Origin Marker */}
            <div className="absolute left-8 bottom-6 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-lg ring-4 ring-emerald-900">
                🏪
              </div>
              <span className="text-[10px] text-emerald-300 font-bold mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded">
                مستودع الديرة
              </span>
            </div>

            {/* Live Moving Van */}
            <div 
              className="absolute transition-all duration-1000 flex flex-col items-center"
              style={{
                left: currentStageIdx === 0 ? '15%' : currentStageIdx === 1 ? '35%' : currentStageIdx === 2 ? '65%' : '85%',
                top: currentStageIdx === 0 ? '60%' : currentStageIdx === 1 ? '45%' : currentStageIdx === 2 ? '35%' : '20%',
              }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-xl ring-4 ring-amber-300/30 animate-pulse">
                  🚚
                </div>
                <span className="absolute -top-6 -right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow whitespace-nowrap">
                  مبردة 4°C
                </span>
              </div>
            </div>

            {/* Destination Marker */}
            <div className="absolute right-8 top-6 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-lg ring-4 ring-rose-900 animate-bounce">
                📍
              </div>
              <span className="text-[10px] text-rose-300 font-bold mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded">
                موقعك (منطقة {order.deliveryDetails.district})
              </span>
            </div>

            {/* Bottom Live status text */}
            <div className="absolute bottom-2 inset-x-0 text-center">
              <span className="text-[11px] bg-slate-900/90 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 shadow backdrop-blur-xs font-semibold">
                🛰️ تتبع الطلب المباشر • سيارة مجهزة ومبردة (4°C) لضمان الطزاجة
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">مراحل إعداد وتوصيل الطلب</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div 
                    key={stage.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/20'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{stage.icon}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">{stage.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Store Cold Delivery & Customer Support Card */}
          <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 text-sm">خدمة التوصيل السريع المبرد</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    حرارة التبريد 4°C ❄️
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  يصلك طلبك في صناديق معقمة محكمة الإغلاق مع فريق خدمة عملاء جاهز لمساعدتك دائماً
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:+96596971613"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>خدمة العملاء</span>
              </a>

              <a
                href="https://wa.me/96596971613"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>واتساب الدعم</span>
              </a>
            </div>
          </div>

          {/* Order Items Snapshot */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs mb-2">محتويات السلة الطازجة في هذا الطلب:</h4>
            <div className="space-y-1.5 text-xs">
              {order.customBasket && (
                <div className="flex items-center justify-between text-amber-900 bg-amber-50 p-2 rounded-xl">
                  <span>🎁 {order.customBasket.sizeName} ({order.customBasket.selectedFruits.length} أصناف)</span>
                  <span className="font-bold">سلة مخصصة</span>
                </div>
              )}
              {order.items.map((it) => (
                <div key={it.product.id} className="flex items-center justify-between text-slate-600 p-2 rounded-xl bg-slate-50">
                  <span>{it.quantity}x {it.product.name}</span>
                  <span className="font-bold text-slate-800">{(it.product.price * it.quantity).toFixed(3)} د.ك</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:px-8 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>طريقة الدفع: </span>
            <strong className="text-slate-800 font-bold">
              {order.paymentMethod === 'knet' ? 'كي نت (K-Net) 🇰🇼' :
               order.paymentMethod === 'credit_card' ? 'فيزا / ماستركارد' : 
               order.paymentMethod === 'wallet' ? 'محفظة الديرة' : 'دفع إلكتروني'}
            </strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق المتابعة
          </button>
        </div>

      </div>
    </div>
  );
};
