import React from 'react';
import { 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Truck, 
  CreditCard,
  Lock,
  Award
} from 'lucide-react';

interface FooterProps {
  onOpenAdvisor?: () => void;
  onOpenCustomBasket?: () => void;
  onOpenAdmin?: () => void;
  onOpenOrders?: () => void;
  onOpenAboutUs?: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenOrders,
  onOpenAboutUs,
  onOpenContact
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 text-slate-700">
      
      {/* Top Features Strip */}
      <div className="border-b border-slate-100 bg-[#f8fafc] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 space-y-1">
            <span className="text-2xl">🚚</span>
            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">توصيل سريع مبرد</h5>
            <p className="text-[11px] text-slate-500">خلال 40 دقيقة لباب منزلك</p>
          </div>
          <div className="p-3 space-y-1">
            <span className="text-2xl">❄️</span>
            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">نقل مخصص (4°C)</h5>
            <p className="text-[11px] text-slate-500">سيارات فان مجهزة ومبردة</p>
          </div>
          <div className="p-3 space-y-1">
            <span className="text-2xl">🔒</span>
            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">دفع آمن 100%</h5>
            <p className="text-[11px] text-slate-500">K-Net، فيزا، ماستركارد</p>
          </div>
          <div className="p-3 space-y-1">
            <span className="text-2xl">🌿</span>
            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">إنتاج مزارع طبيعي</h5>
            <p className="text-[11px] text-slate-500">طازج يومياً وخالٍ من الهرمونات</p>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/mazarie/nfc2.png" 
              alt="مزارع الثنيان" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h3 className="font-black text-slate-900 text-base">مزارع الثنيان</h3>
              <p className="text-xs text-slate-500">الموقع الرسمي للتسوق المباشر والطلب أونلاين</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600">
            {onOpenAboutUs && (
              <button onClick={onOpenAboutUs} className="hover:text-[#025380] transition-colors cursor-pointer">
                من نحن
              </button>
            )}
            {onOpenContact && (
              <button onClick={onOpenContact} className="hover:text-[#025380] transition-colors cursor-pointer">
                اتصل بنا
              </button>
            )}
            <a href="#" className="hover:text-[#025380] transition-colors" onClick={(e) => e.preventDefault()}>
              الشروط والأحكام
            </a>
            <a href="#" className="hover:text-[#025380] transition-colors" onClick={(e) => e.preventDefault()}>
              سياسة الخصوصية
            </a>
          </div>

          {/* Social Links & Payment Badges */}
          <div className="flex items-center gap-3">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#f0f7ff] text-slate-600 flex items-center justify-center transition-colors shadow-2xs"
              title="Instagram"
            >
              <img 
                src="/images/mazarie/social_instagram.cf3c4b8c.svg" 
                alt="Instagram" 
                className="w-4 h-4 object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </a>

            <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
              <img src="/images/mazarie/knet.png" alt="KNET" className="h-5 object-contain" />
              <img src="/images/mazarie/visa-card.svg" alt="Visa" className="h-4 object-contain" />
              <img src="/images/mazarie/master-card.svg" alt="MasterCard" className="h-4 object-contain" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2024 - 2025 مزارع الثنيان - جميع الحقوق محفوظة</p>
          <p className="flex items-center gap-1 font-mono text-[11px]">
            <span>الكويت 🇰🇼</span>
          </p>
        </div>
      </div>

    </footer>
  );
};
