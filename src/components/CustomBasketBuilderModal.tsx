import React, { useState } from 'react';
import { 
  X, 
  Gift, 
  Sparkles, 
  Plus, 
  Minus, 
  Check, 
  Heart, 
  ShoppingBag,
  Palette,
  FileText,
  UserCheck
} from 'lucide-react';
import { FruitProduct, CustomBasketConfig, CustomBasketItem } from '../types';

interface CustomBasketBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableFruits: FruitProduct[];
  onAddCustomBasketToCart: (basketConfig: CustomBasketConfig) => void;
}

const BASKET_SIZES = [
  { id: 'small', name: 'سلة الديرة الأنيقة', capacityKg: 3.5, maxItems: 4, basePrice: 3.500, icon: '🧺', desc: 'مثالية لشخصين أو زيارة سريعة' },
  { id: 'medium', name: 'سلة الديرة العائلية', capacityKg: 6.0, maxItems: 6, basePrice: 4.750, icon: '🎁', desc: 'مناسبة لجمعة العائلة والضيوف' },
  { id: 'large', name: 'سلة الديرة الكبرى', capacityKg: 8.5, maxItems: 8, basePrice: 6.500, icon: '✨', desc: 'تشكيلة وافرة للمناسبات والديوانيات' },
  { id: 'royal', name: 'السلة الملكية الفاخرة', capacityKg: 12.0, maxItems: 10, basePrice: 9.000, icon: '👑', desc: 'تنسيق خشبي فاخر بورد طبيعي' },
] as const;

const RIBBON_COLORS = [
  { id: 'emerald', name: 'أخضر زمردي', bgClass: 'bg-emerald-600', hex: '#059669' },
  { id: 'gold', name: 'ذهبي ملكي', bgClass: 'bg-amber-400', hex: '#fbbf24' },
  { id: 'ruby', name: 'أحمر عنابي', bgClass: 'bg-rose-700', hex: '#be123c' },
  { id: 'navy', name: 'كحلي فاخر', bgClass: 'bg-slate-800', hex: '#1e293b' },
  { id: 'silver', name: 'فضي لؤلؤي', bgClass: 'bg-slate-300', hex: '#cbd5e1' },
];

const PRESET_MESSAGES = [
  'ألف سلامة وما تشوف شر يا غالي 💐',
  'ألف مبروك المولود، جعله الله من مواليد السعادة 🍼',
  'منزل مبارك وعامر بالخير والبركة 🏡',
  'إهداء من القلب لأطيب الناس ❤️',
  'ألف مبروك النجاح والتخرج ومنها للأعلى 🎓',
];

export const CustomBasketBuilderModal: React.FC<CustomBasketBuilderModalProps> = ({
  isOpen,
  onClose,
  availableFruits,
  onAddCustomBasketToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<typeof BASKET_SIZES[number]['id']>('medium');
  const [selectedFruits, setSelectedFruits] = useState<CustomBasketItem[]>([]);
  const [ribbonColor, setRibbonColor] = useState('gold');
  const [greetingCard, setGreetingCard] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  if (!isOpen) return null;

  const currentSizeObj = BASKET_SIZES.find(s => s.id === selectedSize) || BASKET_SIZES[1];
  
  // Calculate fruits cost & total
  const fruitsSubtotal = selectedFruits.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  const totalBasketPrice = currentSizeObj.basePrice + fruitsSubtotal;
  const totalFruitsSelectedCount = selectedFruits.reduce((sum, item) => sum + item.quantity, 0);

  const handleFruitQuantity = (fruit: FruitProduct, delta: number) => {
    setSelectedFruits(prev => {
      const existing = prev.find(item => item.productId === fruit.id);
      if (!existing && delta > 0) {
        if (totalFruitsSelectedCount >= currentSizeObj.maxItems) return prev;
        return [...prev, {
          productId: fruit.id,
          productName: fruit.name,
          quantity: 1,
          pricePerUnit: fruit.price,
          image: fruit.image
        }];
      } else if (existing) {
        const nextQty = existing.quantity + delta;
        if (nextQty <= 0) {
          return prev.filter(item => item.productId !== fruit.id);
        } else {
          if (delta > 0 && totalFruitsSelectedCount >= currentSizeObj.maxItems) return prev;
          return prev.map(item => item.productId === fruit.id ? { ...item, quantity: nextQty } : item);
        }
      }
      return prev;
    });
  };

  const handleFinishBasket = () => {
    const basketConfig: CustomBasketConfig = {
      size: currentSizeObj.id,
      sizeName: currentSizeObj.name,
      basePrice: currentSizeObj.basePrice,
      maxFruits: currentSizeObj.maxItems,
      ribbonColor: RIBBON_COLORS.find(r => r.id === ribbonColor)?.name || 'ذهبي',
      greetingCard: greetingCard.trim(),
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      selectedFruits: selectedFruits,
    };
    onAddCustomBasketToCart(basketConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-4xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-5 sm:px-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center text-xl shadow-md font-bold">
              🎁
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">صانع سلات الهدايا والمناسبات</h2>
              <p className="text-xs text-emerald-200">اختر السلة، نسّق فواكهك المفضلة، وأضف كرت إهداء شخصي</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-8">
          
          {/* Step 1: Basket Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>اختر حجم ونوع السلة الخشبية</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BASKET_SIZES.map((size) => {
                const isSelected = selectedSize === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`text-right p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-2xl mb-2">
                        <span>{size.icon}</span>
                        {isSelected && <span className="w-5 h-5 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs"><Check className="w-3 h-3" /></span>}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{size.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{size.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-bold">سعة {size.maxItems} أصناف</span>
                      <span className="font-black text-slate-900">{size.basePrice.toFixed(3)} د.ك</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Fruit Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>اختر الفواكه المخصصة لسلتك</span>
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                تم اختيار {totalFruitsSelectedCount} من {currentSizeObj.maxItems} أصناف
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableFruits.filter(f => f.category !== 'baskets').slice(0, 8).map((fruit) => {
                const inBasket = selectedFruits.find(item => item.productId === fruit.id);
                const qty = inBasket?.quantity || 0;

                return (
                  <div 
                    key={fruit.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      qty > 0 
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img src={fruit.image} alt={fruit.name} className="w-full h-full object-cover" />
                      {qty > 0 && (
                        <span className="absolute top-1 right-1 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          {qty}x
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-xs truncate">{fruit.name}</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">{fruit.price.toFixed(3)} د.ك / {fruit.unit}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleFruitQuantity(fruit, -1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg bg-slate-100 disabled:opacity-30 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold">{qty}</span>
                      <button
                        onClick={() => handleFruitQuantity(fruit, 1)}
                        disabled={totalFruitsSelectedCount >= currentSizeObj.maxItems}
                        className="w-7 h-7 rounded-lg bg-emerald-700 disabled:opacity-30 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Ribbon & Card Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Ribbon Color */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">3</span>
                <Palette className="w-4 h-4 text-emerald-700" />
                <span>لون شريطة الساتان الفاخرة</span>
              </h3>

              <div className="flex items-center gap-3">
                {RIBBON_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setRibbonColor(color.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-md ${color.bgClass} ${
                      ribbonColor === color.id ? 'ring-4 ring-emerald-500/40 scale-110' : 'hover:scale-105'
                    }`}
                    title={color.name}
                  >
                    {ribbonColor === color.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">4</span>
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>بيانات المستلم (اختياري للإهداء)</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم المستلم"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="رقم هاتف المستلم (الكويت 9xxxxxxx)"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Step 4: Greeting Card Note */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>نص بطاقة الإهداء المطبوعة بخط رقعة أنيق</span>
            </h3>

            {/* Quick preset suggestions */}
            <div className="flex flex-wrap gap-2">
              {PRESET_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => setGreetingCard(msg)}
                  className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer"
                >
                  {msg}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={greetingCard}
              onChange={(e) => setGreetingCard(e.target.value)}
              placeholder="اكتب رسالتك الخاصة أو اختر من العبارات الجاهزة بالأعلى..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-8 sm:py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">إجمالي السلة المخصصة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-900">{totalBasketPrice.toFixed(3)}</span>
              <span className="text-xs font-bold text-emerald-700">د.ك</span>
            </div>
          </div>

          <button
            onClick={handleFinishBasket}
            disabled={selectedFruits.length === 0}
            className="py-3.5 px-6 bg-emerald-700 disabled:opacity-50 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إضافة السلة للطلب ({totalBasketPrice.toFixed(3)} د.ك)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
