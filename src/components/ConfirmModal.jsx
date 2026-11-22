import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการทำรายการ",
  message = "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  isDestructive = true,
  theme = 'dark'
}) {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border transition-all ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
            isDestructive
              ? isDark ? 'bg-rose-950/50 text-rose-300 border-rose-900/60' : 'bg-rose-50 text-rose-600 border-rose-200'
              : isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]'
          }`}>
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
              {title}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg text-sm transition-colors ${
              isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium border transition-colors ${
              isDark
                ? 'border-[#44403C] hover:bg-[#292524] text-[#E7E5E4]'
                : 'border-stone-300 hover:bg-stone-50 text-stone-700'
            }`}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-[0.98]'
                : 'bg-[#EA580C] hover:bg-[#C2410C] text-white active:scale-[0.98]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
