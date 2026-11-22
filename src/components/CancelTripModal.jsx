import React, { useState } from 'react';
import { AlertOctagon, X, Users, ShieldAlert, CheckCircle2, DollarSign, Vote, ArrowRight } from 'lucide-react';

export default function CancelTripModal({
  isOpen,
  onClose,
  trip,
  currentAccount,
  onVoteCancelTrip,
  onClaimRefund,
  theme = 'dark'
}) {
  if (!isOpen || !trip) return null;

  const isDark = theme === 'dark';

  const totalCollected = parseFloat(trip.totalCollected || "0");
  const totalSpent = parseFloat(trip.totalSpent || "0");
  const unspentPool = Math.max(totalCollected - totalSpent, 0).toFixed(4);
  const activeMembers = trip.activeMembersCount || 1;
  const reqVotes = Math.floor(activeMembers / 2) + 1;
  const currentVotes = trip.cancelVotesCount || 0;
  const hasVoted = trip.hasVotedCancel || false;
  const isCancelled = trip.isCancelled || false;
  const now = Math.floor(Date.now() / 1000);
  const isExpired = trip.deadline && now >= trip.deadline && totalCollected < parseFloat(trip.targetAmount || "0");
  const isRefundEligible = isCancelled || isExpired;

  // ค้นหายอดเงินของบัญชีตนเอง
  const member = (trip.members || []).find(
    m => currentAccount && m.address.toLowerCase() === currentAccount.toLowerCase()
  );
  const myContributed = member ? parseFloat(member.contributed || "0") : 0;
  const myRefundShare = totalCollected > 0
    ? ((myContributed * parseFloat(unspentPool)) / totalCollected).toFixed(4)
    : "0.0000";

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
              isDark ? 'bg-rose-950/40 text-rose-300 border-rose-900/60' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                {isRefundEligible ? 'ขอรับเงินคืนจากทริป (Claim Refund)' : 'โหวตขอยกเลิกทริป (Vote to Cancel)'}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                {isRefundEligible ? 'สมาชิกทุกคนสามารถกดรับเงินคืนตามสัดส่วนคงเหลือ' : 'กรณีทริปล่มหรือไม่เป็นไปตามแผน สมาชิกสามารถโหวตยุบทริปได้'}
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

        {/* Status Box */}
        {isRefundEligible ? (
          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isDark ? 'bg-rose-950/30 border-rose-900/60 text-rose-200' : 'bg-rose-50 border border-rose-200'
          }`}>
            <div className={`flex items-center gap-2 font-semibold text-sm ${isDark ? 'text-rose-300' : 'text-rose-900'}`}>
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <span>{isCancelled ? 'ทริปนี้ถูกยกเลิกอย่างเป็นทางการแล้ว' : 'ทริปหมดเวลาและยอดไม่ถึงเป้าหมาย (ทริปล่ม)'}</span>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-700'}`}>
              การเบิกจ่ายทุกรายการถูกระงับถาวร เงินในกองกลางที่เหลืออยู่ทั้งหมด <strong className={isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}>{unspentPool} ETH</strong> จะถูกคืนให้สมาชิกตามสัดส่วนเงินที่แต่ละคนได้โอนเข้ามา
            </p>
          </div>
        ) : (
          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isDark ? 'bg-[#451A03]/30 border-amber-900/60' : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium flex items-center gap-1.5 ${isDark ? 'text-[#FBBF24]' : 'text-amber-900'}`}>
                <Vote className="w-4 h-4 text-amber-500" />
                <span>คะแนนเสียงโหวตขอยกเลิกทริป:</span>
              </span>
              <span className={`font-mono font-bold text-sm tabular-nums ${isDark ? 'text-[#FBBF24]' : 'text-amber-800'}`}>
                {currentVotes} / {reqVotes} เสียง (&gt;50%)
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#292524]' : 'bg-stone-200'}`}>
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min((currentVotes / reqVotes) * 100, 100)}%` }}
              />
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
              เมื่อเสียงโหวตเกินกึ่งหนึ่ง (&gt;50%) หรือหัวหน้าทริปขอยกเลิก ทริปจะถูกปิดทันที และเงินคงเหลือจะถูกจัดสรรคืนทุกคน
            </p>
          </div>
        )}

        {/* Refund Calculation for Current User */}
        <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${
          isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
        }`}>
          <div className="font-medium flex items-center justify-between">
            <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-700'}>สรุปเงินกองกลางและการคืนเงิน:</span>
            <span className={isDark ? 'text-[#78716C]' : 'text-stone-500'}>เงินคงเหลือในสัญญา: <strong className={`font-mono tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>{unspentPool} ETH</strong></span>
          </div>

          <div className={`divide-y font-mono text-xs pt-1 ${isDark ? 'divide-[#44403C]' : 'divide-stone-200'}`}>
            <div className="flex items-center justify-between py-1.5">
              <span className={`font-sans ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>ยอดที่คุณได้โอนสมทบไว้:</span>
              <span className={`font-semibold tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>{myContributed} ETH</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-rose-500">
              <span className="font-sans">หักส่วนที่จ่ายจริงไปแล้ว (ตั๋ว/ที่พัก):</span>
              <span className="font-semibold tabular-nums">
                -{myContributed > 0 ? (myContributed - parseFloat(myRefundShare)).toFixed(4) : "0.0000"} ETH
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-[#10B981] text-sm">
              <span className="font-sans font-bold">เงินที่คุณจะได้รับคืนเข้ากระเป๋า:</span>
              <span className="font-bold text-base tabular-nums">+{myRefundShare} ETH</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-1/2 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
              isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
            }`}
          >
            ปิดหน้าต่าง
          </button>

          {isRefundEligible ? (
            <button
              type="button"
              onClick={() => {
                onClaimRefund(myRefundShare);
                onClose();
              }}
              className="w-1/2 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              กดรับเงินคืน (+{myRefundShare} ETH)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onVoteCancelTrip();
                onClose();
              }}
              disabled={hasVoted}
              className={`w-1/2 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                hasVoted
                  ? isDark ? 'bg-[#292524] text-[#78716C] cursor-not-allowed border border-[#44403C]' : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {hasVoted ? 'คุณได้โหวตยกเลิกแล้ว' : 'ยืนยันโหวตยกเลิกทริป'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
