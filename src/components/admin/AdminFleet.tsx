import React, { useState } from 'react';
import { Truck, Phone, Star, MapPin, Thermometer, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { AdminDriver } from '../../types';
import { KUWAIT_AREAS } from '../../data/products';

interface AdminFleetProps {
  drivers: AdminDriver[];
  onAddDriver: (driver: AdminDriver) => void;
  onToggleDriverStatus: (driverId: string) => void;
}

export const AdminFleet: React.FC<AdminFleetProps> = ({
  drivers,
  onAddDriver,
  onToggleDriverStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+965 ');
  const [vehicle, setVehicle] = useState('فان تويوتا مبردة (4°C)');
  const [plateNumber, setPlateNumber] = useState('كويت 12/3456');
  const [currentArea, setCurrentArea] = useState('العاصمة (الشرق / دسمان)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddDriver({
      id: `drv-${Date.now()}`,
      name,
      phone,
      vehicle,
      plateNumber,
      rating: 5.0,
      activeOrdersCount: 0,
      currentArea,
      refrigerationTemp: '3.9°C',
      status: 'available',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Fleet Top Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <span>إدارة أسطول التوصيل المبرد في الكويت ({drivers.length} سيارات)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة حساسات درجات الحرارة المبردة (4°C) وتوزيع المناديب حسب المحافظات لضمان وصول الفاكهة مثلجة وطازجة.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مندوب جديد 🚚</span>
          </button>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-emerald-300 shadow-xs transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{driver.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {driver.rating}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{driver.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleDriverStatus(driver.id)}
                className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  driver.status === 'delivering' ? 'bg-amber-100 text-amber-900' :
                  driver.status === 'available' ? 'bg-emerald-100 text-emerald-900' :
                  'bg-slate-100 text-slate-600'
                }`}
              >
                {driver.status === 'delivering' ? '🚀 في مسار توصيل' :
                 driver.status === 'available' ? '🟢 متاح وجاهز' : '⏸️ استراحة'}
              </button>
            </div>

            {/* Vehicle & Temperature sensor status */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">المركبة واللوحة:</span>
                <strong className="text-slate-800 font-medium block truncate">{driver.vehicle}</strong>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border mt-1 inline-block">
                  {driver.plateNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">حساس تبريد الصندوق:</span>
                <div className="flex items-center gap-1 text-blue-700 font-bold mt-0.5 font-mono">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span>{driver.refrigerationTemp}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-sans">مثالي ❄️</span>
                </div>
              </div>
            </div>

            {/* Area & Active Deliveries */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>المنطقة: <strong>{driver.currentArea}</strong></span>
              </div>

              <div className="text-slate-700 font-bold">
                <span>الطلبات المحملة: </span>
                <span className="font-mono text-emerald-800">{driver.activeOrdersCount}</span>
              </div>
            </div>

            {/* Direct Call / WhatsApp */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${driver.phone.replace(/\s+/g, '')}`}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>اتصال بالمندوب</span>
              </a>
              <a
                href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl text-center transition-colors"
              >
                محادثة واتساب 💬
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-700" />
                <span>إضافة مندوب توصيل جديد للكويت</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">اسم السائق / المندوب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فهد المطيري"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">رقم الهاتف الكويتي *</label>
                <input
                  type="text"
                  required
                  placeholder="+965 99123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">نوع المركبة المبردة</label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">رقم اللوحة</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">المحافظة / منطقة التغطية</label>
                <select
                  value={currentArea}
                  onChange={(e) => setCurrentArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {KUWAIT_AREAS.map((a) => (
                    <option key={a.id} value={`${a.name} (${a.districts[0]})`}>
                      {a.name} - {a.districts.slice(0, 2).join('، ')}
                    </option>
                  ))}
                </select>
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  إضافة المندوب للأسطول 🚚
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
