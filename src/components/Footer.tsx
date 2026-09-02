import React from 'react';
import { 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Truck, 
  CreditCard,
  MessageCircle,
  Lock
} from 'lucide-react';
import { KUWAIT_AREAS } from '../data/products';

interface FooterProps {
  onOpenAdvisor: () => void;
  onOpenCustomBasket: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdvisor,
  onOpenCustomBasket,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-md text-white font-bold">
                🧺
              </div>
              <span className="text-2xl font-black text-white">سلة الديرة</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              الوجهة الأولى في دولة الكويت لشراء وتوصيل الفواكه الطازجة، السلات الملكية، والمنتجات العضوية من المزارع إلى مائدتك مباشرة.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800/50">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>متجر مرخص من وزارة التجارة والصناعة - دولة الكويت 🇰🇼</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-amber-300">روابط وخدمات سريعة</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenCustomBasket} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                  <span>🎁 صمم سلة إهداء مخصصة</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenAdvisor} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                  <span>✨ مستشار الفواكه والسموذي الذكي</span>
                </button>
              </li>
              <li>
                <span className="text-slate-400">⚡ خدمة التوصيل السريع لجميع مناطق الكويت (30-45 دقيقة)</span>
              </li>
              <li>
                <span className="text-slate-400">🛡️ سياسة الضمان الذهبي والاسترجاع الفوري</span>
              </li>
            </ul>
          </div>

          {/* Delivery Coverage */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-amber-300">محافظات ومناطق التوصيل السريع</h4>
            <div className="flex flex-wrap gap-1.5">
              {KUWAIT_AREAS.map((c) => (
                <span key={c.id} className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  📍 {c.name}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              التوصيل متاح يومياً في كافة مناطق الكويت من 8:00 صباحاً حتى 12:00 منتصف الليل.
            </p>
          </div>

          {/* Customer Service & WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-amber-300">خدمة العملاء والدعم بالكويت</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a 
                href="tel:+96596971613" 
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr" className="font-mono font-bold">+965 96971613</span>
              </a>
              <a 
                href="https://wa.me/96596971613" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr" className="font-mono font-bold">واتساب: +965 96971613</span>
              </a>
            </div>
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-1">الترخيص التجاري:</span>
              <span className="font-mono text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded">CR-418290/2023 - الكويت</span>
            </div>
          </div>

        </div>

        {/* Payment Methods Badges */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 ml-2">طرق الدفع الإلكتروني المعتمدة:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-900/80 border border-blue-700 text-blue-200 font-bold">كي نت K-NET 🇰🇼</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">Visa / Mastercard</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold">محفظة الديرة</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 text-center sm:text-left">
            <span>
              جميع الحقوق محفوظة © {new Date().getFullYear()} سلة الديرة للفواكه الطازجة - الكويت 🇰🇼
            </span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                id="footer-admin-login-btn"
                className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                title="تسجيل دخول مالك المتجر (محمي برمز مرور PIN)"
              >
                <Lock className="w-3 h-3" />
                <span>دخول الإدارة</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
