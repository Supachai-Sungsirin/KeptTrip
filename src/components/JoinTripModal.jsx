import React, { useState } from 'react';
import { UserPlus, X, Users, ShieldCheck, Wallet, ArrowRight, Check, Compass, Calendar, Coins, Sparkles, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export default function JoinTripModal({
  isOpen,
  onClose,
  trip,
  currentAccount,
  onJoinTrip,
  onDecline,
  theme = 'dark'
}) {
  const { connectWallet } = useWeb3();
  const [nickname, setNickname] = useState('');
  const [joinMode, setJoinMode] = useState('deposit'); // 'deposit' (on-chain Sepolia) | 'free' (off-chain pending)
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !trip) return null;

  const isDark = theme === 'dark';

  // Parse charter
  let charter = {};
  try {
    charter = typeof trip.tripCharterURI === 'string' && trip.tripCharterURI.startsWith('{')
      ? JSON.parse(trip.tripCharterURI)
      : { terms: trip.tripCharterURI || '' };
  } catch {
    charter = { terms: trip.tripCharterURI || '' };
  }

  const isAlreadyMember = currentAccount && (trip.members || []).some(
    m => m.address && m.address.toLowerCase() === currentAccount.toLowerCase()
  );
  const isTripCreator = currentAccount && trip.creator && trip.creator.toLowerCase() === currentAccount.toLowerCase();

  // หากเป็นหัวหน้าทริปหรือเป็นสมาชิกอยู่แล้ว จะไม่แสดง Modal คำเชิญนี้โดยเด็ดขาด
  if (isAlreadyMember || isTripCreator) return null;

  const handleConfirm = async () => {
    if (!currentAccount) {
      connectWallet();
      return;
    }
    setIsSubmitting(true);
    try {
      const amountToSend = joinMode === 'deposit' ? depositAmount : null;
      await onJoinTrip(trip.id, nickname, amountToSend);
    } finally {
      setIsSubmitting(false);
    }
  };

  const truncateAddr = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border transition-all max-h-[92vh] overflow-y-auto ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-start justify-between pb-3.5 border-b ${
          isDark ? 'border-[#292524]' : 'border-stone-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-orange-50 text-orange-600 border-orange-200'
            }`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                คำเชิญเข้าร่วมทริป (Trip Invitation)
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                คุณได้รับคำเชิญเข้าร่วมเป็นสมาชิกทริปนี้
              </p>
            </div>
          </div>
          <button
            onClick={onDecline || onClose}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Already a member or creator warning */}
        {isTripCreator ? (
          <div className={`p-4 rounded-xl border text-xs sm:text-sm ${
            isDark ? 'bg-amber-950/30 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            👑 คุณเป็น <strong>หัวหน้าทริปนี้</strong> อยู่แล้ว สามารถจัดการและดูแลทริปได้ทันที
          </div>
        ) : isAlreadyMember ? (
          <div className={`p-4 rounded-xl border text-xs sm:text-sm ${
            isDark ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            ✓ คุณเป็น <strong>สมาชิกของทริปนี้</strong> เรียบร้อยแล้ว สามารถดูรายละเอียดหรือสมทบเงินกองกลางได้เลย
          </div>
        ) : (
          <>
            {/* Trip Summary Card */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#292524]/60 border-[#44403C]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>
                  ทริป #{trip.id}
                </span>
                <span className={`text-xs flex items-center gap-1 font-mono ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                  <Users className="w-3.5 h-3.5 text-[#EA580C]" />
                  สมาชิกปัจจุบัน {trip.members?.length || trip.activeMembersCount || 1} คน
                </span>
              </div>

              <div>
                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {trip.tripName}
                </h4>
                <p className={`text-xs mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                  <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>จุดหมาย: {trip.destination || trip.tripName}</span>
                  {trip.dates && (
                    <>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{trip.dates}</span>
                    </>
                  )}
                </p>
              </div>

              <div className={`grid grid-cols-2 gap-3 pt-2 border-t ${
                isDark ? 'border-[#44403C]' : 'border-stone-200'
              }`}>
                <div>
                  <span className={`text-[11px] block ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                    เป้าหมายงบกองกลาง
                  </span>
                  <span className="text-sm font-bold font-mono text-[#EA580C]">
                    {trip.targetAmount} ETH
                  </span>
                </div>
                <div>
                  <span className={`text-[11px] block ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                    ยอดสมทบต่อคน (ประมาณ)
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-500">
                    {charter.expectedPerMember || trip.memberShare || `${(parseFloat(trip.targetAmount) / Math.max(trip.members?.length || 1, 1)).toFixed(3)} ETH`}
                  </span>
                </div>
              </div>
            </div>

            {/* Member Name Input */}
            <div className="space-y-1.5 text-xs">
              <label className={`block font-medium ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                ชื่อหรือฉายาของคุณในทริปนี้:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น ก้อง, มีนา, ตั้ม (เว้นว่างไว้เพื่อใช้ที่อยู่กระเป๋า)"
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C] border transition-colors ${
                  isDark
                    ? 'bg-[#292524] border-[#44403C] text-white placeholder-[#78716C]'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                }`}
              />
            </div>

            {/* Mode Selection: On-Chain Contribution vs Free Join */}
            <div className="space-y-2 text-xs">
              <label className={`block font-medium ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                รูปแบบการเข้าร่วม:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJoinMode('deposit')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    joinMode === 'deposit'
                      ? isDark
                        ? 'bg-[#431407] border-[#EA580C] text-white ring-1 ring-[#EA580C]'
                        : 'bg-orange-50 border-orange-500 text-stone-900 ring-1 ring-orange-500'
                      : isDark
                        ? 'bg-[#292524] border-[#44403C] text-[#A8A29E] hover:border-[#78716C]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Coins className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>สมทบเงินทันที</span>
                  </div>
                  <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                    บันทึกลงบล็อกเชน Sepolia เจ้าของทริปเห็นทันทีและได้สิทธิ์โหวต
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setJoinMode('free')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    joinMode === 'free'
                      ? isDark
                        ? 'bg-[#431407] border-[#EA580C] text-white ring-1 ring-[#EA580C]'
                        : 'bg-orange-50 border-orange-500 text-stone-900 ring-1 ring-orange-500'
                      : isDark
                        ? 'bg-[#292524] border-[#44403C] text-[#A8A29E] hover:border-[#78716C]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <UserPlus className="w-3.5 h-3.5 text-amber-500" />
                    <span>เข้าร่วมไว้ก่อน</span>
                  </div>
                  <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                    ยังไม่โอนเงิน (ผ่อนผัน) แล้วค่อยสมทบเงินภายหลัง
                  </p>
                </button>
              </div>

              {joinMode === 'free' && (
                <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed mt-2 ${
                  isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  ⚠️ <strong>คำแนะนำ:</strong> การเข้าร่วมแบบยังไม่โอนเงิน จะบันทึกสถานะรอยืนยันไว้ในเบราว์เซอร์นี้ เมื่อคุณโอนเงินสมทบผ่าน MetaMask ในภายหลัง ระบบจะบันทึก Address ของคุณลงบนบล็อกเชน Sepolia ให้เพื่อนทุกคนเห็นตรงกันทันที
                </div>
              )}

              {joinMode === 'deposit' && (
                <div className={`p-3 rounded-xl border space-y-2 mt-2 ${
                  isDark ? 'bg-[#0C0A09] border-[#292524]' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-600'}>
                      จำนวนเงินสมทบกองกลาง (ETH):
                    </span>
                    <span className="font-mono text-[11px] text-[#EA580C] font-semibold">
                      แนะนำ 0.001 - 0.05 ETH
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.0001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.001"
                      className={`w-full rounded-xl pl-3 pr-14 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#EA580C] border ${
                        isDark
                          ? 'bg-[#1C1917] border-[#44403C] text-white'
                          : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold ${
                      isDark ? 'text-[#A8A29E]' : 'text-stone-500'
                    }`}>
                      ETH
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>MetaMask จะเด้งขึ้นมาให้กดยืนยันโอนเงิน และบันทึกสิทธิ์สมาชิกบน Sepolia ทันที</span>
                  </p>
                </div>
              )}
            </div>

            {/* Wallet Status */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              currentAccount
                ? isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 shrink-0" />
                <span>
                  {currentAccount ? (
                    <>กระเป๋าที่จะใช้เข้าร่วม: <span className="font-mono font-bold">{truncateAddr(currentAccount)}</span></>
                  ) : (
                    "ยังไม่ได้เชื่อมต่อกระเป๋า MetaMask"
                  )}
                </span>
              </div>
              {!currentAccount && (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="px-2.5 py-1 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] font-semibold transition-colors"
                >
                  เชื่อมต่อ
                </button>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onDecline || onClose}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${
              isDark
                ? 'bg-[#292524] border-[#44403C] text-[#A8A29E] hover:text-white hover:bg-[#3E3835]'
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {isAlreadyMember || isTripCreator ? "ปิดหน้าต่าง" : "ปฏิเสธ / กลับหน้าแรก"}
          </button>

          {!isAlreadyMember && !isTripCreator && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังดำเนินการ...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {!currentAccount
                      ? "เชื่อมต่อกระเป๋าเพื่อร่วมทริป"
                      : joinMode === 'deposit'
                      ? `โอนสมทบ ${depositAmount || '0.001'} ETH & ร่วมทริป (MetaMask)`
                      : "เข้าร่วมทริป (ยังไม่โอนเงิน)"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
