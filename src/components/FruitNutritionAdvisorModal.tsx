import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Zap, 
  Smile, 
  CheckCircle2, 
  Plus,
  ShoppingBag
} from 'lucide-react';
import { FruitProduct } from '../types';

interface FruitNutritionAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FruitProduct[];
  onAddProductsBundle: (products: FruitProduct[]) => void;
}

interface HealthGoal {
  id: string;
  title: string;
  icon: string;
  desc: string;
  recommendedProductIds: string[];
  smoothieRecipe: {
    name: string;
    prepTime: string;
    steps: string[];
  };
}

const HEALTH_GOALS: HealthGoal[] = [
  {
    id: 'immunity',
    title: 'تعزيز المناعة وفيتامين C',
    icon: '🛡️',
    desc: 'مزيج مركز من الحمضيات والكيوي والتوت لمحاربة الإجهاد والزكام',
    recommendedProductIds: ['kiwi-golden-zespri', 'orange-valencia-organic', 'blueberry-jumbo', 'pomegranate-yemen'],
    smoothieRecipe: {
      name: 'سموذي درع المناعة الذهبي 🍊🥝',
      prepTime: '3 دقائق',
      steps: [
        'قشر حبتين من الكيوي الذهبي وبرتقالة واحدة',
        'أضف نصف كوب من التوت الأزرق وملعقة عسل طبيعي',
        'اخلط مع قليل من الماء البارد أو الثلج واشربه طازجاً صباحاً'
      ]
    }
  },
  {
    id: 'energy',
    title: 'طاقة ونشاط رياضي مستدام',
    icon: '⚡',
    desc: 'سكريات طبيعية معقدة وبوتاسيوم لدعم التركيز وقبل التمارين',
    recommendedProductIds: ['banana-ecuador-premium', 'dates-sukari-al-qassim', 'mango-jazan-1', 'avocado-hass-mexico'],
    smoothieRecipe: {
      name: 'مخفوق الطاقة والأداء الرياضي 🍌🌴',
      prepTime: '4 دقائق',
      steps: [
        'ضع موزة ناضجة مع 3 حبات تمر سكري منزوع النوى',
        'أضف ربع حبة أفوكادو لقوام كريمي غني بالدهون الصحية',
        'اخلط مع حليب اللوز أو الحليب الطازج واستمتع بأقوى طاقة طبيعية'
      ]
    }
  },
  {
    id: 'detox',
    title: 'ديتوكس ونضارة وترطيب البشرة',
    icon: '🌿',
    desc: 'مضادات أكسدة عالية وألياف لتطهير الجسم وإنعاش البشرة',
    recommendedProductIds: ['watermelon-abdali', 'dragonfruit-red-pitaya', 'strawberry-organic-abdali', 'pineapple-golden-sweet'],
    smoothieRecipe: {
      name: 'ديتوكس الإشراقة والانتعاش 🍉🍓',
      prepTime: '2 دقيقة',
      steps: [
        'اخلط شريحة رقي (بطيخ) باردة مع نصف حبة دراجون فروت',
        'أضف 4 حبات فراولة العبدلي الطازجة مع أوراق نعناع',
        'يُقدم بارداً مع مكعبات ثلج لانتعاش فوري'
      ]
    }
  },
  {
    id: 'kids',
    title: 'فواكه محبوبة للأطفال (بدون بذور)',
    icon: '👶',
    desc: 'حلوة المذاق، سهلة القضم والتقطيع، ومحفزة لنمو الأطفال وصحتهم',
    recommendedProductIds: ['grapes-black-seedless', 'apple-royal-gala', 'strawberry-organic-abdali', 'banana-ecuador-premium'],
    smoothieRecipe: {
      name: 'كوكتيل أبطال الديرة للأطفال 🍇🍎',
      prepTime: '3 دقائق',
      steps: [
        'اخلط تفاحة مقشرة وموزة مع عنب أسود بدون بذور',
        'أضف زبادي يوناني بنكهة الفانيلا',
        'وجبة خفيفة ومثالية لصندوق غداء المدرسة'
      ]
    }
  }
];

export const FruitNutritionAdvisorModal: React.FC<FruitNutritionAdvisorModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProductsBundle,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('immunity');

  if (!isOpen) return null;

  const currentGoal = HEALTH_GOALS.find(g => g.id === selectedGoalId) || HEALTH_GOALS[0];
  const matchedProducts = products.filter(p => currentGoal.recommendedProductIds.includes(p.id));
  const bundleTotalPrice = matchedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddBundle = () => {
    onAddProductsBundle(matchedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-5 sm:px-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl shadow-md font-bold">
              ✨
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">مستشار الديرة الغذائي الذكي</h2>
              <p className="text-xs text-emerald-200">اختر هدفك الصحي للحصول على توصيات فواكه ووصفات سموذي معتمدة</p>
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
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* Goal Selector Tabs */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 block">ما هو هدفك الصحي اليوم؟</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {HEALTH_GOALS.map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="text-xs font-bold leading-tight">{goal.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Description Banner */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <span className="text-3xl">{currentGoal.icon}</span>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">{currentGoal.title}</h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">{currentGoal.desc}</p>
            </div>
          </div>

          {/* Recommended Products Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">الفواكه المختارة لهذا الهدف:</h4>
              <span className="text-xs text-emerald-700 font-bold">
                إجمالي التشكيلة: {bundleTotalPrice.toFixed(3)} د.ك
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {matchedProducts.map((fruit) => (
                <div key={fruit.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                    <img src={fruit.image} alt={fruit.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs truncate">{fruit.name}</h5>
                    <p className="text-[11px] text-emerald-700 font-bold">{fruit.price.toFixed(3)} د.ك</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smoothie Recipe Box */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-3xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍹</span>
                <h4 className="font-black text-slate-900 text-sm">{currentGoal.smoothieRecipe.name}</h4>
              </div>
              <span className="text-[11px] bg-amber-200/80 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                ⏱️ التحضير: {currentGoal.smoothieRecipe.prepTime}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              {currentGoal.smoothieRecipe.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:px-8 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">تشكيلة متكاملة ({matchedProducts.length} أصناف)</span>
            <span className="text-lg font-black text-emerald-900">{bundleTotalPrice.toFixed(3)} د.ك</span>
          </div>

          <button
            onClick={handleAddBundle}
            className="py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إضافة الباقة كاملة للسلة 🍉</span>
          </button>
        </div>

      </div>
    </div>
  );
};
