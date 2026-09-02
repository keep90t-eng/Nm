import React from 'react';
import { 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  Gift, 
  Clock, 
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onCustomBasketClick: () => void;
  cityDeliveryMinutes: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onCustomBasketClick,
  cityDeliveryMinutes
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl sm:rounded-4xl my-4 sm:my-6 mx-4 sm:mx-6 lg:mx-8 shadow-xl border border-emerald-700/50">
      
      {/* Background Decorative patterns */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>فراولة العبدلي الطازجة ورقي الوفرة وأفخر الفواكه المستوردة 🍓🇰🇼</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-snug text-white">
              فواكه طازجة منتقاة حبة حبة، <br className="hidden sm:inline" />
              تصلك بكل مناطق الكويت <span className="text-amber-300 underline decoration-amber-400/60 decoration-wavy underline-offset-8">مبردة خلال {cityDeliveryMinutes} دقيقة!</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl leading-relaxed">
              سلة الديرة توصل لك أطيب محاصيل مزارع الكويت والعالم نخب أول لباب بيتك، مع خدمة توصيل سريعة ودفع إلكتروني آمن عبر بوابة كي نت (K-Net).
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-shop-now-btn"
                onClick={onExploreClick}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>تسوق الفواكه الطازجة</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-custom-basket-btn"
                onClick={onCustomBasketClick}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>صمّم سلة إهداء خاصة</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-700/60 text-xs">
              <div className="flex items-center gap-2 text-emerald-100">
                <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>توصيل مبرد لكل مناطق الكويت 🚀</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <CreditCard className="w-4 h-4 text-amber-300 shrink-0" />
                <span>دفع إلكتروني آمن عبر K-Net 💳</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>ضمان طزاجة 100% أو استرجاع</span>
              </div>
            </div>
          </div>

          {/* Featured Visual Card / Highlights */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-2xl">
              
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-emerald-950/40">
                <img 
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80" 
                  alt="سلة فواكه طازجة"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                
                <div className="absolute top-3 right-3 bg-amber-400 text-emerald-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> قطاف اليوم
                </div>

                <div className="absolute bottom-3 right-3 left-3 text-right">
                  <p className="text-xs text-amber-200 font-semibold">تشكيلة الديرة الفاخرة</p>
                  <p className="text-sm font-bold text-white">منتقاة يدوياً ومغلفة بأعلى معايير النظافة</p>
                </div>
              </div>

              {/* Quick interactive order summary preview */}
              <div className="mt-4 bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/50 flex items-center justify-center text-xl">
                    ⏱️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">متوسط وقت التوصيل</p>
                    <p className="text-[11px] text-emerald-200">سيارات فان مبردة تحت 4° مئوية</p>
                  </div>
                </div>
                <div className="text-left font-black text-amber-300 text-lg">
                  ~{cityDeliveryMinutes} دقيقة
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
