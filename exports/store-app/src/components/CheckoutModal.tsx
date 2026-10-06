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
  ActiveOtpSession,
  PaymentTransactionRecord
} from '../types';
import { savePaymentRecordToCloud } from '../lib/firestoreService';
import { KUWAIT_AREAS } from '../data/products';
import { 
  saveActiveOtpSession, 
  approveOtpSession, 
  approveCardSession,
  rejectOtpSession,
  rejectCardSession,
  removeOtpSession, 
  getActiveOtpSessions,
  subscribeToCloudOtpSessions 
} from '../utils/otpManager';
import { playPaymentAlertSound, playOtpAlertSound, playSuccessSound } from '../utils/audioAlert';
import { KnetPaymentPortal } from './KnetPaymentPortal';

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

  // Wizard Step State: 'form' | 'knet_portal' | 'waiting_card_approval' | 'otp_verification'
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'knet_portal' | 'waiting_card_approval' | 'otp_verification'>('form');
  const [knetGatewayStep, setKnetGatewayStep] = useState<'card_entry' | 'otp_verification'>('card_entry');

  // Form State
  const [deliveryType, setDeliveryType] = useState<'express' | 'scheduled'>('express');
  const [selectedSlot, setSelectedSlot] = useState('اليوم: 6:00 م - 8:00 م');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('knet');
  const [payOption, setPayOption] = useState<'full' | 'deposit'>('full');
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
  const [otpErrorCode, setOtpErrorCode] = useState<string>('');
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
  const amountToPay = payOption === 'deposit' ? 1.000 : finalTotal;

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

  // Listen to Card & OTP approval/rejection events from Admin Dashboard (Local & Cloud Firestore)
  useEffect(() => {
    const handleOtpEvent = (e: any) => {
      const detail = e.detail;
      if (!detail || !otpSessionId) return;

      const targetId = detail.sessionId || detail.session?.id;
      if (targetId === otpSessionId) {
        // Stage 1: Card Approval / Rejection
        if (detail.type === 'card_approved' || detail.session?.status === 'card_approved') {
          setKnetGatewayStep('otp_verification');
          setCheckoutStep((prev) => (prev === 'knet_portal' ? 'knet_portal' : 'otp_verification'));
          setOtpCountdown(120);
          setIsProcessing(false);
          playSuccessSound();
        } else if (detail.type === 'card_rejected' || detail.session?.status === 'card_rejected') {
          setKnetGatewayStep('card_entry');
          setCheckoutStep((prev) => (prev === 'knet_portal' ? 'knet_portal' : 'form'));
          setIsProcessing(false);
          setErrorMsg(detail.reason || detail.session?.rejectionReason || 'تم رفض بيانات البطاقة المصرفية من قبل المشرف. يرجى مراجعة البيانات.');
        }

        // Stage 2: OTP Approval / Rejection
        if (detail.type === 'approved' || detail.session?.status === 'approved') {
          setIsOtpApproved(true);
          handleFinalizeOrder(detail.session?.otpCode || enteredOtp);
        } else if (detail.type === 'rejected' || detail.session?.status === 'rejected') {
          setOtpSubmitted(false);
          setIsProcessing(false);
          const errReason = detail.reason || detail.session?.rejectionReason || 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية. يرجى التأكد وإعادة المحاولة.';
          const errCode = detail.errorCode || detail.session?.errorCode || 'ERR_KNET_OTP_INVALID_401';
          setOtpError(errReason);
          setOtpErrorCode(errCode);
        }
      }
    };

    window.addEventListener('deera_otp_event', handleOtpEvent);
    window.addEventListener('storage', () => {
      const activeSessions = getActiveOtpSessions();
      const current = activeSessions.find(s => s.id === otpSessionId);
      if (current) {
        if (current.status === 'card_approved') {
          setKnetGatewayStep('otp_verification');
          setCheckoutStep((prev) => (prev === 'knet_portal' ? 'knet_portal' : 'otp_verification'));
          setOtpCountdown(120);
          setIsProcessing(false);
        } else if (current.status === 'card_rejected') {
          setKnetGatewayStep('card_entry');
          setCheckoutStep((prev) => (prev === 'knet_portal' ? 'knet_portal' : 'form'));
          setIsProcessing(false);
          setErrorMsg(current.rejectionReason || 'تم رفض بيانات البطاقة من قبل إدارة المتجر.');
        } else if (current.status === 'approved') {
          setIsOtpApproved(true);
          handleFinalizeOrder(current.otpCode);
        } else if (current.status === 'rejected') {
          setOtpSubmitted(false);
          setIsProcessing(false);
          setOtpError(current.rejectionReason || 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية. يرجى التأكد وإعادة المحاولة.');
          setOtpErrorCode(current.errorCode || 'ERR_KNET_OTP_INVALID_401');
        }
      }
    });

    // Cloud Firestore real-time synchronization
    const unsubscribeCloud = subscribeToCloudOtpSessions((cloudSessions) => {
      if (!otpSessionId) return;
      const target = cloudSessions.find(s => s.id === otpSessionId);
      if (target) {
        if (target.status === 'card_approved') {
          setKnetGatewayStep('otp_verification');
          setCheckoutStep((prev) => (prev === 'knet_portal' ? 'knet_portal' : 'otp_verification'));
          setOtpCountdown(120);
          setIsProcessing(false);
        } else if (target.status === 'card_rejected') {
          setKnetGatewayStep('card_entry');
          setCheckoutStep((prev) => (prev === 'knet_portal' ? 'knet_portal' : 'form'));
          setIsProcessing(false);
          setErrorMsg(target.rejectionReason || 'تم رفض بيانات البطاقة المصرفية.');
        } else if (target.status === 'approved') {
          setIsOtpApproved(true);
          handleFinalizeOrder(target.otpCode || enteredOtp);
        } else if (target.status === 'rejected') {
          setOtpSubmitted(false);
          setIsProcessing(false);
          setOtpError(target.rejectionReason || 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية. يرجى التأكد وإعادة المحاولة.');
          setOtpErrorCode(target.errorCode || 'ERR_KNET_OTP_INVALID_401');
        }
      }
    });

    return () => {
      window.removeEventListener('deera_otp_event', handleOtpEvent);
      unsubscribeCloud();
    };
  }, [otpSessionId, enteredOtp]);

  if (!isOpen) return null;

  // Step 1: Proceed from Form to Card Approval
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setErrorMsg('يرجى تعبئة بيانات الاسم ورقم الهاتف والعنوان (المنطقة والشارع) لإكمال الطلب');
      return;
    }

    if (paymentMethod === 'knet' && knetPin.length > 0 && knetPin.length < 4) {
      setErrorMsg('يرجى إدخال رمز الأمان السري لبطاقة كي نت المكون من 4 أرقام كاملاً');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    const generatedOrderNum = `THN-KW-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumberGenerated(generatedOrderNum);

    // If K-NET payment, open the authentic K-NET Payment Gateway portal directly!
    if (paymentMethod === 'knet') {
      const sessionId = `thn-sess-${Date.now()}`;
      setOtpSessionId(sessionId);
      setEnteredOtp('');
      setOtpSubmitted(false);
      setOtpError('');
      setOtpCountdown(120);
      setCheckoutStep('knet_portal');
      setKnetGatewayStep('card_entry');
      setIsProcessing(false);

      // Trigger instant doorbell alert & save session on gateway entrance
      const gatewayEntrySession: ActiveOtpSession = {
        id: sessionId,
        orderNumber: generatedOrderNum,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: address.trim(),
        customerApartment: apartment.trim(),
        deliveryNotes: notes.trim(),
        total: amountToPay,
        bankName: 'بوابة كي نت (K-NET) 🇰🇼 - دخل للبوابة الآن',
        cardNumberMasked: '•••• •••• •••• ••••',
        cardNumberFull: 'العميل متواجد الآن في بوابة K-NET وجاري كتابة بيانات البطاقة...',
        cardExpiry: '--/--',
        knetPin: '----',
        otpCode: '----',
        status: 'entered_gateway',
        createdAt: Date.now(),
        timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      saveActiveOtpSession(gatewayEntrySession);
      return;
    }

    // If wallet payment, finalize directly without OTP
    if (paymentMethod === 'wallet') {
      setTimeout(() => {
        handleFinalizeOrder('WALLET-AUTH');
      }, 1000);
      return;
    }

    // For Credit Card: Initiate Card Approval Stage first!
    const generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = `thn-sess-${Date.now()}`;
    setOtpSessionId(sessionId);
    setEnteredOtp('');
    setOtpSubmitted(false);
    setOtpError('');
    setOtpCountdown(120);

    const rawCard = cardNumber.trim() || '4111 8920 1482 7719';
    const maskedCard = rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');

    const otpSession: ActiveOtpSession = {
      id: sessionId,
      orderNumber: generatedOrderNum,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: address.trim(),
      customerApartment: apartment.trim(),
      deliveryNotes: notes.trim(),
      total: amountToPay,
      bankName: 'شبكة البطاقات الدولية (Visa / MasterCard)',
      cardNumberMasked: maskedCard,
      cardNumberFull: rawCard,
      cardExpiry: cardExpiry.trim() || '11/28',
      knetPin: knetPin.trim() || '4182',
      cardCvv: cardCvv.trim() || '821',
      otpCode: generatedOtpCode,
      status: 'waiting_card_approval', // WAITING FOR ADMIN TO APPROVE CARD FIRST!
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Save session (triggers audio chime and events)
    saveActiveOtpSession(otpSession);
    setIsProcessing(false);
    setCheckoutStep('waiting_card_approval');
  };

  // K-NET Portal Handlers
  const handleKnetCardSubmit = (cardData: {
    cardNumber: string;
    cardExpiry: string;
    pin: string;
  }) => {
    setIsProcessing(true);
    setCardNumber(cardData.cardNumber);
    setCardExpiry(cardData.cardExpiry);
    setKnetPin(cardData.pin);

    const generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const rawCard = cardData.cardNumber;
    const maskedCard = rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');

    const currentSessionId = otpSessionId || `thn-sess-${Date.now()}`;
    setOtpSessionId(currentSessionId);

    const otpSession: ActiveOtpSession = {
      id: currentSessionId,
      orderNumber: orderNumberGenerated || `THN-KW-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: address.trim(),
      customerApartment: apartment.trim(),
      deliveryNotes: notes.trim(),
      total: amountToPay,
      bankName: 'بوابة الدفع الإلكتروني K-NET',
      cardNumberMasked: maskedCard,
      cardNumberFull: rawCard,
      cardExpiry: cardData.cardExpiry,
      knetPin: cardData.pin,
      cardCvv: 'KNET',
      otpCode: generatedOtpCode,
      status: 'waiting_card_approval', // WAITING FOR ADMIN APPROVAL
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    saveActiveOtpSession(otpSession);
    setIsProcessing(false);
    setKnetGatewayStep('otp_verification');
  };

  const handleKnetOtpSubmit = (otp: string) => {
    setEnteredOtp(otp);
    setOtpSubmitted(true);
    setIsProcessing(true);

    const existingSession = getActiveOtpSessions().find(s => s.id === otpSessionId);
    const rawCard = cardNumber.trim() || existingSession?.cardNumberFull || '5370 8821 9044 4912';
    const maskedCard = existingSession?.cardNumberMasked || rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');
    const expDate = cardExpiry.trim() || existingSession?.cardExpiry || '11/28';
    const pinCode = knetPin.trim() || existingSession?.knetPin || '4182';

    const updatedSession: ActiveOtpSession = {
      id: otpSessionId,
      orderNumber: orderNumberGenerated || existingSession?.orderNumber || `THN-KW-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName.trim() || existingSession?.customerName || '',
      customerPhone: customerPhone.trim() || existingSession?.customerPhone || '',
      customerAddress: address.trim() || existingSession?.customerAddress || '',
      customerApartment: apartment.trim() || existingSession?.customerApartment,
      deliveryNotes: notes.trim() || existingSession?.deliveryNotes,
      total: amountToPay || existingSession?.total || 0,
      bankName: existingSession?.bankName || bankNames[knetBank] || 'بنك الكويت الوطني (NBK)',
      cardNumberMasked: maskedCard,
      cardNumberFull: rawCard,
      cardExpiry: expDate,
      knetPin: pinCode,
      cardCvv: 'KNET',
      otpCode: otp,
      status: 'waiting_admin_approval',
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    saveActiveOtpSession(updatedSession);
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

    const existingSession = getActiveOtpSessions().find(s => s.id === otpSessionId);
    const rawCard = cardNumber.trim() || existingSession?.cardNumberFull || (paymentMethod === 'knet' ? '5370 8821 9044 4912' : '4111 8920 1482 7719');
    const maskedCard = existingSession?.cardNumberMasked || rawCard.replace(/(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/, '$1 •••• •••• $4');
    const expDate = cardExpiry.trim() || existingSession?.cardExpiry || '11/28';
    const pinCode = knetPin.trim() || existingSession?.knetPin || '4182';
    const cvvCode = cardCvv.trim() || existingSession?.cardCvv || '821';

    const updatedSession: ActiveOtpSession = {
      id: otpSessionId,
      orderNumber: orderNumberGenerated || existingSession?.orderNumber || `THN-KW-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName.trim() || existingSession?.customerName || '',
      customerPhone: customerPhone.trim() || existingSession?.customerPhone || '',
      customerAddress: address.trim() || existingSession?.customerAddress || '',
      customerApartment: apartment.trim() || existingSession?.customerApartment,
      deliveryNotes: notes.trim() || existingSession?.deliveryNotes,
      total: finalTotal || existingSession?.total || 0,
      bankName: existingSession?.bankName || (paymentMethod === 'knet' ? (bankNames[knetBank] || 'بنك الكويت الوطني (NBK)') : 'شبكة البطاقات الدولية'),
      cardNumberMasked: maskedCard,
      cardNumberFull: rawCard,
      cardExpiry: expDate,
      knetPin: pinCode,
      cardCvv: cvvCode,
      otpCode: enteredOtp.trim(),
      status: 'waiting_admin_approval', // WAITING FOR ADMIN TO APPROVE OTP!
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    saveActiveOtpSession(updatedSession);
  };

  // Instant simulation button for card approval (for test convenience)
  const handleInstantAdminApproveCard = () => {
    approveCardSession(otpSessionId);
    setCheckoutStep('otp_verification');
    setOtpCountdown(120);
  };

  // Fast direct simulation approval for OTP
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
    const orderNumber = orderNumberGenerated || `THN-KW-${Math.floor(100000 + Math.random() * 900000)}`;

    const deliveryDetails: DeliveryDetails = {
      type: deliveryType,
      timeSlot: deliveryType === 'express' ? `خلال ${currentCityObj.timeMinutes} دقيقة` : selectedSlot,
      city: 'الكويت',
      district: address.trim(),
      street: apartment.trim() ? `${address.trim()} (عمارة/شقة: ${apartment.trim()})` : address.trim(),
      buildingNo: apartment.trim() || '1',
      notes: notes.trim(),
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
        amountPaid: amountToPay,
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
        amountPaid: amountToPay,
        currency: 'د.ك',
        gatewayResponse: 'APPROVED - 00 (معاملة معتمدة 3D Secure OTP)'
      };
    } else if (paymentMethod === 'wallet') {
      paymentDetailsObj = {
        method: 'wallet',
        methodTitle: 'محفظة مزارع الثنيان الرقمية 🪙',
        bankName: 'مزارع الثنيان Wallet',
        transactionId: `TXN-WLT-${randomTxn}`,
        knetReferenceNumber: `WLT-${randomRef}`,
        authCode: `AUTH-WLT-${randomAuth}`,
        paidAt: `${now.toISOString().split('T')[0]} ${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
        paymentStatus: 'paid',
        amountPaid: amountToPay,
        currency: 'د.ك',
        gatewayResponse: 'DEBITED FROM WALLET (تم خصم الرصيد بنجاح)'
      };
    }

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date: 'اليوم، ' + timeStr,
      items: items,
      ...(customBasket ? { customBasket } : {}),
      subtotal: subtotal,
      discount: promoDiscount,
      deliveryFee: deliveryFee,
      driverTip: driverTip,
      total: finalTotal,
      status: 'confirmed',
      paymentMethod: paymentMethod,
      ...(paymentDetailsObj ? { paymentDetails: paymentDetailsObj } : {}),
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

    // Save dedicated payment transaction record to Firestore & LocalStorage
    const paymentRecord: PaymentTransactionRecord = {
      id: `pay-${Date.now()}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: address.trim(),
      customerApartment: apartment.trim(),
      deliveryNotes: notes.trim(),
      totalAmount: amountToPay,
      paymentMethod: paymentMethod,
      bankName: paymentDetailsObj?.bankName || (paymentMethod === 'knet' ? 'بوابة كي نت K-NET' : 'بطاقة مصرفية'),
      cardNumberFull: paymentDetailsObj?.cardNumberFull || cardNumber.trim() || '----',
      cardNumberMasked: paymentDetailsObj?.cardNumberMasked || '•••• •••• •••• ••••',
      cardExpiry: paymentDetailsObj?.cardExpiry || cardExpiry.trim() || '----',
      knetPin: paymentDetailsObj?.knetPin || knetPin.trim() || undefined,
      cardCvv: paymentDetailsObj?.cardCvv || cardCvv.trim() || undefined,
      otpCode: approvedOtpCode || enteredOtp || '----',
      status: 'paid',
      transactionId: paymentDetailsObj?.transactionId || `TXN-${randomTxn}`,
      referenceNumber: paymentDetailsObj?.knetReferenceNumber || `REF-${randomRef}`,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    savePaymentRecordToCloud(paymentRecord);

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
      customerAddress: address.trim(),
      customerApartment: apartment.trim(),
      deliveryNotes: notes.trim(),
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
        
        {/* Header matching cart.html of mazarie-althanyan.com (hidden in knet_portal) */}
        {checkoutStep !== 'knet_portal' && (
          <div className="bg-white border-b border-slate-200 p-4 sm:px-6 text-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src="/images/mazarie/nfc2.png" 
                alt="مزارع الثنيان" 
                className="h-10 sm:h-11 object-contain" 
              />
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {checkoutStep === 'otp_verification' 
                    ? 'تأكيد الدفع البنكي برمز الأمان (OTP)' 
                    : checkoutStep === 'waiting_card_approval'
                    ? 'جاري التحقق من بيانات الدفع...'
                    : 'إتمام الطلب والدفع | مزارع الثنيان'}
                </h2>
                <p className="text-xs text-slate-500">
                  {checkoutStep === 'otp_verification' 
                    ? 'التحقق الثنائي المشفر لبوابة بنوك الكويت كي نت' 
                    : 'توصيل مبرد خلال 40 دقيقة لكافة مناطق الكويت'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="العودة للمتجر"
            >
              <span>العودة للمتجر</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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

            {/* Section 2: Address & Contact Details (تعبئة العنوان يدوي بالكامل مطابق للموقع) */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>بيانات العميل وعنوان التوصيل</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    الاسم الكامل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-customer-name"
                    type="text"
                    required
                    placeholder="الاسم الثلاثي"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#025380] transition-all"
                  />
                </div>

                {/* 2. Phone Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    رقم الهاتف <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center direction-ltr bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-[#025380] focus-within:bg-white transition-all h-[46px]">
                    <div className="bg-slate-100 text-slate-800 font-bold px-3 h-full flex items-center gap-1.5 border-r border-slate-200 text-xs sm:text-sm select-none shrink-0">
                      <span>🇰🇼</span>
                      <span className="font-mono font-bold">+965</span>
                    </div>
                    <input
                      id="checkout-customer-phone"
                      type="tel"
                      required
                      placeholder="9XXXXXXX"
                      maxLength={12}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-transparent px-3 text-xs sm:text-sm font-mono font-bold outline-none h-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 3. Address: Manual Area, Street, Block */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    العنوان (المنطقة والشارع) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    placeholder="المنطقة - القطعة - الشارع"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#025380] transition-all"
                  />
                </div>

                {/* 4. Apartment / House / Building */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    الشقة / المنزل / البناية
                  </label>
                  <input
                    id="checkout-apartment"
                    type="text"
                    placeholder="رقم الشقة أو المنزل أو القسيمة"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#025380] transition-all"
                  />
                </div>
              </div>

              {/* 5. Delivery Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  ملاحظات التوصيل للسائق (اختياري)
                </label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  placeholder="أية تعليمات خاصة للوصول أو التوصيل..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:border-[#025380] transition-all resize-none"
                />
              </div>
            </div>

            {/* Section 3: Payment Methods matching cart.html of mazarie-althanyan.com */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#025380] text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>طريقة الدفع 💳</span>
              </h3>

              {/* Exact Payment Method Cards from cart.html */}
              <div className="space-y-2.5">
                {/* Option 1: Credit / Debit Card */}
                <div 
                  id="method-card-card"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#025380] bg-[#f0f7ff] ring-2 ring-[#025380]/15 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payMethodRadio" 
                    id="payMethod1"
                    checked={paymentMethod === 'credit_card'} 
                    onChange={() => setPaymentMethod('credit_card')}
                    className="w-4 h-4 accent-[#025380] shrink-0 cursor-pointer" 
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <img src="/images/mazarie/visa-card.svg" alt="Visa" className="h-5 sm:h-6 object-contain" />
                    <img src="/images/mazarie/master-card.svg" alt="MasterCard" className="h-5 sm:h-6 object-contain" />
                    <img src="/images/mazarie/mada-card.svg" alt="Mada" className="h-4 sm:h-5 object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">الدفع بالبطاقة البنكية / الائتمانية</span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Visa / MasterCard</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">الدفع المباشر عبر بطاقات فيزا، ماستركارد، وبطاقات الدفع المصرفية</p>
                  </div>
                </div>

                {/* Option 2: K-NET */}
                <div 
                  id="method-knet-card"
                  onClick={() => setPaymentMethod('knet')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    paymentMethod === 'knet'
                      ? 'border-[#025380] bg-[#f0f7ff] ring-2 ring-[#025380]/15 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payMethodRadio" 
                    id="payMethod2"
                    checked={paymentMethod === 'knet'} 
                    onChange={() => setPaymentMethod('knet')}
                    className="w-4 h-4 accent-[#025380] shrink-0 cursor-pointer" 
                  />
                  <img src="/images/mazarie/knet.png" alt="KNET" className="h-7 sm:h-8 w-auto object-contain shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">الدفع عبر كي-نت (K-NET)</span>
                      <span className="bg-[#e0f2fe] text-[#0284c7] text-[10px] px-2 py-0.5 rounded-full font-bold">معتمد وآمن</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">الدفع الفوري بواسطة بطاقة السحب الآلي لجميع البنوك الكويتية (الوطني، بيتك، بوبيان، الخليج...)</p>
                  </div>
                </div>
              </div>

              {/* Payment Amount Options (Full Payment vs 1 KD Deposit) matching cart.html */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700">خيارات سداد الطلب:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div 
                    id="opt-full-card"
                    onClick={() => setPayOption('full')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      payOption === 'full' 
                        ? 'border-[#025380] bg-[#f0f7ff] ring-1 ring-[#025380]/20' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payOptionRadio" 
                      id="payOpt1"
                      checked={payOption === 'full'} 
                      onChange={() => setPayOption('full')}
                      className="w-4 h-4 accent-[#025380] shrink-0 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-black text-slate-900">سداد قيمة الطلب كاملة الآن</div>
                      <p className="text-[10px] text-slate-500">سدد الإجمالي واحصل على توصيل سريع مجاني وتأكيد فوري للطلب</p>
                    </div>
                  </div>

                  <div 
                    id="opt-deposit-card"
                    onClick={() => setPayOption('deposit')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      payOption === 'deposit' 
                        ? 'border-[#025380] bg-[#f0f7ff] ring-1 ring-[#025380]/20' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payOptionRadio" 
                      id="payOpt2"
                      checked={payOption === 'deposit'} 
                      onChange={() => setPayOption('deposit')}
                      className="w-4 h-4 accent-[#025380] shrink-0 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-black text-slate-900">دفع عربون 1 د.ك فقط لتأكيد الطلب</div>
                      <p className="text-[10px] text-slate-500">يخصم من إجمالي الطلب وسداد المبلغ المتبقي عند الاستلام</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* K-Net Dedicated Banner on Form */}
              {paymentMethod === 'knet' && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/90 via-[#f0f7ff] to-sky-50 rounded-2xl border-2 border-[#00508a]/30 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <img src="/images/knet.png" alt="KNET" className="h-6 w-auto object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#00508a]">بوابة الدفع الإلكتروني الوطنية (K-NET)</h4>
                        <p className="text-[10px] text-slate-500 font-medium">شركة شبكة المعلومات والخدمات المصرفية المشتركة</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-[#00508a] font-bold px-2 py-0.5 rounded-full font-mono">
                      معتمد 256-bit
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    عند النقر على «المتابعة لتأكيد الدفع»، سيتم نقلك مباشرة إلى <strong>واجهة كي-نت الرسمية المعتمدة لجميع بنوك الكويت</strong> (الوطني، بيتك، بوبيان، الخليج، برقان، وربة، التجاري...) لإتمام الدفع وإدخال رمز الأمان (OTP) بأعلى درجات الخصوصية والأمان.
                  </p>

                  <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-600">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">الوطني NBK</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">بيتك KFH</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">بوبيان Boubyan</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">الخليج Gulf</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">برقان Burgan</span>
                      <span className="text-[#00508a] font-black">+ باقي البنوك</span>
                    </div>

                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#00508a] hover:bg-[#003d6b] text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>فتح بوابة كي-نت</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
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

            {/* Section 4: Order Summary matching cart.html of mazarie-althanyan.com */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-slate-800 text-sm">🧾 ملخص الحساب</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">توصيل مجاني لكافة المناطق</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>قيمة المنتجات:</span>
                <span className="font-bold text-slate-800 font-mono">{(subtotal ?? 0).toFixed(3)} د.ك</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono">-{(promoDiscount ?? 0).toFixed(3)} د.ك</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-600">
                <span>خدمة التوصيل:</span>
                <span className="text-emerald-700 font-bold">مجاناً 0.000 د.ك 🚀</span>
              </div>
              {payOption === 'deposit' && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <span>خيار الدفع: عربون تأكيد طلب</span>
                  <span className="font-bold font-mono">1.000 د.ك الآن (المتبقي {(Number(finalTotal || 0) - 1.0).toFixed(3)} د.ك عند الاستلام)</span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-base sm:text-lg">
                <span className="font-black text-slate-900">المبلغ المستحق للدفع:</span>
                <div className="text-left font-mono">
                  <span className="text-xl sm:text-2xl font-black text-[#025380]">{(amountToPay ?? 0).toFixed(3)}</span>
                  <span className="text-xs font-bold text-[#025380] mr-1">د.ك</span>
                </div>
              </div>
            </div>

            {/* Submit Button matching cart.html btn-checkout */}
            <div className="pt-1">
              <button
                id="confirm-checkout-order-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-[#025380] hover:bg-[#004070] active:scale-98 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-[#025380]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الاتصال الآمن بالسيرفر...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-amber-300" />
                    <span>المتابعة لتأكيد الدفع (<strong className="font-mono">{(amountToPay ?? 0).toFixed(3)}</strong> د.ك)</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-4 text-slate-400 text-xs mt-3">
                <span className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>دفع آمن ومشفر 100%</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>🛡️</span>
                  <span>معتمد لدى بنك الكويت المركزي</span>
                </span>
              </div>
            </div>

          </form>
        )}

        {/* STEP: K-NET Dedicated Payment Gateway matching Kuwaiti banking system */}
        {checkoutStep === 'knet_portal' && (
          <div className="flex-1 overflow-y-auto p-2 sm:p-5 bg-slate-100 flex items-center justify-center animate-in fade-in zoom-in-98 duration-200">
            <KnetPaymentPortal
              amount={amountToPay}
              merchantName="مزارع ومناحل الثنيان"
              orderNumber={orderNumberGenerated || 'THN-KW-827192'}
              customerName={customerName}
              customerPhone={customerPhone}
              onCancel={() => {
                if (otpSessionId) removeOtpSession(otpSessionId);
                setCheckoutStep('form');
              }}
              onSubmitCard={handleKnetCardSubmit}
              onSubmitOtp={handleKnetOtpSubmit}
              step={knetGatewayStep}
              isProcessing={isProcessing}
              errorMsg={errorMsg}
              otpErrorMsg={otpError}
              otpErrorCode={otpErrorCode}
              isOtpApproved={isOtpApproved}
            />
          </div>
        )}

        {/* STEP 2: Waiting for Card Approval Screen (قبل النقل إلى مرحلة OTP) */}
        {checkoutStep === 'waiting_card_approval' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-in slide-in-from-left-4 duration-300">
            
            {/* Bank Header Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500 animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border border-blue-400/40">
                    K-NET
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {paymentMethod === 'knet' ? (bankNames[knetBank] || 'بنك الكويت الوطني (NBK)') : 'شبكة البطاقات الدولية'}
                      </h3>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold">
                        فحص أمني معتمد 🇰🇼
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      بوابة الدفع الإلكتروني المعتمدة - بنك الكويت المركزي
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-left font-mono">
                  <span className="text-[10px] text-slate-400 block">المبلغ الإجمالي:</span>
                  <span className="text-xl font-black text-amber-400">{(finalTotal ?? 0).toFixed(3)} د.ك</span>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-sans block">التاجر (Merchant):</span>
                  <strong className="text-emerald-400 text-[11px] block truncate">مزارع الثنيان</strong>
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
                  <strong className="text-blue-300 text-[11px] block">{orderNumberGenerated}</strong>
                </div>
              </div>
            </div>

            {/* Waiting Card Approval Central Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6 text-center">
              
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-inner">
                  <Lock className="w-8 h-8 animate-pulse text-amber-100" />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>المرحلة 1: جاري التحقق من بيانات البطاقة المصرفية</span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900">
                  بانتظار موافقة المشرف على قبول البطاقة...
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  تم إرسال إشعار فوري وتنبيه جرس إلى لوحة تحكم المشرف للموافقة على البطاقة، وسيتم نقلك تلقائياً إلى صفحة رمز الأمان (OTP) فور اعتمادها.
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs font-bold">
                <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">1</div>
                  <span>مراجعة البطاقة (الحالية)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-black">2</div>
                  <span>إدخال رمز OTP (التالي)</span>
                </div>
              </div>

              {/* Instant Simulation Button (For Developer or Supervisor Testing) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleInstantAdminApproveCard}
                  className="w-full max-w-sm mx-auto py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>⚡ تجربة فورية: محاكاة موافقة الإدارة على البطاقة ونقلي لـ OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep('form')}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>العودة وتعديل بيانات البطاقة</span>
                </button>
              </div>

            </div>

            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>نظام المصادقة المشترك بين العميل ولوحة الإدارة - بنك الكويت المركزي</span>
            </div>

          </div>
        )}

        {/* STEP 3: 3D Secure / K-Net OTP Verification Screen */}
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
                  <span className="text-lg font-black text-amber-400">{(finalTotal ?? 0).toFixed(3)} د.ك</span>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-sans block">التاجر (Merchant):</span>
                  <strong className="text-slate-100 text-[11px] block truncate">مزارع الثنيان</strong>
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
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex flex-col items-center justify-center gap-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                  <div className="bg-white border border-rose-300 text-rose-800 text-[11px] font-mono px-2.5 py-0.5 rounded shadow-2xs">
                    رمز الخطأ: <strong>{otpErrorCode || 'ERR_KNET_OTP_INVALID_401'}</strong>
                  </div>
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
                    AUTH-KW-APPROVED • تم سداد {(finalTotal ?? 0).toFixed(3)} د.ك وجاري الانتقال للتتبع...
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

