import React, { useState } from 'react';
import {
  ArrowDownLeft, AlertCircle, CheckCircle2, Clock, Users,
  ShieldCheck, ArrowRight, ExternalLink, RefreshCw, FileText, ChevronRight, Trash2, Ban, UserPlus
} from 'lucide-react';

import MemberLedger from './MemberLedger';
import MilestoneList from './MilestoneList';
import TransparencyTable from './TransparencyTable';
import SocialNoticeBanner from './SocialNoticeBanner';
import ConfirmModal from './ConfirmModal';

export default function RedesignedTripDetail({
  trip,
  currentAccount,
  theme = 'dark',
  onOpenContribute,
  onOpenDropout,
  onOpenCancelTrip,
  onClaimRefund,
  onOpenAddMilestone,
  onRequestRelease,
  onApproveMilestone,
  onQuickPay,
  onOpenInvite,
  onDeleteTrip,
  onOpenJoinTrip
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | treasury | rules
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!trip) return null;

  const isDark = theme === 'dark';

  const collected = parseFloat(trip.totalCollected || "0");
  const target = parseFloat(trip.targetAmount || "0.001");
  const spent = parseFloat(trip.totalSpent || "0");
  const unspent = parseFloat(trip.unspentBalance || (collected - spent).toFixed(3));
  const percent = Math.min(Math.round((collected / target) * 100), 100);

  // Time remaining
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = trip.deadline ? trip.deadline - now : 0;
  const daysLeft = Math.max(Math.ceil(timeLeft / 86400), 0);

  // Parse charter
  let charter = {};
  try {
    charter = typeof trip.tripCharterURI === 'string' && trip.tripCharterURI.startsWith('{')
      ? JSON.parse(trip.tripCharterURI)
      : { terms: trip.tripCharterURI || '' };
  } catch {
    charter = { terms: trip.tripCharterURI || '' };
  }

  // Count milestones & members
  const milestones = trip.milestones || [];
  const members = trip.members || [];
  const quorumPercent = 50;
  const totalMembers = members.length || trip.activeMembersCount || 1;
  const quorumThreshold = Math.floor(totalMembers / 2) + 1;

  // Dynamic user membership calculation
  const isTripCreator = currentAccount && trip.creator && trip.creator.toLowerCase() === currentAccount.toLowerCase();
  const isMember = currentAccount && members.some(
    m => m.address && m.address.toLowerCase() === currentAccount.toLowerCase()
  );

  const myMember = members.find(
    m => currentAccount && m.address && m.address.toLowerCase() === currentAccount.toLowerCase()
  ) || (isTripCreator ? members.find(m => trip.creator && m.address && m.address.toLowerCase() === trip.creator.toLowerCase()) : null) || members[0];

  const myContributed = parseFloat(myMember?.contributed || "0");
  const expectedShareNum = parseFloat(
    charter.expectedPerMember || trip.memberShare || (target / totalMembers).toFixed(3)
  );
  const remainingToPay = Math.max(expectedShareNum - myContributed, 0);
  const isFullyContributed = myContributed >= (expectedShareNum - 0.0001);

  // Dynamic milestone analysis
  const pendingVoteMilestone = milestones.find(
    m => m.isRequested && !m.isPaid && !m.approvedByMe
  );
  const anyVotingMilestone = milestones.find(
    m => m.isRequested && !m.isPaid
  );
  const paidMilestones = milestones.filter(m => m.isPaid);

  // Dynamic Action Required banner logic
  let actionTitle = '';
  let actionDesc = '';
  let isActionUrgent = false;

  if (!isMember && !isTripCreator) {
    isActionUrgent = true;
    actionTitle = 'คุณได้รับคำเชิญเข้าร่วมทริปนี้';
    actionDesc = 'กดปุ่ม "ตอบรับและเข้าร่วมทริป" เพื่อลงทะเบียนเป็นสมาชิก ร่วมสมทบงบประมาณ และมีสิทธิ์ออกเสียงโหวต';
  } else if (pendingVoteMilestone) {
    isActionUrgent = true;
    const mReqVotes = pendingVoteMilestone.requiredVotes || quorumThreshold;
    const mApprovals = pendingVoteMilestone.approvalCount || 0;
    actionTitle = `${pendingVoteMilestone.title} รอการตรวจสอบและโหวตจากคุณ`;
    actionDesc = `เพื่อนๆ โหวตเห็นชอบแล้ว ${mApprovals} จากสมาชิก ${totalMembers} คน (ต้องการอีก ${Math.max(mReqVotes - mApprovals, 1)} เสียงเพื่อให้ครบเกณฑ์ ${mReqVotes} เสียง หรือเกินกึ่งหนึ่ง >50%) เพื่ออนุมัติเบิกจ่าย ${parseFloat(pendingVoteMilestone.amount).toFixed(3)} ETH`;
  } else if (anyVotingMilestone) {
    const mReqVotes = anyVotingMilestone.requiredVotes || quorumThreshold;
    const mApprovals = anyVotingMilestone.approvalCount || 0;
    actionTitle = `${anyVotingMilestone.title} กำลังเปิดโหวต (คุณลงคะแนนแล้ว)`;
    actionDesc = `มีผู้โหวตเห็นชอบแล้ว ${mApprovals}/${mReqVotes} เสียง เมื่อคะแนนครบเกณฑ์ระบบจะโอนเงินให้ผู้รับ ${parseFloat(anyVotingMilestone.amount).toFixed(3)} ETH อัตโนมัติ`;
  } else if (!isFullyContributed && trip.isActive && !trip.isCompleted) {
    isActionUrgent = true;
    actionTitle = `มียอดเงินที่ต้องสมทบเพิ่ม ${remainingToPay.toFixed(3)} ETH`;
    actionDesc = `คุณโอนเข้ามากองกลางแล้ว ${myContributed.toFixed(3)} ETH จากสัดส่วนสมาชิก ${expectedShareNum.toFixed(3)} ETH กรุณาสมทบเงินตามกำหนด`;
  } else {
    actionTitle = trip.isCompleted ? 'ทริปนี้เสร็จสิ้นสมบูรณ์และปิดบัญชีแล้ว' : 'สถานะของคุณเป็นปัจจุบันเรียบร้อย';
    actionDesc = trip.isCompleted
      ? 'การเบิกจ่ายทุกรายการได้รับการอนุมัติและโอนเงินครบถ้วน 100% ข้อมูลบันทึกถาวรบนบล็อกเชน'
      : 'คุณได้สมทบเงินครบถ้วนและไม่มีรายการค้างโหวตในขณะนี้ ระบบจะแจ้งเตือนเมื่อมีการยื่นเบิกเงินใหม่';
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Guest / Invited Friend Join Banner */}
      {!isMember && !isTripCreator && trip.isActive && !trip.isCancelled && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
          isDark
            ? 'bg-gradient-to-r from-[#431407]/60 to-[#1C1917] border-[#EA580C]/40 text-[#F5F5F4]'
            : 'bg-gradient-to-r from-orange-50 to-white border-orange-200 text-stone-900'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isDark ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-orange-500 text-white border-orange-400'
            }`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>คุณได้รับคำเชิญเข้าร่วมทริปนี้</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EA580C]/20 text-[#EA580C] font-semibold border border-[#EA580C]/30">
                  รอตอบรับ
                </span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                กดยืนยันเข้าร่วมเพื่อเป็นสมาชิก ร่วมสมทบงบประมาณ และมีสิทธิ์ออกเสียงโหวตในกองกลาง
              </p>
            </div>
          </div>
          <button
            onClick={onOpenJoinTrip}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>ตอบรับและเข้าร่วมทริป (Join Trip)</span>
          </button>
        </div>
      )}
      
      {/* 1. Header Banner */}
      <div className={`rounded-2xl p-6 sm:p-8 transition-colors ${
        isDark
          ? 'bg-[#1C1917] border border-[#292524]'
          : 'bg-[#FFFFFF] border border-[#E7E5E4]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
                isDark ? 'bg-[#292524] text-[#A8A29E]' : 'bg-[#F5F5F4] text-[#78716C]'
              }`}>
                ทริป #{trip.id < 10 ? `0${trip.id}` : trip.id}
              </span>

              {trip.isCancelled || trip.userHasDroppedOut ? (
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                  isDark ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  <Ban className="w-3 h-3" />
                  <span>{trip.userHasDroppedOut ? 'คุณถอนตัวแล้ว' : 'ยกเลิกทริปแล้ว'}</span>
                </span>
              ) : trip.isActive && !trip.isCompleted ? (
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  isDark ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#ECFDF5] text-[#047857]'
                }`}>
                  เปิดระดมทุน
                </span>
              ) : (
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  isDark ? 'bg-[#292524] text-[#A8A29E]' : 'bg-[#F5F5F4] text-[#78716C]'
                }`}>
                  เสร็จสิ้นแล้ว
                </span>
              )}

              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
              }`}>
                {trip.memberShare || (charter.expectedPerMember ? `${charter.expectedPerMember} ETH` : '0.150 ETH')} / สัดส่วนต่อคน
              </span>
            </div>

            {/* Trip Title */}
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
            }`}>
              {trip.tripName}
            </h1>

            {/* Subtitle / Dates / Multisig Quorum */}
            <p className={`text-xs sm:text-sm ${
              isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
            }`}>
              {trip.dates || '15 ธ.ค. - 22 ธ.ค. 2026'} • สมาชิก {members.length} คน • ฉันทามติ Multisig: เสียงเห็นชอบเกินกึ่งหนึ่ง (&gt;50%)
            </p>
          </div>

          {/* Action Buttons: Contribute Funds or Delete Trip */}
          <div className="flex items-center gap-3 flex-wrap">
            {trip.isActive && !trip.isCompleted && !trip.isCancelled && !trip.userHasDroppedOut && (
              <button
                onClick={onOpenContribute}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>+ สมทบเงินเข้ากองกลาง</span>
              </button>
            )}

            {/* Delete button for completed or cancelled trips */}
            {(!trip.isActive || trip.isCompleted || trip.isCancelled || trip.userHasDroppedOut) && onDeleteTrip && (
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isDark
                    ? 'border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-950/60'
                    : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบทริปนี้</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className={`border-b transition-colors ${
        isDark ? 'border-[#292524]' : 'border-[#E7E5E4]'
      }`}>
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 relative transition-colors ${
              activeTab === 'overview'
                ? 'text-[#EA580C] font-semibold'
                : isDark ? 'text-[#A8A29E] hover:text-[#F5F5F4]' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            1. ภาพรวมและการเงิน
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('treasury')}
            className={`pb-3.5 relative transition-colors ${
              activeTab === 'treasury'
                ? 'text-[#EA580C] font-semibold'
                : isDark ? 'text-[#A8A29E] hover:text-[#F5F5F4]' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            2. สมาชิกและการเบิกจ่าย ({milestones.length} รายการ • {members.length} คน)
            {activeTab === 'treasury' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3.5 relative transition-colors ${
              activeTab === 'rules'
                ? 'text-[#EA580C] font-semibold'
                : isDark ? 'text-[#A8A29E] hover:text-[#F5F5F4]' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            3. กฎเกณฑ์และฉันทามติบล็อกเชน (เกินกึ่งหนึ่ง &gt;50%)
            {activeTab === 'rules' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 3. TAB 1: OVERVIEW & FINANCES (FigCraft Layout) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top 4 Key Financial Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1: Available Balance (Warm highlight) */}
            <div className={`rounded-xl p-5 border transition-all ${
              isDark
                ? 'bg-[#431407]/40 border-[#9A3412]/50'
                : 'bg-[#FFEDD5]/30 border-[#FFEDD5]'
            }`}>
              <span className={`text-xs ${isDark ? 'text-[#FDBA74]' : 'text-[#C2410C]'}`}>
                ยอดเงินพร้อมเบิกจ่ายในกองกลาง
              </span>
              <p className={`text-2xl font-bold tracking-tight mt-1 ${
                isDark ? 'text-[#FED7AA]' : 'text-[#C2410C]'
              }`}>
                {unspent.toFixed(3)} ETH
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#FB923C]/80' : 'text-[#C2410C]/80'}`}>
                พร้อมสำหรับการอนุมัติเบิกจ่าย
              </p>
            </div>

            {/* Metric 2: Total Pool Collected */}
            <div className={`rounded-xl p-5 border transition-all ${
              isDark
                ? 'bg-[#1C1917] border-[#292524]'
                : 'bg-[#FFFFFF] border-[#E7E5E4]'
            }`}>
              <span className={`text-xs ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                ยอดเงินที่ระดมได้ทั้งหมด
              </span>
              <p className={`text-2xl font-bold tracking-tight mt-1 ${
                isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
              }`}>
                {collected.toFixed(3)} / {target.toFixed(3)} ETH
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>
                สะสมแล้ว {percent}% ของเป้าหมาย
              </p>
            </div>

            {/* Metric 3: Disbursed to Date */}
            <div className={`rounded-xl p-5 border transition-all ${
              isDark
                ? 'bg-[#1C1917] border-[#292524]'
                : 'bg-[#FFFFFF] border-[#E7E5E4]'
            }`}>
              <span className={`text-xs ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                เบิกจ่ายไปแล้วทั้งหมด
              </span>
              <p className={`text-2xl font-bold tracking-tight mt-1 ${
                isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
              }`}>
                {spent.toFixed(3)} ETH
              </p>
              <p className={`text-xs mt-1 truncate ${isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>
                {paidMilestones.length > 0
                  ? `เบิกจ่ายแล้ว ${paidMilestones.length} รายการ (${paidMilestones.map(m => m.title.replace(/^รายการที่\s*\d+:\s*/, '')).join(', ')})`
                  : 'ยังไม่มีการเบิกจ่าย'}
              </p>
            </div>

            {/* Metric 4: Funding Window */}
            <div className={`rounded-xl p-5 border transition-all ${
              isDark
                ? 'bg-[#1C1917] border-[#292524]'
                : 'bg-[#FFFFFF] border-[#E7E5E4]'
            }`}>
              <span className={`text-xs ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                ระยะเวลาระดมเงิน
              </span>
              <p className={`text-2xl font-bold tracking-tight mt-1 ${
                isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
              }`}>
                {daysLeft > 0 ? `เหลืออีก ${daysLeft} วัน` : 'ปิดรับระดมทุนแล้ว'}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>
                {trip.deadline ? `ปิดระดมทุนวันที่ ${new Date(trip.deadline * 1000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'ไม่ระบุวันสิ้นสุด'}
              </p>
            </div>

          </div>

          {/* 2-Column Balanced Section: Left Participation & Right Budget Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Your Participation & Next Actions */}
            <div className={`rounded-2xl p-6 sm:p-7 space-y-6 ${
              isDark ? 'bg-[#1C1917] border border-[#292524]' : 'bg-[#FFFFFF] border border-[#E7E5E4]'
            }`}>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                  การมีส่วนร่วมและสิ่งที่ต้องทำของคุณ
                </h3>
              </div>

              {/* Action Required Banner Box */}
              <div className={`rounded-xl p-4 sm:p-5 space-y-2 border ${
                isActionUrgent
                  ? isDark
                    ? 'bg-[#431407]/40 border-[#9A3412]/60'
                    : 'bg-[#FEF3C7] border-[#FDE68A]'
                  : isDark
                  ? 'bg-[#292524]/60 border-[#44403C]'
                  : 'bg-emerald-50/50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                    isActionUrgent
                      ? isDark ? 'bg-[#78350F] text-[#FDE68A]' : 'bg-[#F59E0B] text-white'
                      : isDark ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#10B981] text-white'
                  }`}>
                    {isActionUrgent ? 'แจ้งเตือน: รอการดำเนินการ' : 'สถานะปกติ'}
                  </span>
                </div>
                <h4 className={`text-sm sm:text-[15px] font-semibold ${
                  isActionUrgent
                    ? isDark ? 'text-[#FED7AA]' : 'text-[#92400E]'
                    : isDark ? 'text-[#F5F5F4]' : 'text-[#065F46]'
                }`}>
                  {actionTitle}
                </h4>
                <p className={`text-xs sm:text-[13px] leading-relaxed ${
                  isActionUrgent
                    ? isDark ? 'text-[#FDE68A]/90' : 'text-[#B45309]'
                    : isDark ? 'text-[#A8A29E]' : 'text-[#047857]'
                }`}>
                  {actionDesc}
                </p>
              </div>

              {/* Your Contribution Status */}
              <div className="space-y-3">
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
                }`}>
                  สถานะการโอนเงินสมทบของคุณ
                </span>

                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  isDark ? 'bg-[#292524]' : 'bg-[#F5F5F4]'
                }`}>
                  <div className="space-y-1">
                    <p className={`text-sm sm:text-base font-bold ${
                      isFullyContributed
                        ? isDark ? 'text-[#34D399]' : 'text-[#047857]'
                        : isDark ? 'text-[#FB923C]' : 'text-[#C2410C]'
                    }`}>
                      {myContributed.toFixed(3)} ETH จ่ายแล้ว
                    </p>
                    <p className={`text-xs ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                      {isFullyContributed
                        ? (myMember?.lastPaidAt ? `ชำระครบตามโควตาสมาชิกเมื่อ ${myMember.lastPaidAt}` : `ชำระครบตามสัดส่วนสมาชิก (${expectedShareNum.toFixed(3)} ETH)`)
                        : `ค้างชำระ ${remainingToPay.toFixed(3)} ETH จากเป้าหมาย ${expectedShareNum.toFixed(3)} ETH`}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    isFullyContributed
                      ? isDark ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#ECFDF5] text-[#047857]'
                      : isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
                  }`}>
                    {isFullyContributed ? 'จ่ายครบแล้ว' : 'รอชำระ'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {pendingVoteMilestone ? (
                  <button
                    onClick={() => setActiveTab('treasury')}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <span>ตรวจสอบหลักฐาน & โหวต</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : !isFullyContributed && trip.isActive && !trip.isCompleted ? (
                  <button
                    onClick={onOpenContribute}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <span>+ สมทบเงินงวดนี้ ({remainingToPay.toFixed(3)} ETH)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('treasury')}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <span>ดูประวัติการเบิกจ่าย & โหวต</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('treasury')}
                  className={`w-full sm:w-auto py-3 px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isDark
                      ? 'border border-[#44403C] hover:bg-[#292524] text-[#E7E5E4]'
                      : 'border border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
                  }`}
                >
                  ดูบัญชีรายชื่อสมาชิก
                </button>
              </div>

            </div>

            {/* Right Column: Budget Allocation & Payout Stages */}
            <div className={`rounded-2xl p-6 sm:p-7 space-y-6 ${
              isDark ? 'bg-[#1C1917] border border-[#292524]' : 'bg-[#FFFFFF] border border-[#E7E5E4]'
            }`}>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                  การจัดสรรงบประมาณและขั้นตอนการเบิกจ่าย
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                  เงินจะถูกล็อกอย่างปลอดภัยในสัญญา Smart Escrow จนกว่าแต่ละรายการจะได้รับคะแนนโหวตเกินกึ่งหนึ่ง (&gt;50%) จากเพื่อนๆ
                </p>
              </div>

              {/* Stages List */}
              <div className="space-y-3">
                {milestones.map((m, idx) => {
                  const isPaid = m.isPaid;
                  const isInVoting = m.isRequested && !m.isPaid;
                  const isLocked = !m.isRequested && !m.isPaid;
                  const mReqVotes = m.requiredVotes || quorumThreshold;
                  const mApprovals = m.approvalCount || 0;

                  let dynamicStatusDetail = '';
                  if (isPaid) {
                    dynamicStatusDetail = `ผ่านการโหวต ${mApprovals}/${mReqVotes} เสียง • เบิกจ่ายแล้ว`;
                  } else if (isInVoting) {
                    dynamicStatusDetail = `กำลังเปิดโหวต (เห็นชอบแล้ว ${mApprovals} จากสมาชิก ${totalMembers} คน • เกณฑ์ ${mReqVotes} เสียง)`;
                  } else {
                    dynamicStatusDetail = idx === 0
                      ? 'รอการยื่นขอเบิกจ่ายจากผู้จัด'
                      : `ล็อกไว้ • ปลดล็อกอัตโนมัติเมื่องวดที่ ${idx} เสร็จสิ้น`;
                  }

                  return (
                    <div
                      key={m.id || idx}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isInVoting
                          ? isDark
                            ? 'bg-[#431407]/30 border-[#9A3412]'
                            : 'bg-[#FFEDD5]/40 border-[#EA580C]'
                          : isDark
                          ? 'bg-[#292524] border-transparent'
                          : 'bg-[#F5F5F4] border-transparent'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className={`text-xs sm:text-[14px] font-semibold ${
                          isInVoting
                            ? isDark ? 'text-[#FED7AA]' : 'text-[#C2410C]'
                            : isPaid
                            ? isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
                            : isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
                        }`}>
                          {m.title}
                        </p>
                        <p className={`text-xs ${
                          isInVoting
                            ? isDark ? 'text-[#FDBA74]' : 'text-[#EA580C]'
                            : isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'
                        }`}>
                          {dynamicStatusDetail}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className={`text-xs sm:text-sm font-bold block ${
                          isPaid
                            ? isDark ? 'text-[#34D399]' : 'text-[#047857]'
                            : isInVoting
                            ? isDark ? 'text-[#FB923C]' : 'text-[#EA580C]'
                            : isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'
                        }`}>
                          {parseFloat(m.amount).toFixed(3)} ETH
                        </span>

                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          isPaid
                            ? isDark ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#ECFDF5] text-[#047857]'
                            : isInVoting
                            ? isDark ? 'bg-[#7C2D12] text-[#FED7AA]' : 'bg-[#FFEDD5] text-[#C2410C]'
                            : isDark ? 'bg-[#1C1917] text-[#78716C]' : 'bg-[#E7E5E4] text-[#78716C]'
                        }`}>
                          {isPaid ? 'เบิกจ่ายแล้ว' : isInVoting ? 'กำลังเปิดโหวต' : 'ล็อกไว้'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Bottom Footnote Tip (Matching FigCraft) */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            isDark
              ? 'bg-[#1C1917] border-[#292524] text-[#A8A29E]'
              : 'bg-[#FFFFFF] border-[#E7E5E4] text-[#78716C]'
          }`}>
            <p>
              <strong className={isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}>คำแนะนำ: </strong>
              คลิกที่แท็บ 2 (สมาชิกและการเบิกจ่าย) เพื่อดูระบบโหวตแนบใบเสร็จฉบับเต็ม และประวัติการโอนเงินของเพื่อนทุกคน
            </p>
            <button
              onClick={() => setActiveTab('treasury')}
              className="text-[#EA580C] hover:underline font-semibold ml-4 shrink-0 flex items-center gap-1"
            >
              <span>ไปยังแท็บ 2</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 4. TAB 2: TREASURY & MEMBERS */}
      {activeTab === 'treasury' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Member Ledger (Left) */}
            <div className="space-y-6">
              <MemberLedger
                trip={trip}
                currentAccount={currentAccount}
                onQuickPay={onQuickPay}
                onOpenInvite={onOpenInvite}
                theme={theme}
              />
            </div>

            {/* Milestones & Approvals (Right) */}
            <div className="space-y-6">
              <MilestoneList
                trip={trip}
                currentAccount={currentAccount}
                onOpenAddMilestone={onOpenAddMilestone}
                onRequestRelease={onRequestRelease}
                onApproveMilestone={onApproveMilestone}
                onOpenContribute={onQuickPay}
                theme={theme}
              />
            </div>

          </div>

          {/* Audit Log / Transparency Table */}
          <TransparencyTable trip={trip} theme={theme} />
        </div>
      )}

      {/* 5. TAB 3: BLOCKCHAIN RULES & MULTI-SIG */}
      {activeTab === 'rules' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Social Notice / Policy Banner */}
          <SocialNoticeBanner
            trip={trip}
            currentAccount={currentAccount}
            onQuickPay={onQuickPay}
            theme={theme}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Multi-Sig & Quorum Governance Card */}
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#EA580C]" />
                <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                  กฎเกณฑ์ Multi-Sig Escrow (มติเห็นชอบเกินกึ่งหนึ่ง &gt;50%)
                </h3>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                เงินกองกลางทั้งหมดจะถูกล็อคไว้ใน Ethereum Sepolia Smart Contract โดยไม่มีสมาชิกคนใดสามารถโอนเงินออกตามอำเภอใจได้ การเบิกเงินแต่ละ Milestone จะต้องแนบหลักฐานใบเสร็จ และได้รับคะแนนโหวตอนุมัติเกินกึ่งหนึ่ง (&gt;50%) ของจำนวนสมาชิกที่ร่วมเดินทาง
              </p>
              <div className={`p-4 rounded-xl text-xs space-y-2 ${isDark ? 'bg-[#292524]' : 'bg-[#F5F5F4]'}`}>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}>จำนวนสมาชิกที่ใช้งาน:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>{members.length} คน</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}>คะแนนโหวตขั้นต่ำเพื่อปลดล็อก:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-[#EA580C]' : 'text-[#EA580C]'}`}>
                    {quorumThreshold} เสียง (&gt;50%)
                  </span>
                </div>
              </div>
            </div>

            {/* Fair Pro-Rata Dropout & Trip Cancellation Protection Card */}
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
            }`}>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#EA580C]" />
                <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                  การคืนเงินตามสัดส่วนเป็นธรรม (Pro-Rata Refund) และการยกเลิกทริป
                </h3>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                หากเกิดเหตุฉุกเฉิน สมาชิกสามารถขอถอนตัว (Dropout) โดยระบบจะคำนวณเงินคืนตามสัดส่วนเฉพาะเงินคงเหลือในกองกลาง (Unspent Balance) เท่านั้น เพื่อความเป็นธรรมต่อเพื่อนที่จ่ายค่าตั๋วหรือที่พักไปแล้ว
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onOpenDropout}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    isDark
                      ? 'border-[#44403C] hover:bg-rose-950/30 text-rose-400 hover:border-rose-800'
                      : 'border-[#D6D3D1] hover:bg-rose-50 text-rose-700 hover:border-rose-200'
                  }`}
                >
                  ถอนตัวกลางคัน (Dropout)
                </button>

                <button
                  onClick={onOpenCancelTrip}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    isDark
                      ? 'border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]'
                      : 'border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
                  }`}
                >
                  ขอยกเลิกระงับทริป
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          if (onDeleteTrip) {
            onDeleteTrip(trip.id);
          }
        }}
        title="ยืนยันการลบทริป"
        message={`คุณต้องการลบทริป "${trip.tripName}" ออกจากรายการของคุณใช่หรือไม่?`}
        confirmText="ลบทริป"
        cancelText="ยกเลิก"
        isDestructive={true}
        theme={theme}
      />

    </div>
  );
}
