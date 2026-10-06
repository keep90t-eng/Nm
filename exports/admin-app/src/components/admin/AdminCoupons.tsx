import React, { useState } from 'react';
import { Tag, Plus, Check, X, Percent, Trash2, Sparkles, Flame } from 'lucide-react';
import { Coupon } from '../../types';

interface AdminCouponsProps {
  coupons: Coupon[];
  onAddCoupon: (coupon: Coupon) => void;
  onToggleCoupon: (code: string) => void;
  onDeleteCoupon: (code: string) => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({
  coupons,
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(8.0);
  const [newDescription, setNewDescription] = useState('خصم حصري على فواكه وسلات الديرة');
  const [newMaxUsage, setNewMaxUsage] = useState(200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    onAddCoupon({
      code: newCode.trim().toUpperCase(),
      discountPercent: newDiscount,
      minOrder: newMinOrder,
      description: newDescription,
      isActive: true,
      usedCount: 0,
      maxUsage: newMaxUsage,
    });

    setNewCode('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              <span>إدارة كوبونات الخصم والعروض الترويجية ({coupons.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إنشاء كوبونات تخفيض جديدة وتحديد الحد الأدنى للطلب بالدينار الكويتي.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء كود خصم جديد 🎟️</span>
          </button>
        </div>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className={`bg-white rounded-3xl border p-5 shadow-xs transition-all space-y-3 ${
              coupon.isActive ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-slate-950 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  {coupon.code}
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {coupon.discountPercent}% خصم
                </span>
              </div>

              <button
                onClick={() => onToggleCoupon(coupon.code)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                  coupon.isActive 
                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {coupon.isActive ? 'مفعّل ✅' : 'معطّل ⏸️'}
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {coupon.description}
            </p>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>الحد الأدنى: <strong>{coupon.minOrder.toFixed(3)} د.ك</strong></span>
              <span>استُخدم: <strong>{coupon.usedCount}</strong> {coupon.maxUsage ? `/ ${coupon.maxUsage}` : ''} مرة</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onDeleteCoupon(coupon.code)}
                className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكوبون</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <span>إنشاء كود خصم جديد</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">رمز الكود (بالأحرف الإنجليزية) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: SUMMER25"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نسبة الخصم % *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-emerald-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">الحد الأدنى للطلب (د.ك) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">وصف الكود للعملاء</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="مثال: خصم 15% على جميع سلات الفواكه"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">الحد الأقصى لعدد مرات الاستخدام</label>
                <input
                  type="number"
                  min="1"
                  value={newMaxUsage}
                  onChange={(e) => setNewMaxUsage(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md cursor-pointer"
                >
                  حفظ وتفعيل الكوبون 🎟️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
