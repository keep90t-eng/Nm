import React from 'react';
import { 
  X, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  TreePine,
  Fish,
  Bird,
  Heart
} from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreProducts: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  onExploreProducts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#102d1f] via-[#163e2b] to-[#1d4d36] p-6 text-white flex items-center justify-between border-b border-[#2b5940]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-2xl shadow-md font-bold border border-amber-300">
              🐝
            </div>
            <div>
              <h2 className="text-xl font-black">مزارع ومناحل الثنيان الكويتية</h2>
              <p className="text-xs text-amber-300">جودة وثقة وأصالة كويتية منذ التأسيس | 1990</p>
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
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          {/* London Awards Banner */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h4 className="font-black text-amber-950 text-sm sm:text-base">
                حائزة على جوائز لندن العالمية لجودة العسل 2022 🏆
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                توجت مناحل الثنيان الكويتية بجوائز الجودة في العاصمة البريطانية لندن، كإحدى أرقى العلامات التجارية المنتجة للعسل الطبيعي غير المعالج حرارياً والمفحوص مخبرياً بأدق المقاييس العالمية.
              </p>
            </div>
          </div>

          {/* Story Paragraphs */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>قصة مزارع ومناحل الثنيان</span>
            </h3>
            <p>
              تأسست <strong>مزارع الثنيان</strong> في دولة الكويت لتقديم مفهوم جديد ومتميز في الإنتاج الزراعي والحيواني والمناحل، يقوم على تقديم منتجات غذائية طبيعية 100% طازجة، من المزرعة مباشرة إلى المستهلك الكويتي دون أي وسطاء أو تخزين طويل.
            </p>
            <p>
              تمتلك الشركة مزارع متطورة في منطقتي <strong>الوفرة والعبدلي</strong>، بالإضافة إلى مناحل نموذجية متنقلة بين الكويت والإمارات وسلطنة عمان والمغرب لتتبع مواسم إزهار السدر والزهور البرية.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <div className="flex items-center gap-2 font-black text-emerald-950 text-xs">
                <Fish className="w-4 h-4 text-emerald-700" />
                <span>أحواض أسماك البلطي العذبة</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                استزراع أسماك البلطي في مياه عذبة نقية وأعلاف نباتية، لحم أبيض ناصع وطازج يُصاد يومياً ويُسلم حياً أو مبرداً ومقطعاً.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <div className="flex items-center gap-2 font-black text-emerald-950 text-xs">
                <Bird className="w-4 h-4 text-emerald-700" />
                <span>دواجن ساسو وحمام فرنسي</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                دواجن عربية بنكهة بلدي أصيلة وتربية حرة، ذبح حلال يومي معتمد في مسالخ الدولة تحت إشراف بيطري كامل.
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>هاتف: 1855888</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>info@althenayanhoney.com.kw</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>الكويت - الوفرة والعبدلي</span>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:px-8 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            إغلاق
          </button>
          <button
            onClick={() => {
              onClose();
              onExploreProducts();
            }}
            className="flex-1 py-2.5 px-6 bg-[#153e2b] hover:bg-[#102d1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            استعراض منتجات المزرعة اليوم 🌿
          </button>
        </div>

      </div>
    </div>
  );
};
