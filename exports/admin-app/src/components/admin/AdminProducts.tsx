import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Leaf, 
  Flame, 
  Tag,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { FruitProduct, Category } from '../../types';
import { CATEGORIES } from '../../data/products';

interface AdminProductsProps {
  products: FruitProduct[];
  onAddProduct: (newProduct: FruitProduct) => void;
  onUpdateProduct: (product: FruitProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductModal, setEditingProductModal] = useState<FruitProduct | null>(null);

  // New product form state
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCategory, setFormCategory] = useState<FruitProduct['category']>('promos');
  const [formPrice, setFormPrice] = useState<number>(4.000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(5.000);
  const [formUnit, setFormUnit] = useState('بوكس');
  const [formOrigin, setFormOrigin] = useState('مزارع الثنيان 🌿');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80');
  const [formSweetness, setFormSweetness] = useState(5);
  const [formCalories, setFormCalories] = useState(50);
  const [formIsOrganic, setFormIsOrganic] = useState(false);
  const [formIsExpress, setFormIsExpress] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsSeasonal, setFormIsSeasonal] = useState(false);
  const [formBadge, setFormBadge] = useState('طازج اليوم ⭐');
  const [formDescription, setFormDescription] = useState('فواكه طازجة ممتازة منتقاة بعناية فائقة لتصلك بأعلى جودة.');

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartInlineEdit = (p: FruitProduct) => {
    setEditingProductId(p.id);
    setInlinePrice(p.price);
  };

  const handleSaveInlinePrice = (p: FruitProduct) => {
    onUpdateProduct({
      ...p,
      price: inlinePrice,
    });
    setEditingProductId(null);
  };

  const handleOpenEditModal = (p: FruitProduct) => {
    setEditingProductModal(p);
    setFormName(p.name);
    setFormNameEn(p.nameEn);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price * 1.2);
    setFormUnit(p.unit);
    setFormOrigin(p.origin);
    setFormImage(p.image);
    setFormSweetness(p.sweetness);
    setFormCalories(p.calories);
    setFormIsOrganic(!!p.isOrganic);
    setFormIsExpress(p.isExpressDelivery);
    setFormIsBestSeller(!!p.isBestSeller);
    setFormIsSeasonal(!!p.isSeasonal);
    setFormBadge(p.badge || '');
    setFormDescription(p.description);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;

    if (editingProductModal) {
      // Update existing
      onUpdateProduct({
        ...editingProductModal,
        name: formName,
        nameEn: formNameEn || formName,
        category: formCategory,
        price: formPrice,
        originalPrice: formOriginalPrice > formPrice ? formOriginalPrice : undefined,
        unit: formUnit,
        origin: formOrigin,
        image: formImage,
        sweetness: formSweetness,
        calories: formCalories,
        isOrganic: formIsOrganic,
        isExpressDelivery: formIsExpress,
        isBestSeller: formIsBestSeller,
        isSeasonal: formIsSeasonal,
        badge: formBadge || undefined,
        description: formDescription,
      });
      setEditingProductModal(null);
    } else {
      // Add new
      const newFruit: FruitProduct = {
        id: `fruit-custom-${Date.now()}`,
        name: formName,
        nameEn: formNameEn || 'Fresh Fruit Selection',
        category: formCategory,
        price: formPrice,
        originalPrice: formOriginalPrice > formPrice ? formOriginalPrice : undefined,
        unit: formUnit,
        unitWeightKg: 1.0,
        rating: 5.0,
        reviewsCount: 1,
        image: formImage,
        origin: formOrigin,
        sweetness: formSweetness,
        calories: formCalories,
        isOrganic: formIsOrganic,
        isExpressDelivery: formIsExpress,
        isBestSeller: formIsBestSeller,
        isSeasonal: formIsSeasonal,
        badge: formBadge || undefined,
        description: formDescription,
        vitamins: ['فيتامين C', 'ألياف طبيعية'],
        storageTips: 'يُحفظ مبرداً في الثلاجة بدرجة حرارة 4 درجات مئوية.',
      };
      onAddProduct(newFruit);
      setShowAddModal(false);
    }
  };

  // Image Presets for easy selection
  const IMAGE_PRESETS = [
    { label: 'فراولة العبدلي 🍓', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80' },
    { label: 'رقي الوفرة (بطيخ) 🍉', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80' },
    { label: 'مانجو فاخر 🥭', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' },
    { label: 'سلة ملكية فاخرة 🧺', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80' },
    { label: 'توت أزرق جامبو 🫐', url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80' },
    { label: 'أفوكادو هاس 🥑', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80' },
    { label: 'أناناس ذهبي 🍍', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80' },
    { label: 'عنب بدون بذور 🍇', url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              <span>إدارة الفواكه والمنتجات والمخزون ({products.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إضافة فواكه جديدة، تعديل الأسعار بالدينار الكويتي، وتحديث توفر المنتجات في المتجر فورياً.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProductModal(null);
              setFormName('');
              setFormNameEn('');
              setFormPrice(1.500);
              setFormOriginalPrice(2.000);
              setFormUnit('كجم');
              setFormOrigin('مزارع العبدلي - الكويت 🇰🇼');
              setFormImage(IMAGE_PRESETS[0].url);
              setFormDescription('فواكه طازجة ممتازة منتقاة بعناية فائقة لتصلك بأعلى جودة.');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف فاكهة جديد 🍉</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم الفاكهة، المصدر (العبدلي، الوفرة، جازان)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">جميع التصنيفات ({products.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isInlineEditing = editingProductId === p.id;

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 p-4 shadow-xs flex flex-col justify-between transition-all space-y-3"
            >
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                    {p.badge && (
                      <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                        {p.badge}
                      </span>
                    )}
                    {p.isOrganic && (
                      <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                        <Leaf className="w-2.5 h-2.5" /> عضوي
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {p.unit}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                  <p className="text-[11px] text-slate-500">{p.origin}</p>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isInlineEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.05"
                          min="0.1"
                          value={inlinePrice}
                          onChange={(e) => setInlinePrice(parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-100 border border-emerald-500 rounded-lg p-1 text-xs font-mono font-bold text-emerald-900"
                        />
                        <button
                          onClick={() => handleSaveInlinePrice(p)}
                          className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingProductId(null)}
                          className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartInlineEdit(p)}
                        className="flex items-baseline gap-1 cursor-pointer hover:opacity-80"
                        title="انقر لتعديل السعر السريع"
                      >
                        <span className="text-base font-black text-emerald-900 font-mono">
                          {p.price.toFixed(3)}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">د.ك</span>
                        <Edit3 className="w-3 h-3 text-slate-400 ml-1" />
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    حلاوة: {'⭐'.repeat(p.sweetness)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل التفاصيل</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${p.name} من المتجر؟`)) {
                        onDeleteProduct(p.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="حذف الصنف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProductModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                <span>{editingProductModal ? 'تعديل بيانات الفاكهة' : 'إضافة صنف فاكهة جديد لسلة الديرة 🍉'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProductModal(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">اسم الفاكهة بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: رقي العبدلي السكري"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Sweet Kuwait Watermelon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">التصنيف *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="promos">عروض اليوم الحصرية</option>
                    <option value="birds">بط وحمام وطيور</option>
                    <option value="fish">أسماك وروبيان</option>
                    <option value="poultry">دواجن عربي ساسو</option>
                    <option value="dates_fruits">تمور وتين</option>
                    <option value="honey">مناحل وعسل سدر</option>
                    <option value="boxes">بوكسات المزرعة التوفيرية</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">السعر (د.ك) *</label>
                  <input
                    type="number"
                    step="0.050"
                    min="0.050"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">الوحدة (كجم، طبق، سلة)</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="كجم / طبق / حبة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">المصدر / المزرعة</label>
                <input
                  type="text"
                  value={formOrigin}
                  onChange={(e) => setFormOrigin(e.target.value)}
                  placeholder="مزارع العبدلي - الكويت / مزارع الوفرة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Image URL & Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">رابط صورة الفاكهة</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                />
                
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">نماذج صور جاهزة:</span>
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className="text-[11px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsOrganic}
                    onChange={(e) => setFormIsOrganic(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">عضوي 🌿</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsExpress}
                    onChange={(e) => setFormIsExpress(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">توصيل سريع ⚡</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">الأكثر مبيعاً 🔥</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSeasonal}
                    onChange={(e) => setFormIsSeasonal(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">موسمي 🌸</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProductModal(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingProductModal ? 'حفظ التعديلات' : 'إضافة الفاكهة للمتجر ✅'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
