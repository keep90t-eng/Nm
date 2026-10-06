import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck
} from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onCustomBasketClick?: () => void;
  cityDeliveryMinutes: number;
  onSelectCategory?: (catId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  cityDeliveryMinutes,
  onSelectCategory
}) => {
  const subCategories = [
    { id: 'promos', name: 'عروض', image: '/images/mazarie/top1.png', tag: 'خصومات حصرية' },
    { id: 'fish', name: 'سيباس تركي', image: '/images/mazarie/top2.png', tag: 'صيد طازج' },
    { id: 'fish', name: 'روبيان جامبو', image: '/images/mazarie/top3.png', tag: 'كويتي بحري' },
    { id: 'fish', name: 'سالمون نيجيري', image: '/images/mazarie/e905ba4d-4991-40c4-97c3-4f1c4074a01e_AllinBreakfastheroimag.jpeg', tag: 'فاخر ومميز' },
  ];

  return (
    <div className="space-y-6 pt-4 pb-2">
      
      {/* 1. Main Heading & Subtitle */}
      <div className="space-y-2 text-right">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            مزارع الثنيان
          </h1>
          <span className="bg-[#e0f2fe] text-[#025380] text-xs font-black px-2.5 py-1 rounded-full border border-[#bae6fd]">
            المتجر الرسمي 🇰🇼
          </span>
        </div>
        <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          اكتشف منتجاتنا عالية الجودة من الأسماك الطازجة والمستوردة والروبيان المميز، اطلب الآن مع أفضل وأسرع خدمة توصيل اونلاين.
        </p>
      </div>

      {/* 2. SubCategories Carousel Row matching FoodSubCategoryCard */}
      <div className="relative">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
          {subCategories.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCategory && onSelectCategory(sub.id)}
              className="flex flex-col items-center group shrink-0 cursor-pointer"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-100 border border-slate-200/80 p-2 overflow-hidden shadow-2xs group-hover:border-[#025380] group-hover:shadow-md transition-all">
                <img 
                  src={sub.image} 
                  alt={sub.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="mt-2 text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-[#025380] transition-colors">
                {sub.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Filter Presets & Value Badges matching mazarie-althanyan.com */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Badge 1: Free Delivery */}
        <div className="flex items-center gap-2 bg-[#e6f6ff] text-[#017bff] px-3.5 py-2 rounded-2xl border border-[#bae6fd] text-xs font-extrabold shadow-2xs">
          <img 
            src="/images/mazarie/free_delivery.33e8a802.svg" 
            alt="توصيل مجاني" 
            className="w-4 h-4 object-contain"
          />
          <span>توصيل مجاني</span>
          <span className="text-[11px] bg-white text-[#025380] px-2 py-0.5 rounded-full font-mono font-bold">
            خلال {cityDeliveryMinutes} دقيقة
          </span>
        </div>

        {/* Badge 2: Dedicated Refrigerated Transport */}
        <div className="flex items-center gap-2 bg-[#fff1f0] text-[#d90217] px-3.5 py-2 rounded-2xl border border-[#fecaca] text-xs font-extrabold shadow-2xs">
          <span className="text-base">❄️</span>
          <span>نقل مخصص ومبرد (4°C)</span>
          <span className="text-[11px] bg-white text-[#d90217] px-2 py-0.5 rounded-full font-bold">
            خصم %30
          </span>
        </div>

        {/* Badge 3: Support Local */}
        <div className="flex items-center gap-2 bg-[#fff0f7] text-[#6e1252] px-3.5 py-2 rounded-2xl border border-[#fbcfe8] text-xs font-extrabold shadow-2xs">
          <span className="text-base">🇰🇼</span>
          <span>ادعم المنتج الكويتي المحلي</span>
        </div>
      </div>

      {/* 4. Store Meta Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                قائمة مزارع الثنيان
              </h2>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-xl text-xs font-black">
                <img 
                  src="/images/mazarie/star_yellow.3109f807.svg" 
                  alt="تقييم" 
                  className="w-3.5 h-3.5 object-contain"
                />
                <span>4.7</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              الأسماك الطازجة والمستوردة والروبيان المميز، بط فرنسي، حمام لاحم، ودجاج ساسو
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/80 font-bold">
              <Clock className="w-3.5 h-3.5 text-[#025380]" />
              <span>وقت التوصيل:</span>
              <span className="font-extrabold text-slate-900">{cityDeliveryMinutes} دقيقة</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/80 font-bold">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>المسافة:</span>
              <span className="font-extrabold text-slate-900">15 كيلو</span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ساعات العمل:</span>
              <span className="font-black">مفتوح الآن</span>
            </div>
          </div>
        </div>

        {/* Express delivery callout bar matching mazarie-althanyan.com */}
        <div className="bg-[#025380] text-white px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span>أطلب الآن عبر موقعنا واحصل على خدمة توصيل سريعة في غضون 28 دقيقة.</span>
          </div>
          <button 
            onClick={onExploreClick}
            className="hidden sm:flex items-center gap-1 bg-white text-[#025380] hover:bg-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0"
          >
            <span>استعراض الأصناف</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
