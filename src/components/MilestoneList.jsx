import React, { useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { Layers, Plus, CheckCircle2, Clock, AlertTriangle, ExternalLink, Vote, ArrowUpRight, ShieldCheck, FileText, Search } from 'lucide-react';

const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('ipfs://');
};

export default function MilestoneList({
  trip,
  currentAccount,
  onOpenAddMilestone,
  onRequestRelease,
  onApproveMilestone,
  onOpenContribute,
  theme = 'dark'
}) {
  if (!trip) return null;

  const isDark = theme === 'dark';
  const milestones = trip.milestones || [];
  const unspent = parseFloat(trip.unspentBalance || "0");
  const isCreator = currentAccount && trip.creator && trip.creator.toLowerCase() === currentAccount.toLowerCase();

  // ตรวจสอบสิทธิ์การโหวตของผู้ใช้งานปัจจุบัน (ต้องมียอดสมทบเงินในสัญญาแล้วเท่านั้น)
  const myMember = (trip.members || []).find(
    m => currentAccount && m.address && m.address.toLowerCase() === currentAccount.toLowerCase()
  );
  const myContributed = myMember ? parseFloat(myMember.contributed || "0") : 0;
  const canVote = myContributed > 0;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState('all'); // all | voting | paid | draft

  // Selected proof for image preview modal
  const [selectedProof, setSelectedProof] = useState(null);

  // Modal for Request Release
  const [requestModalData, setRequestModalData] = useState(null);
  const [proofInput, setProofInput] = useState('');
  const [recipientInput, setRecipientInput] = useState('');
  const [requestError, setRequestError] = useState('');

  // Milestone counts
  const paidCount = milestones.filter(m => m.isPaid).length;
  const votingCount = milestones.filter(m => !m.isPaid && m.isRequested).length;
  const draftCount = milestones.filter(m => !m.isPaid && !m.isRequested).length;

  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      const matchesFilter = 
        milestoneFilter === 'all' ? true :
        milestoneFilter === 'voting' ? (!m.isPaid && m.isRequested) :
        milestoneFilter === 'paid' ? m.isPaid :
        (!m.isPaid && !m.isRequested);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        m.title.toLowerCase().includes(query) ||
        (m.recipient && m.recipient.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [milestones, milestoneFilter, searchQuery]);

  const openRequestModal = (m) => {
    setRequestModalData(m);
    setProofInput(m.proofData || '');
    setRecipientInput(m.recipient || trip.creator);
    setRequestError('');
  };

  const handleConfirmRequest = (e) => {
    e.preventDefault();
    setRequestError('');
    const trimmedProof = proofInput.trim();
    const trimmedRecipient = recipientInput.trim();

    if (!trimmedProof) {
      setRequestError("กรุณากรอกลิงก์หลักฐานใบเสร็จหรือใบจอง");
      return;
    }
    if (!isSafeUrl(trimmedProof)) {
      setRequestError("ลิงก์หลักฐานต้องขึ้นต้นด้วย https:// หรือ http:// หรือ ipfs:// เท่านั้น");
      return;
    }
    if (trimmedRecipient && !ethers.isAddress(trimmedRecipient)) {
      setRequestError("ที่อยู่กระเป๋าผู้รับเงิน (Recipient) ไม่ถูกต้องตามรูปแบบ Ethereum Address");
      return;
    }

    onRequestRelease(requestModalData.id, trimmedProof, trimmedRecipient);
    setRequestModalData(null);
  };

  return (
    <div className={`rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col transition-colors ${
      isDark ? 'bg-[#1C1917] border border-[#292524] text-[#F5F5F4]' : 'bg-[#FFFFFF] border border-[#E7E5E4] text-[#1C1917]'
    }`}>
      
      {/* Header */}
      <div className={`pb-4 border-b space-y-2 ${isDark ? 'border-[#292524]' : 'border-[#F5F5F4]'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Layers className="w-4 h-4 text-[#EA580C] shrink-0" />
            <h2 className={`text-sm sm:text-base font-bold whitespace-nowrap ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              รายการค่าใช้จ่าย (Milestones)
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium tabular-nums border whitespace-nowrap shrink-0 ${
              isDark ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'
            }`}>
              {milestones.length} รายการ
            </span>
          </div>

          {/* Dynamic Milestone Addition Button */}
          {!trip.isCancelled && onOpenAddMilestone && (
            <button
              onClick={onOpenAddMilestone}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 whitespace-nowrap ${
                isDark
                  ? 'bg-[#431407] text-[#FB923C] border-[#9A3412] hover:bg-[#5a1b09]'
                  : 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] hover:bg-[#FFE4C4]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายการย่อย</span>
            </button>
          )}
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
          เบิกจ่ายเงินตรงเข้า Vendor / ผู้สำรองจ่าย อัตโนมัติเมื่อสมาชิกโหวตอนุมัติเกินกึ่งหนึ่ง (&gt;50%)
        </p>
      </div>

      {/* Search & Status Filters */}
      <div className="pt-4 pb-2 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อรายการค่าใช้จ่าย หรือกระเป๋าผู้รับ..."
            className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none transition-all border ${
              isDark
                ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                : 'bg-[#FFFFFF] border-[#D6D3D1] text-[#1C1917] placeholder-[#A8A29E] focus:border-[#EA580C]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs px-1 ${
                isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-[#A8A29E] hover:text-[#1C1917]'
              }`}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setMilestoneFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              milestoneFilter === 'all'
                ? 'bg-[#EA580C] text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-[#292524] text-[#A8A29E] border border-[#44403C] hover:bg-[#44403C]'
                : 'bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4] hover:bg-[#E7E5E4]'
            }`}
          >
            ทั้งหมด ({milestones.length})
          </button>
          {votingCount > 0 && (
            <button
              onClick={() => setMilestoneFilter('voting')}
              className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                milestoneFilter === 'voting'
                  ? 'bg-[#EA580C] text-white border-orange-600 font-semibold'
                  : isDark
                  ? 'bg-[#431407] text-[#FB923C] border-[#9A3412] hover:bg-[#5a1b09]'
                  : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>เปิดโหวตอยู่ ({votingCount})</span>
            </button>
          )}
          <button
            onClick={() => setMilestoneFilter('paid')}
            className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
              milestoneFilter === 'paid'
                ? 'bg-[#10B981] text-white border-emerald-600 font-semibold'
                : isDark
                ? 'bg-[#064E3B] text-[#34D399] border-emerald-900/60 hover:bg-emerald-900/50'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            <span>เบิกจ่ายแล้ว ({paidCount})</span>
          </button>
          <button
            onClick={() => setMilestoneFilter('draft')}
            className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
              milestoneFilter === 'draft'
                ? isDark ? 'bg-[#44403C] text-white border-[#57534E]' : 'bg-stone-200 text-stone-800 border-stone-300'
                : isDark ? 'bg-[#292524] text-[#A8A29E] border-[#44403C] hover:bg-[#44403C]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4] hover:bg-[#E7E5E4]'
            }`}
          >
            <Clock className="w-3 h-3 text-stone-400" />
            <span>รอยื่นเบิก ({draftCount})</span>
          </button>
        </div>
      </div>

      {/* Milestone Cards Scrollable Container */}
      <div className="mt-2 space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredMilestones.length === 0 ? (
          <div className={`text-center py-12 text-xs sm:text-sm border border-dashed rounded-2xl ${
            isDark ? 'border-[#44403C] text-[#78716C]' : 'border-stone-200 text-stone-400'
          }`}>
            {milestones.length === 0
              ? 'ยังไม่มีรายการค่าใช้จ่ายในทริปนี้ กดปุ่ม "เพิ่มรายการย่อย" เพื่อเริ่มต้น'
              : 'ไม่พบรายการค่าใช้จ่ายที่ตรงกับเงื่อนไขการค้นหา'}
          </div>
        ) : (
          filteredMilestones.map((m, idx) => {
            const amount = parseFloat(m.amount || "0");
            const isShortage = unspent < amount && !m.isPaid;
            const shortageAmount = (amount - unspent).toFixed(3);
            const totalMembers = (trip.members && trip.members.length) || trip.activeMembersCount || 4;
            const reqVotes = m.requiredVotes || (Math.floor(totalMembers / 2) + 1);
            const votePercent = Math.min(Math.round(((m.approvalCount || 0) / reqVotes) * 100), 100);

            return (
              <div
                key={m.id || idx}
                className={`relative rounded-2xl p-4 sm:p-5 border transition-all ${
                  m.isPaid
                    ? isDark ? 'bg-[#292524]/40 border-emerald-900/60' : 'bg-stone-50/80 border-emerald-200'
                    : m.isRequested
                    ? isShortage
                      ? isDark ? 'bg-amber-950/30 border-amber-800' : 'bg-amber-50/40 border-amber-200'
                      : isDark ? 'bg-[#431407]/20 border-[#EA580C] shadow-sm' : 'bg-white border-orange-300 shadow-sm'
                    : isDark ? 'bg-[#292524]/30 border-[#292524] hover:border-[#44403C]' : 'bg-white border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left: Milestone Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                        isDark ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]' : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        งวดที่ {idx + 1}
                      </span>
                      
                      {/* Status Badges */}
                      {m.isPaid && (
                        <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                          isDark ? 'bg-[#064E3B] text-[#34D399] border-emerald-900/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                          <span>เบิกจ่ายสำเร็จแล้ว</span>
                        </span>
                      )}
                      {!m.isPaid && m.isRequested && !isShortage && (
                        <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                          isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          <Vote className="w-3 h-3 text-[#EA580C]" />
                          <span>เปิดโหวตอนุมัติ</span>
                        </span>
                      )}
                      {!m.isPaid && m.isRequested && isShortage && (
                        <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                          isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span>เงินกองกลางไม่พอ (ขาด {shortageAmount} ETH)</span>
                        </span>
                      )}
                      {!m.isPaid && !m.isRequested && (
                        <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                          isDark ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]' : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>รอยื่นขอเบิกจ่าย</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                      {m.title}
                    </h3>

                    {/* Recipient & Proof */}
                    <div className={`flex flex-wrap items-center gap-4 text-xs ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                      <div>
                        <span className={isDark ? 'text-[#78716C]' : 'text-stone-400'}>ผู้รับ: </span>
                        <span className={`font-mono font-medium tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                          {m.recipient ? `${m.recipient.substring(0, 8)}...${m.recipient.substring(m.recipient.length - 4)}` : 'กระเป๋าผู้จัด'}
                        </span>
                      </div>

                      {m.proofData && (
                        <button
                          onClick={() => setSelectedProof(m.proofData)}
                          className="flex items-center gap-1 text-[#EA580C] hover:underline font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ดูรูปภาพหลักฐานใบเสร็จ</span>
                        </button>
                      )}
                    </div>

                    {/* Voting Progress bar if requested */}
                    {m.isRequested && !m.isPaid && (
                      <div className="pt-2 space-y-1.5">
                        <div className={`flex items-center justify-between text-xs ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                          <span>คะแนนโหวตอนุมัติ ({m.approvalCount || 0} / {reqVotes} เสียง • สมาชิกทั้งหมด {totalMembers} คน)</span>
                          <span className={`font-mono font-bold ${isDark ? 'text-[#EA580C]' : 'text-[#EA580C]'}`}>{votePercent}%</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#292524]' : 'bg-stone-100'}`}>
                          <div
                            className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                            style={{ width: `${votePercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className={`text-base sm:text-lg font-mono font-bold tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                        {amount.toFixed(3)} <span className={`text-xs font-normal font-sans ${isDark ? 'text-[#78716C]' : 'text-stone-400'}`}>ETH</span>
                      </div>
                      <div className={`text-[11px] ${isDark ? 'text-[#78716C]' : 'text-stone-400'}`}>
                        งบประมาณ
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {trip.isCancelled ? (
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                          isDark ? 'border-rose-900/60 bg-rose-950/30 text-rose-400' : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}>
                          ทริปยกเลิกแล้ว
                        </span>
                      ) : (
                        <>
                          {/* 1. ยื่นขอเบิกจ่าย */}
                          {!m.isPaid && !m.isRequested && onRequestRelease && (
                            <button
                              onClick={() => openRequestModal(m)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>ยื่นขอเบิกเงิน</span>
                            </button>
                          )}

                          {/* 2. โหวตอนุมัติ */}
                          {m.isRequested && !m.isPaid && !isShortage && onApproveMilestone && (
                            <button
                              onClick={() => {
                                if (!canVote) return;
                                onApproveMilestone(m.id);
                              }}
                              disabled={m.approvedByMe || !canVote}
                              title={!canVote ? "ต้องโอนเงินสมทบกองกลางก่อนจึงจะมีสิทธิ์โหวตตามกฎสัญญา" : ""}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                m.approvedByMe || !canVote
                                  ? isDark ? 'bg-[#292524] text-[#78716C] cursor-not-allowed border border-[#44403C]' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                  : 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xs'
                              }`}
                            >
                              <Vote className="w-3.5 h-3.5" />
                              <span>{m.approvedByMe ? 'คุณโหวตแล้ว' : !canVote ? 'รอสมทบเพื่อโหวต' : 'โหวตอนุมัติ'}</span>
                            </button>
                          )}

                          {/* 3. ปุ่มเติมเงินถ้าเงินกองกลางขาด */}
                          {m.isRequested && !m.isPaid && isShortage && onOpenContribute && (
                            <button
                              onClick={() => onOpenContribute(shortageAmount)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              <span>เติมเงิน {shortageAmount} ETH</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border ${
            isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#292524]' : 'border-stone-100'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#EA580C]" />
                <span>หลักฐานใบเสร็จ / ใบแจ้งหนี้</span>
              </h3>
              <button
                onClick={() => setSelectedProof(null)}
                className={`p-1.5 rounded-lg text-sm ${isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-stone-400 hover:text-stone-700'}`}
              >
                ✕
              </button>
            </div>

            <div className={`rounded-xl overflow-hidden border flex items-center justify-center min-h-[280px] max-h-[60vh] p-3 ${
              isDark ? 'border-[#292524] bg-[#292524]' : 'border-stone-200 bg-stone-50'
            }`}>
              {selectedProof.startsWith('http') ? (
                <img
                  src={selectedProof}
                  alt="Invoice Proof"
                  className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <div className="hidden text-center p-6 text-sm text-stone-400">
                <p>ไม่สามารถโหลดรูปภาพตัวอย่างได้โดยตรง</p>
                {isSafeUrl(selectedProof) ? (
                  <a
                    href={selectedProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#EA580C] underline mt-2 inline-flex items-center gap-1.5 hover:underline font-semibold"
                  >
                    <span>เปิดดูหลักฐานในแท็บใหม่</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="text-rose-500 text-xs mt-2">ลิงก์ไม่ปลอดภัย ไม่สามารถเปิดได้</p>
                )}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className={`shrink-0 font-medium ${isDark ? 'text-[#78716C]' : 'text-stone-500'}`}>ที่อยู่ไฟล์:</span>
              <p className={`break-all font-mono text-xs tabular-nums select-all ${isDark ? 'text-[#A8A29E]' : 'text-stone-700'}`}>
                {selectedProof}
              </p>
            </div>

            <button
              onClick={() => setSelectedProof(null)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isDark ? 'bg-[#292524] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Request Release Form Modal */}
      {requestModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleConfirmRequest} className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border ${
            isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${isDark ? 'border-[#292524]' : 'border-stone-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-orange-50 text-orange-600'}`}>
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    ยื่นขอเบิกจ่ายเงินงวด
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-[#78716C]' : 'text-stone-500'}`}>{requestModalData.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalData(null)}
                className={`p-1.5 rounded-lg text-sm ${isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-stone-400 hover:text-stone-700'}`}
              >
                ✕
              </button>
            </div>

            {/* Budget notice */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
              isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className={isDark ? 'text-[#A8A29E]' : 'text-stone-600'}>งบประมาณที่จะเบิกจ่าย:</span>
              <span className={`font-mono tabular-nums font-bold text-base ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                {requestModalData.amount} <span className={`font-sans font-normal text-xs ${isDark ? 'text-[#78716C]' : 'text-stone-500'}`}>ETH</span>
              </span>
            </div>

            {requestError && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs animate-fade-in ${
                isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{requestError}</span>
              </div>
            )}

            <div className="space-y-4 text-sm">
              <div>
                <label className={`block font-semibold mb-2 text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                  ลิงก์หลักฐานใบเสร็จ / ใบจอง (URL หรือ IPFS Hash) *
                </label>
                <input
                  type="text"
                  required
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  placeholder="https://... หรือ ipfs://..."
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                      : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-2 text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                  กระเป๋าเงินผู้รับชำระ (Vendor / ผู้สำรองจ่าย)
                </label>
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="0x..."
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums focus:outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                      : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequestModalData(null)}
                className={`w-1/2 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                  isDark ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] hover:bg-[#44403C]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                }`}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold shadow-xs transition-colors"
              >
                ยืนยันส่งคำขอ
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
