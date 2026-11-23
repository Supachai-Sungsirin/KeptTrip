import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Plus, X, Sparkles, AlertCircle } from 'lucide-react';

export default function AddMilestoneModal({ isOpen, onClose, onAddMilestone, trip, theme = 'dark' }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !trip) return null;

  const isDark = theme === 'dark';

  const currentTotalBudget = (trip.milestones || []).reduce(
    (sum, m) => sum + parseFloat(m.amount || "0"),
    0
  );
  const targetBudget = parseFloat(trip.targetAmount || "0");
  const remainingBudget = Math.max(targetBudget - currentTotalBudget, 0).toFixed(3);
  const numAmount = parseFloat(amount || "0");
  const isExpandingBudget = numAmount > parseFloat(remainingBudget);
  const expansionAmount = isExpandingBudget ? (numAmount - parseFloat(remainingBudget)).toFixed(3) : "0.000";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage("กรุณากรอกชื่อรายการค่าใช้จ่าย");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("กรุณากรอกจำนวนเงิน ETH ให้ถูกต้อง (มากกว่า 0)");
      return;
    }

    const trimmedRecipient = recipient.trim();
    if (trimmedRecipient && !ethers.isAddress(trimmedRecipient)) {
      setErrorMessage("ที่อยู่กระเป๋าผู้รับ (Recipient Address) ไม่ถูกต้องตามรูปแบบ Ethereum");
      return;
    }

    onAddMilestone({
      title: title.trim(),
      amount: amount.trim(),
      recipient: trimmedRecipient || trip.creator,
      expansionAmount: isExpandingBudget ? expansionAmount : 0
    });

    setTitle('');
    setAmount('');
    setRecipient('');
    setErrorMessage('');
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
            <div className={`p-2 rounded-xl ${
              isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                เพิ่มรายการค่าใช้จ่ายย่อย
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                เพิ่มรายการและงบประมาณใหม่ของทริป
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

        {/* Budget Status & Flexibility Notice */}
        <div className={`p-4 rounded-xl border space-y-2 text-xs ${
          isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-600'}>งบประมาณที่จัดสรรตามเป้าเดิม:</span>
            <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
              {currentTotalBudget.toFixed(3)} / {targetBudget.toFixed(3)} ETH
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-600'}>งบเหลือในเป้าหมายเดิม:</span>
            <span className={`font-mono font-bold tabular-nums ${parseFloat(remainingBudget) > 0 ? (isDark ? 'text-[#34D399]' : 'text-emerald-600') : (isDark ? 'text-[#FBBF24]' : 'text-amber-600')}`}>
              {remainingBudget} ETH
            </span>
          </div>

          {/* Auto Expansion Banner if amount exceeds remaining budget */}
          {isExpandingBudget && (
            <div className={`mt-2.5 p-3 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
              isDark
                ? 'bg-[#431407]/40 border-[#9A3412] text-[#FED7AA]'
                : 'bg-orange-50 border-orange-200 text-orange-950'
            }`}>
              <Sparkles className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">ขยายงบประมาณทริปอัตโนมัติ (+{expansionAmount} ETH):</strong>
                ระบบจะปรับเพิ่มเป้าหมายงบรวมของทริปเป็น <strong>{(targetBudget + parseFloat(expansionAmount)).toFixed(3)} ETH</strong> โดยอัตโนมัติ เพื่อให้สามารถเบิกจ่ายและรับเงินสมทบเพิ่มได้
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs animate-fade-in ${
              isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
              ชื่อรายการค่าใช้จ่าย *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ค่ามัดจำที่พัก 2 คืน, ค่าบัตรสวนสนุก, ค่าอาหารเพิ่ม"
              className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                  : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
              จำนวนเงินที่ต้องใช้ (ETH) *
            </label>
            <input
              type="number"
              step="0.001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="เช่น 0.05"
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                  : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
              กระเป๋าผู้รับชำระ (เว้นว่างไว้จะใช้กระเป๋าผู้จัด)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                  : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
              }`}
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`w-1/2 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold shadow-xs transition-colors"
            >
              {isExpandingBudget ? 'ขยายงบ & เพิ่มรายการ' : 'เพิ่มรายการ'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
