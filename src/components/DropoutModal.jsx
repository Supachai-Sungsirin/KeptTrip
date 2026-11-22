import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, ShieldCheck, RefreshCw, Crown, LogOut, CheckCircle2 } from 'lucide-react';

export default function DropoutModal({
  isOpen,
  onClose,
  onConfirmDropout,
  onTransferCreator,
  onOpenCancelTrip,
  trip,
  currentAccount,
  theme = 'dark'
}) {
  const [selectedSuccessor, setSelectedSuccessor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !trip) return null;

  const isDark = theme === 'dark';

  const isCreator = currentAccount && trip.creator && trip.creator.toLowerCase() === currentAccount.toLowerCase();
  const members = trip.members || [];
  const otherMembers = members.filter(
    m => m.address && m.address.toLowerCase() !== currentAccount?.toLowerCase()
  );

  // คำนวณเงินคืนตามสัดส่วน (Pro-rata)
  const totalCollected = parseFloat(trip.totalCollected || "0");
  const totalSpent = parseFloat(trip.totalSpent || "0");
  const unspentPool = Math.max(totalCollected - totalSpent, 0);

  const myMember = members.find(
    m => currentAccount && m.address.toLowerCase() === currentAccount.toLowerCase()
  );
  const myContributed = myMember ? parseFloat(myMember.contributed || "0") : 0;
  const myRefundAmount = totalCollected > 0
    ? ((myContributed * unspentPool) / totalCollected).toFixed(4)
    : "0.0000";
  const myLossAmount = (myContributed - parseFloat(myRefundAmount)).toFixed(4);

  const handleTransfer = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedSuccessor) {
      setErrorMessage("กรุณาเลือกสมาชิกที่จะแต่งตั้งเป็นหัวหน้าทริปคนใหม่");
      return;
    }
    onTransferCreator(selectedSuccessor);
    onClose();
  };

  const handleDropoutSubmit = () => {
    onConfirmDropout(myRefundAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border transition-all ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between pb-3.5 border-b ${
          isDark ? 'border-[#292524]' : 'border-stone-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isCreator
                ? isDark ? 'bg-[#451A03] text-[#FBBF24] border-[#9A3412]' : 'bg-amber-50 text-amber-600 border-amber-200'
                : isDark ? 'bg-rose-950/40 text-rose-300 border-rose-900/60' : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              {isCreator ? <Crown className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                {isCreator ? 'การถอนตัวของหัวหน้าทริป (Creator Actions)' : 'ขอยกเลิกและถอนตัวจากทริป (Member Dropout)'}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                {isCreator ? 'ข้อกำหนดการเปลี่ยนผ่านความเป็นผู้นำของทริป' : 'คำนวณเงินคืนตามสัดส่วนที่ยังไม่ได้ใช้จริง (Pro-rata Fair Refund)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* กรณีเป็นหัวหน้าทริป (Creator Case) */}
        {isCreator ? (
          <div className="space-y-4 text-xs">
            {/* Warning Alert */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isDark ? 'bg-[#451A03]/30 border-amber-900/60 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className={`flex items-center gap-2 font-medium text-sm ${isDark ? 'text-[#FBBF24]' : 'text-amber-800'}`}>
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>คุณเป็นผู้สร้างทริป (Trip Creator)</span>
              </div>
              <p className={`leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-700'}`}>
                ตามกฎความรับผิดชอบของระบบ <strong>ผู้สร้างทริปไม่สามารถกดถอนตัวทิ้งทริปไปเฉยๆ ได้</strong> เพื่อป้องกันความเสียหายต่อกองกลางของเพื่อนๆ คุณมี 2 ทางเลือกในการดำเนินการ:
              </p>
            </div>

            {/* ทางเลือกที่ 1: แต่งตั้งคนอื่นเป็นหัวหน้าทริป */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
            }`}>
              <div className={`flex items-center gap-2 font-medium text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                <Crown className="w-4 h-4 text-amber-500" />
                <span>ทางเลือกที่ 1: แต่งตั้งสมาชิกคนอื่นเป็นหัวหน้าทริปแทน</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                เมื่อโอนตำแหน่งให้เพื่อนแล้ว คุณจะมีสถานะเป็นสมาชิกทั่วไป และจะสามารถกดถอนตัวเพื่อรับเงินคืนตามสัดส่วนได้ตามปกติ
              </p>

              {otherMembers.length > 0 ? (
                <form onSubmit={handleTransfer} className="space-y-2.5 pt-1">
                  {errorMessage && (
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs animate-fade-in ${
                      isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <select
                    value={selectedSuccessor}
                    onChange={(e) => setSelectedSuccessor(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors border ${
                      isDark
                        ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]'
                        : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                    }`}
                  >
                    <option value="">-- เลือกเพื่อนที่จะให้เป็นหัวหน้าทริปคนใหม่ --</option>
                    {otherMembers.map((m, idx) => (
                      <option key={idx} value={m.address} className={isDark ? 'bg-[#1C1917]' : 'bg-white'}>
                        {m.name || m.address} ({m.contributed} ETH)
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    โอนตำแหน่งหัวหน้าทริปทันที
                  </button>
                </form>
              ) : (
                <div className={`p-3 rounded-xl text-[11px] border ${
                  isDark ? 'bg-[#1C1917] border-[#44403C] text-[#78716C]' : 'bg-stone-100 border-stone-200 text-stone-500'
                }`}>
                  ยังไม่มีสมาชิกคนอื่นในทริปนี้ หากคุณต้องการยกเลิก ให้เลือกทางเลือกที่ 2 ด้านล่าง
                </div>
              )}
            </div>

            {/* ทางเลือกที่ 2: โหวตยกเลิกทริปทั้งหมด */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50/50 border-rose-200/80'
            }`}>
              <div className="flex items-center gap-2 font-medium text-rose-500 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>ทางเลือกที่ 2: ยกเลิกทริปนี้ (ทริปล่ม / ยุบทริป)</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                หากทริปไม่สามารถดำเนินต่อได้ คุณสามารถเปิดโหวตขอยกเลิกทริป เมื่ออนุมัติแล้วระบบจะปิดทริปและคืนเงินส่วนที่เหลือทั้งหมดให้ทุกคนทันที
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCancelTrip();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                เปิดหน้าต่างโหวตยกเลิกทริป
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 rounded-xl font-medium text-xs border transition-colors ${
                  isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                }`}
              >
                ยกเลิกและปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          /* กรณีเป็นสมาชิกทั่วไป (Regular Member Dropout) */
          <div className="space-y-4 text-xs">
            {/* คำอธิบาย Pro-rata */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className={`font-semibold block ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                สรุปการคำนวณเงินคืนตามสัดส่วนจริง (Pro-Rata Policy):
              </span>
              <p className={`leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                ระบบจะคืนเงินเฉพาะส่วนที่ยังไม่ถูกเบิกจ่ายจริง (Unspent Balance) เท่านั้น ส่วนค่าตั๋วหรือที่พักที่โอนให้ Vendor ไปแล้วจะไม่สามารถขอคืนได้ เพื่อความยุติธรรมต่อเพื่อนร่วมทริป
              </p>
            </div>

            {/* ตารางคำนวณเงิน */}
            <div className={`p-4 rounded-xl border space-y-2 font-mono tabular-nums ${
              isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-600'}>ยอดที่คุณโอนเข้ามาทั้งหมด:</span>
                <span className={`font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>{myContributed.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-600'}>หักส่วนที่จ่ายให้ Vendor ไปแล้ว:</span>
                <span className="text-rose-500 font-bold">-{myLossAmount} ETH</span>
              </div>
              <div className={`pt-2 border-t flex justify-between text-sm ${isDark ? 'border-[#44403C]' : 'border-stone-200'}`}>
                <span className={`font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>ยอดเงินที่คุณจะได้รับคืน:</span>
                <span className="font-bold text-[#10B981] text-base">+{myRefundAmount} ETH</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`w-1/2 py-2.5 rounded-xl font-semibold text-xs transition-colors border ${
                  isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                }`}
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleDropoutSubmit}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                ยืนยันถอนตัว & รับเงินคืน
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
