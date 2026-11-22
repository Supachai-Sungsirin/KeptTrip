import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowRight, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Users, Calendar, Ban, LogOut, Compass } from 'lucide-react';

export default function TripHub({
  trips = [],
  currentAccount,
  onSelectTrip,
  onOpenCreateTrip,
  theme = 'dark'
}) {
  const [filter, setFilter] = useState('all'); // all | active | completed | cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMyTrips, setShowOnlyMyTrips] = useState(true);

  const isDark = theme === 'dark';
  const userAddr = currentAccount ? currentAccount.toLowerCase() : null;

  // 1. กรองทริปตามกระเป๋า ID ที่เชื่อมต่อ (แสดงเฉพาะทริปที่ตนเองเป็นคนสร้าง หรือมีส่วนร่วมเป็นสมาชิกเท่านั้น)
  const myTrips = useMemo(() => {
    if (!userAddr) {
      return [];
    }

    return trips.filter(t => {
      const isCreator = t.creator && t.creator.toLowerCase() === userAddr;
      const isMember = (t.members || []).some(
        m => m.address && m.address.toLowerCase() === userAddr
      );
      const isDropped = (t.droppedOutMembers || []).includes(userAddr) || t.userHasDroppedOut;
      return isCreator || isMember || isDropped;
    });
  }, [trips, userAddr]);

  // 2. คำนวณสถานะของแต่ละทริปอย่างเป็นระเบียบและไม่ซ้ำซ้อน
  const getTripCategory = (t) => {
    const isDropped = t.userHasDroppedOut || (userAddr && (t.droppedOutMembers || []).includes(userAddr));
    const isCancelled = t.isCancelled || isDropped;
    if (isCancelled) return 'cancelled';

    const isAllMilestonesPaid = (t.milestones || []).length > 0 && (t.milestones || []).every(m => m.isPaid);
    const isCompleted = !t.isActive || t.isCompleted || isAllMilestonesPaid;
    if (isCompleted) return 'completed';

    return 'active';
  };

  const activeCount = myTrips.filter(t => getTripCategory(t) === 'active').length;
  const completedCount = myTrips.filter(t => getTripCategory(t) === 'completed').length;
  const cancelledCount = myTrips.filter(t => getTripCategory(t) === 'cancelled').length;

  // 3. กรองตามแท็บ และคำค้นหา
  const filteredTrips = myTrips.filter(t => {
    const category = getTripCategory(t);

    if (filter === 'active' && category !== 'active') return false;
    if (filter === 'completed' && category !== 'completed') return false;
    if (filter === 'cancelled' && category !== 'cancelled') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = (t.tripName || '').toLowerCase().includes(q);
    const matchDest = (t.destination || '').toLowerCase().includes(q);
    return matchName || matchDest;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header: Title & Subtitle */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight leading-tight ${
            isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
          }`}>
            กองทุนท่องเที่ยวของคุณ
          </h1>
          <p className={`text-sm sm:text-[15px] mt-1.5 ${
            isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
          }`}>
            {currentAccount 
              ? `แสดงเฉพาะทริปที่ผูกกับกระเป๋า ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)} (ผู้สร้าง/สมาชิก)`
              : 'เลือกทริปการเดินทางเพื่อจัดการเงินกองกลาง ร่วมโหวตอนุมัติค่าใช้จ่าย และตรวจสอบใบเสร็จกับเพื่อนๆ'}
          </p>
        </div>

        <button
          onClick={onOpenCreateTrip}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างทริปใหม่</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* 4 Tabs: ทั้งหมด, กำลังระดมทุน, เสร็จสิ้นแล้ว, ยกเลิก/ถอนตัว */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? isDark
                  ? 'bg-[#1C1917] text-[#FFFFFF] border border-[#44403C] shadow-sm'
                  : 'bg-[#1C1917] text-[#FFFFFF]'
                : isDark
                ? 'bg-[#1C1917]/50 text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
                : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
            }`}
          >
            ทริปทั้งหมด ({myTrips.length})
          </button>

          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'active'
                ? isDark
                  ? 'bg-[#1C1917] text-[#FFFFFF] border border-[#44403C] shadow-sm'
                  : 'bg-[#1C1917] text-[#FFFFFF]'
                : isDark
                ? 'bg-[#1C1917]/50 text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
                : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
            }`}
          >
            กำลังเปิดระดมทุน ({activeCount})
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'completed'
                ? isDark
                  ? 'bg-[#1C1917] text-[#FFFFFF] border border-[#44403C] shadow-sm'
                  : 'bg-[#1C1917] text-[#FFFFFF]'
                : isDark
                ? 'bg-[#1C1917]/50 text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
                : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
            }`}
          >
            เสร็จสิ้นแล้ว ({completedCount})
          </button>

          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'cancelled'
                ? isDark
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800 shadow-sm'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                : isDark
                ? 'bg-[#1C1917]/50 text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30'
                : 'bg-[#F5F5F4] text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>ยกเลิก/ถอนตัว ({cancelledCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาทริปด้วยชื่อหรือสถานที่..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 ${
              isDark
                ? 'bg-[#1C1917] border border-[#292524] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                : 'bg-[#FFFFFF] border border-[#D6D3D1] text-[#1C1917] placeholder-[#A8A29E] focus:border-[#EA580C]'
            }`}
          />
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'
          }`} />
        </div>
      </div>

      {/* Trips Grid: 3 columns matching FigCraft layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredTrips.map((trip, idx) => {
          const category = getTripCategory(trip);
          const isCancelled = category === 'cancelled';
          const isFinished = category === 'completed' || isCancelled;
          const isUserDropped = trip.userHasDroppedOut || (userAddr && (trip.droppedOutMembers || []).includes(userAddr));

          const collected = parseFloat(trip.totalCollected || "0");
          const target = parseFloat(trip.targetAmount || "0.001");
          const percent = Math.min(Math.round((collected / target) * 100), 100);

          // Dynamic calculation from trip's milestones & members
          const tripMembers = trip.members || [];
          const totalTripMembers = tripMembers.length || trip.activeMembersCount || 1;
          const pendingVotes = (trip.milestones || []).filter(m => m.isRequested && !m.isPaid && !m.approvedByMe);
          const hasAction = !isFinished && (pendingVotes.length > 0 || trip.hasActionRequired);
          const isHighlighted = hasAction || (!isFinished && idx === 0);

          // User status calculation
          const userMember = tripMembers.find(
            m => userAddr ? m.address?.toLowerCase() === userAddr : (m.name && (m.name.includes('(You') || m.name.toLowerCase() === 'you'))
          ) || tripMembers[0];
          const userContributed = parseFloat(userMember?.contributed || "0");
          const memberShareAmount = parseFloat(trip.memberShare || (target / totalTripMembers).toFixed(3));
          const isPaidFull = userContributed >= (memberShareAmount - 0.0001);

          // Dynamic secondary badge
          let secondaryBadgeText = trip.actionBadgeText;
          if (isCancelled) {
            secondaryBadgeText = isUserDropped ? "ถอนตัวและรับเงินคืนแล้ว" : "ยกเลิกแล้ว (เปิดให้เคลมเงินคืน)";
          } else if (category === 'completed') {
            secondaryBadgeText = "ปิดบัญชีกองทุนสมบูรณ์แล้ว";
          } else if (pendingVotes.length > 0) {
            secondaryBadgeText = `ต้องดำเนินการ: รอการโหวต ${pendingVotes.length} รายการ`;
          } else if (!isPaidFull) {
            secondaryBadgeText = `รอชำระงวดนี้: ${(memberShareAmount - userContributed).toFixed(3)} ETH`;
          }

          return (
            <div
              key={trip.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                isDark
                  ? `bg-[#1C1917] ${isHighlighted ? 'border-2 border-[#EA580C] shadow-lg shadow-orange-950/20' : 'border border-[#292524] hover:border-[#44403C]'}`
                  : `bg-[#FFFFFF] ${isHighlighted ? 'border-2 border-[#EA580C] shadow-lg shadow-orange-500/10' : 'border border-[#E7E5E4] hover:border-[#D6D3D1]'}`
              }`}
            >
              {/* Card Top: Badges & Delete Action */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-4 justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    {isCancelled ? (
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 ${
                        isDark ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        <Ban className="w-3 h-3" />
                        <span>{isUserDropped ? 'คุณถอนตัวแล้ว' : 'ยกเลิกทริปแล้ว'}</span>
                      </span>
                    ) : category === 'completed' ? (
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                        isDark ? 'bg-[#292524] text-[#A8A29E]' : 'bg-[#F5F5F4] text-[#78716C]'
                      }`}>
                        เสร็จสิ้นแล้ว
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                        isDark ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#ECFDF5] text-[#047857]'
                      }`}>
                        เปิดระดมทุน
                      </span>
                    )}

                    {/* Secondary Notice Badge */}
                    {secondaryBadgeText ? (
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                        isCancelled
                          ? isDark ? 'bg-rose-950/40 text-rose-300' : 'bg-rose-50 text-rose-700'
                          : hasAction
                          ? isDark ? 'bg-[#451A03] text-[#FBBF24]' : 'bg-[#FEF3C7] text-[#B45309]'
                          : isFinished
                          ? isDark ? 'bg-[#292524] text-[#78716C]' : 'bg-[#F5F5F4] text-[#78716C]'
                          : isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
                      }`}>
                        {secondaryBadgeText}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Title */}
                <h2 className={`text-lg sm:text-[19px] font-bold tracking-tight leading-snug line-clamp-1 ${
                  isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
                }`}>
                  {trip.tripName}
                </h2>

                {/* Dates & Members */}
                <p className={`text-xs sm:text-[13px] mt-1.5 ${
                  isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
                }`}>
                  {trip.dates || 'ระยะเวลายืดหยุ่น'} • {trip.friendsLabel || `เพื่อน ${totalTripMembers} คน`}
                </p>

                {/* 1px Divider */}
                <div className={`my-4 h-px w-full ${isDark ? 'bg-[#292524]' : 'bg-[#F5F5F4]'}`} />

                {/* Progress Metric & Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className={isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}>ความคืบหน้าการระดมทุน</span>
                    <span className={`font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>{percent}%</span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className={`h-2 w-full rounded-full overflow-hidden ${
                    isDark ? 'bg-[#292524]' : 'bg-[#E7E5E4]'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCancelled
                          ? 'bg-rose-500'
                          : isHighlighted
                          ? 'bg-[#EA580C]'
                          : percent >= 100
                          ? 'bg-[#10B981]'
                          : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className={`text-[12px] ${isDark ? 'text-[#78716C]' : 'text-[#78716C]'}`}>
                    ยอดระดมทุน: {collected.toFixed(3)} ETH / {target.toFixed(3)} ETH
                  </p>
                </div>

                {/* Status Box */}
                <div className={`mt-4 p-3 rounded-xl text-xs sm:text-[13px] font-medium ${
                  isDark ? 'bg-[#292524]' : 'bg-[#FAF9F6] border border-[#E7E5E4]/60'
                }`}>
                  <span className={
                    isCancelled
                      ? isDark ? 'text-rose-300' : 'text-rose-700'
                      : category === 'completed'
                      ? isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
                      : isPaidFull
                      ? isDark ? 'text-[#34D399]' : 'text-[#047857]'
                      : isDark ? 'text-[#FB923C]' : 'text-[#C2410C]'
                  }>
                    {isCancelled
                      ? (isUserDropped ? 'สถานะ: คุณถอนตัวออกจากทริปแล้ว' : 'สถานะ: ทริปถูกยกเลิก (สามารถเคลมเงินคืนได้)')
                      : category === 'completed'
                      ? 'สถานะของคุณ: ปิดทริปแล้ว (เบิกจ่าย 100%)'
                      : isPaidFull
                      ? `สถานะของคุณ: จ่ายครบแล้ว (${userContributed.toFixed(3)} ETH)`
                      : `สถานะของคุณ: รอการชำระเงิน (${userContributed.toFixed(3)} / ${memberShareAmount.toFixed(3)} ETH)`}
                  </span>
                </div>
              </div>

              {/* Action Button at bottom */}
              <div className="pt-5 mt-auto">
                <button
                  onClick={() => onSelectTrip(trip.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] ${
                    isHighlighted
                      ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-sm'
                      : isCancelled
                      ? isDark
                        ? 'border border-rose-900/60 hover:bg-rose-950/30 text-rose-300'
                        : 'border border-rose-200 hover:bg-rose-50 text-rose-700'
                      : isFinished
                      ? isDark
                        ? 'border border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]'
                        : 'border border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
                      : isDark
                      ? 'border border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]'
                      : 'border border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
                  }`}
                >
                  <span>
                    {isCancelled 
                      ? (isUserDropped ? 'ดูประวัติการถอนตัว' : 'ดูรายละเอียด & เคลมเงินคืน')
                      : isFinished 
                      ? 'ดูประวัติและบันทึกย้อนหลัง' 
                      : 'เข้าสู่แดชบอร์ดทริป'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTrips.length === 0 && (
        <div className={`text-center py-16 px-4 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
        }`}>
          {!userAddr ? (
            <div className="space-y-3">
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
              }`}>
                <Compass className="w-7 h-7" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                กรุณาเชื่อมต่อกระเป๋าเพื่อดูทริปของคุณ
              </h3>
              <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                ระบบจะแสดงเฉพาะทริปที่คุณเป็นผู้สร้าง หรือทริปที่คุณเข้าร่วมเป็นสมาชิกเท่านั้น
              </p>
            </div>
          ) : myTrips.length === 0 ? (
            <div className="space-y-3">
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
              }`}>
                <Compass className="w-7 h-7" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                ไม่พบทริปที่คุณสร้างหรือมีส่วนร่วม
              </h3>
              <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                กระเป๋า {userAddr.substring(0, 6)}...{userAddr.substring(userAddr.length - 4)} ยังไม่ได้สร้างทริปหรือเข้าร่วมในทริปใดๆ
              </p>
              {onOpenCreateTrip && (
                <button
                  onClick={onOpenCreateTrip}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ สร้างทริปแรกของคุณ</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className={`text-sm ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                ไม่พบทริปที่ตรงกับตัวกรองหรือคำค้นหา "{searchQuery}"
              </p>
              <button
                onClick={() => { setSearchQuery(''); setFilter('all'); }}
                className="mt-3 text-xs text-[#EA580C] hover:underline font-medium"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
