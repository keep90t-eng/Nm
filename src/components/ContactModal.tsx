import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Send, 
  CheckCircle2 
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#102d1f] via-[#163e2b] to-[#1d4d36] p-5 sm:p-6 text-white flex items-center justify-between border-b border-[#2b5940]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-md font-bold">
              📞
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">تواصل مع مزارع ومناحل الثنيان</h2>
              <p className="text-xs text-amber-200">خدمة العملاء والطلبات الخاصة على مدار الساعة</p>
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
        <div className="p-6 space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {/* Quick Channels */}
          <div className="grid grid-cols-2 gap-2.5">
            <a 
              href="tel:+9651855888" 
              className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-right transition-colors flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">الرقم الموحد:</span>
                <strong className="text-emerald-950 text-xs font-mono">1855888</strong>
              </div>
            </a>

            <a 
              href="https://wa.me/96596971613" 
              target="_blank" 
              rel="noreferrer"
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-right transition-colors flex items-center gap-2.5 text-emerald-900"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block font-sans">واتساب المزرعة:</span>
                <strong className="text-xs font-mono">+965 96971613</strong>
              </div>
            </a>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>البريد الإلكتروني: <strong className="text-slate-900">sales@althenayanhoney.com.kw</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>مزارع ومناحل الكويت: منطقة مزارع الوفرة والعبدلي</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>أوقات العمل والتوصيل: يومياً من 8:00 صباحاً حتى منتصف الليل</span>
            </div>
          </div>

          {/* Contact Form */}
          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 text-sm">تم إرسال رسالتكم بنجاح!</h4>
              <p className="text-xs text-emerald-700">سيقوم فريق مزارع الثنيان بالتواصل معكم فوراً.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">الاسم الكريم *</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">رقم الهاتف (الكويت) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+965 XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">الاستفسار أو الطلب الخاص *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتب استفسارك عن الأسماك، الذبائح، العسل، أو طلبات الديوانية..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#153e2b] hover:bg-[#102d1f] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>إرسال الرسالة</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
