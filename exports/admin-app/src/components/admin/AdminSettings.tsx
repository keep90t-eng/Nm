import React, { useState, useEffect } from 'react';
import { Settings, Save, Power, Bell, ShieldCheck, DollarSign, Phone, MapPin, Truck, Lock, KeyRound, Copy, Check, Link2 } from 'lucide-react';
import { StoreSettings } from '../../types';

interface AdminSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const getAdminUrl = () => {
    try {
      return `${window.location.origin}/?admin=1`;
    } catch {
      return '/?admin=1';
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(getAdminUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700" />
          <span>إعدادات المتجر والتوصيل في الكويت</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          التحكم في رسوم التوصيل، شروط التوصيل المجاني بالدينار الكويتي، وشريط الإعلانات العلوي، ورمز حماية لوحة المالك.
        </p>
      </div>

      {/* Dedicated Admin Link Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span>الرابط المنفصل المباشر للوحة التحكم (Admin URL)</span>
            </h3>
            <p className="text-xs text-slate-300">
              يمكنك حفظ هذا الرابط في المفضلة لديك لفتح لوحة التحكم مباشرة من أي متصفح أو جهاز.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              copiedLink
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم نسخ الرابط!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ الرابط المباشر</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-300 overflow-x-auto">
          <span className="select-all text-emerald-400 font-bold">{getAdminUrl()}</span>
          <span className="text-[10px] text-slate-500 mr-2 shrink-0">أو /#admin</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Admin Security PIN */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>حماية لوحة تحكم المالك (رمز المرور السري PIN)</span>
          </h3>

          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                  رمز مرور الدخول للوحة التحكم 🔒
                </span>
                <span className="text-[11px] text-slate-500 block">
                  يمنع العملاء من فتح واجهة الإدارة. لن يتمكن أحد من دخول اللوحة إلا بإدخال هذا الرمز.
                </span>
              </div>
              <div className="w-full sm:w-48">
                <input
                  type="text"
                  maxLength={10}
                  value={formSettings.adminPin || '2025'}
                  onChange={(e) => setFormSettings({ ...formSettings, adminPin: e.target.value.trim() })}
                  placeholder="مثال: 2025"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-black text-emerald-900 text-center tracking-widest text-base focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * الرمز الافتراضي هو <strong className="text-slate-700 font-mono">2025</strong>. يرجى حفظ الرمز جيداً بعد التغيير.
            </p>
          </div>
        </div>

        {/* Store Open / Closed Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Power className="w-4 h-4 text-emerald-600" />
            <span>حالة استقبال الطلبات في الكويت</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                {formSettings.isStoreOpen ? 'المتجر يستقبل الطلبات الآن 🟢' : 'المتجر مغلق مؤقتاً 🔴'}
              </span>
              <span className="text-[11px] text-slate-500">
                عند إغلاق المتجر، سيتم تنبيه العملاء بأن التوصيل سيبدأ في أوقات العمل الرسمية.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFormSettings({ ...formSettings, isStoreOpen: !formSettings.isStoreOpen })}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                formSettings.isStoreOpen
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {formSettings.isStoreOpen ? 'مفتوح (اضغط للإغلاق)' : 'مغلق (اضغط للفتح)'}
            </button>
          </div>
        </div>

        {/* Delivery Fees & Free Threshold */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>سياسة التسعير والتوصيل (د.ك)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">
                الحد الأدنى للطلب للحصول على توصيل مجاني (د.ك)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formSettings.freeDeliveryThreshold}
                onChange={(e) => setFormSettings({ ...formSettings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-emerald-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">حالياً: الطلبات فوق {formSettings.freeDeliveryThreshold.toFixed(3)} د.ك توصيلها مجاني.</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">
                رسوم التوصيل المبرد القياسية (د.ك)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formSettings.standardDeliveryFee}
                onChange={(e) => setFormSettings({ ...formSettings, standardDeliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">تطبق على الطلبات التي لم تبلغ الحد الأدنى للتوصيل المجاني.</span>
            </div>
          </div>
        </div>

        {/* Notification Announcement Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>شريط الإعلانات العلوي في المتجر</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.showAnnouncement}
                onChange={(e) => setFormSettings({ ...formSettings, showAnnouncement: e.target.checked })}
                className="accent-emerald-600 rounded"
              />
              <span className="font-bold text-slate-800">إظهار شريط الإعلانات في أعلى الصفحة</span>
            </label>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">نص الإعلان أو العرض</label>
              <input
                type="text"
                value={formSettings.announcementText}
                onChange={(e) => setFormSettings({ ...formSettings, announcementText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>أرقام خدمة العملاء والواتساب بالكويت</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">هاتف خدمة العملاء الموحد</label>
              <input
                type="text"
                value={formSettings.supportPhone}
                onChange={(e) => setFormSettings({ ...formSettings, supportPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">رقم الواتساب لاستقبال الاستفسارات</label>
              <input
                type="text"
                value={formSettings.whatsappNumber}
                onChange={(e) => setFormSettings({ ...formSettings, whatsappNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ الإعدادات وتطبيقها على المتجر بنجاح!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">التعديلات تنعكس فورياً على تجربة العملاء بالمتجر.</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
