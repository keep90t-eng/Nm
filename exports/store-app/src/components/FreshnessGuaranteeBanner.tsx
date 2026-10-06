import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Leaf, 
  RotateCcw, 
  Clock, 
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';

export const FreshnessGuaranteeBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="bg-gradient-to-br from-[#0c2217] via-[#143d29] to-[#0a1c13] text-white rounded-3xl p-6 sm:p-10 border border-[#235338] shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-3.5 text-right">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black shadow-md">
              <Award className="w-4 h-4 text-slate-950" />
              <span>ميثاق الجودة والثقة - مزارع ومناحل الثنيان الكويتية</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              منتجات طبيعية 100% طازجة يومياً، خاضعة لأعلى معايير الرقابة البيطرية والمخبرية
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
              نلتزم بتقديم عسل سدر خالص غير مبستر حائز على جوائز لندن العالمية، وأسماك بلطي مستزرعة في مياه عذبة، ودواجن ومواشي تتغذى على أعلاف نباتية طبيعية بدون هرمونات.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5 text-right">
              <Truck className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">أسطول تبريد متخصص</h4>
              <p className="text-[11px] text-emerald-200">سيارات فان مبردة تحفظ الأسماك واللحوم والعسل بدرجات مثالية</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5 text-right">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">فحص مخبري دوري</h4>
              <p className="text-[11px] text-emerald-200">شهادات فحص دورية تثبت نقاء العسل وخلو المنتجات من أي ملوثات</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5 text-right">
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">ذبح حلال معتمد</h4>
              <p className="text-[11px] text-emerald-200">ذبح يومي للدواجن والخراف بإشراف أطباء بيطريين معتمدين</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5 text-right">
              <Clock className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">توصيل سريع بالكويت</h4>
              <p className="text-[11px] text-emerald-200">تصلك الطلبات في نفس اليوم خلال 35-50 دقيقة فقط</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
