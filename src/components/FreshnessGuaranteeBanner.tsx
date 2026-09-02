import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Leaf, 
  RotateCcw, 
  Clock, 
  Sparkles,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export const FreshnessGuaranteeBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800 shadow-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>الضمان الذهبي لسلة الديرة</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              طازجة ومثالية 100%، أو استرجع قيمتها فوراً بدون أي شروط!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
              نضمن لك فحص كل حبة فاكهة قبل التعبئة، وتوصيلها داخل سيارات فان مبردة بحرارة مضبوطة بدقة للحفاظ على القرمشة، الحلاوة، والفيتامينات الطبيعية.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
              <Truck className="w-6 h-6 text-amber-300" />
              <h4 className="font-bold text-white text-sm">سيارات نقل مبردة</h4>
              <p className="text-[11px] text-emerald-200">تحت 4 درجات مئوية لحماية اللب والنكهة</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
              <Leaf className="w-6 h-6 text-amber-300" />
              <h4 className="font-bold text-white text-sm">مزارع موثوقة</h4>
              <p className="text-[11px] text-emerald-200">قطاف يومي طازج من مزارع العبدلي والوفرة وأرقى المصادر</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
              <RotateCcw className="w-6 h-6 text-amber-300" />
              <h4 className="font-bold text-white text-sm">استبدال أو استرجاع</h4>
              <p className="text-[11px] text-emerald-200">بضغطة زر واحدة عبر الواتساب فوراً</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
              <Clock className="w-6 h-6 text-amber-300" />
              <h4 className="font-bold text-white text-sm">دقة متناهية بالمواعيد</h4>
              <p className="text-[11px] text-emerald-200">توصيل خلال 35-45 دقيقة فقط</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
