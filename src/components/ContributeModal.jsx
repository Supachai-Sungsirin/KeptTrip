import React, { useState } from 'react';
import { ArrowDownLeft, X, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export default function ContributeModal({ isOpen, onClose, onContribute, trip, defaultAmount = "0.05", theme = 'dark' }) {
  const [amount, setAmount] = useState(defaultAmount || "0.05");
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (defaultAmount) setAmount(defaultAmount);
  }, [defaultAmount]);

  if (!isOpen || !trip) return null;

  const isDark = theme === 'dark';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage("กรุณาระบุจำนวนเงิน ETH ให้ถูกต้อง (มากกว่า 0)");
      return;
    }
    if (!agreed) {
      setErrorMessage("กรุณาติ๊กยอมรับข้อตกลงและกฎประจำทริปก่อนทำการโอนเงิน");
      return;
    }
    onContribute(amount);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border transition-all ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-3.5 border-b ${
          isDark ? 'border-[#292524]' : 'border-stone-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
            }`}>
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                สมทบเงินเข้ากองกลางทริป
              </h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                {trip.tripName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              isDark ? 'text-[#78716C] hover:text-[#F5F5F4] hover:bg-[#292524]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {errorMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs animate-fade-in ${
              isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* Quick Amount Buttons */}
          <div>
            <label className={`block font-semibold mb-2 text-xs sm:text-sm ${
              isDark ? 'text-[#F5F5F4]' : 'text-stone-700'
            }`}>
              เลือกจำนวนเงิน ETH ด่วน
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {['0.02', '0.05', '0.10', '0.20'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2.5 rounded-xl border text-center font-mono tabular-nums text-xs sm:text-sm font-bold transition-all ${
                    amount === val
                      ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                      : isDark
                      ? 'bg-[#292524] border-[#44403C] text-[#A8A29E] hover:bg-[#44403C]'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {val} ETH
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className={`block font-semibold mb-2 text-xs sm:text-sm ${
              isDark ? 'text-[#F5F5F4]' : 'text-stone-700'
            }`}>
              หรือระบุจำนวนเงินที่ต้องการโอน (ETH) *
            </label>
            <input
              type="number"
              step="0.001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full rounded-xl px-4 py-2.5 text-lg font-mono tabular-nums font-bold focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]'
                  : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
              }`}
            />
          </div>

          {/* Social Agreement Acceptance */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded accent-[#EA580C]"
              />
              <span className={`text-xs sm:text-[13px] leading-relaxed ${
                isDark ? 'text-[#A8A29E]' : 'text-stone-600'
              }`}>
                ฉันรับทราบและยอมรับ <strong className={isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}>กฎและข้อตกลงประจำทริป</strong>: ทุกการเบิกจ่ายจะต้องผ่านการโหวตจากสมาชิกเกินกึ่งหนึ่ง (&gt;50%) และหากขอยกเลิกกลางคันจะได้รับเงินคืนเฉพาะส่วนที่ยังไม่ถูกเบิกจ่ายจริงเท่านั้น
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`w-1/3 py-2.5 rounded-xl font-semibold text-sm transition-colors border ${
                isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!agreed}
              className={`w-2/3 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors ${
                agreed
                  ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white'
                  : isDark ? 'bg-[#292524] text-[#78716C] cursor-not-allowed' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              ยืนยันการโอนเข้ากองกลาง
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
