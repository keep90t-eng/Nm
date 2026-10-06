import React from 'react';
import { X, Sparkles, ShieldCheck, Check } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#025380] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <h3 className="font-extrabold text-base sm:text-lg">تنويه لعملائنا الكرام</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image & Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
            <img 
              src="/images/mazarie/459307463_1044724404108266_4808211461608369674_n.jpg" 
              alt="تنويه مزارع الثنيان"
              className="w-full h-auto object-cover max-h-[380px]"
            />
          </div>

          <div className="bg-[#f0f7ff] border border-[#bae6fd] rounded-2xl p-4 text-xs sm:text-sm text-slate-700 space-y-1.5">
            <p className="font-bold text-[#025380] flex items-center gap-1.5">
              <span>🌾</span>
              <span>مزارع ومناحل الثنيان الكويتية - الموقع الرسمي</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              حرصاً منا على تقديم أعلى معايير الجودة والأمان، جميع منتجاتنا الزراعية والسمكية والطيور طازجة 100% ومن مزارعنا مباشرة لباب بيتك مع سيارات نقل مبردة مخصصة (4°C) والدفع الآمن.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#025380] hover:bg-[#004070] text-white rounded-2xl font-bold text-sm shadow transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>تأكيد والبدء بالتسوق</span>
          </button>
        </div>
      </div>
    </div>
  );
};
