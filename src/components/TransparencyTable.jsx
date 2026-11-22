import React, { useState, useMemo } from 'react';
import { History, ExternalLink, ArrowDownLeft, ShieldCheck, Vote, Compass, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEPOLIA_EXPLORER } from '../config/constants';

export default function TransparencyTable({ trip, theme = 'dark' }) {
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  if (!trip) return null;

  const isDark = theme === 'dark';
  const events = trip.events || [];

  // Event category counts
  const paidCount = events.filter(e => e.type === 'MilestonePaid').length;
  const contribCount = events.filter(e => e.type === 'FundsContributed').length;
  const approvedCount = events.filter(e => e.type === 'MilestoneApproved').length;
  const dropoutCount = events.filter(e => e.type === 'MemberDroppedOut').length;

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (eventTypeFilter === 'all') return true;
      return e.type === eventTypeFilter;
    });
  }, [events, eventTypeFilter]);

  const totalPages = Math.max(Math.ceil(filteredEvents.length / pageSize), 1);
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvents = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, safePage, pageSize]);

  const getEventBadge = (type) => {
    switch (type) {
      case 'MilestonePaid':
        return {
          icon: <ShieldCheck className="w-3 h-3 text-[#10B981]" />,
          bg: isDark ? 'bg-[#064E3B] border-emerald-900/60 text-[#34D399]' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
          label: 'เบิกจ่ายสำเร็จ'
        };
      case 'MilestoneApproved':
        return {
          icon: <Vote className="w-3 h-3 text-[#EA580C]" />,
          bg: isDark ? 'bg-[#431407] border-[#9A3412] text-[#FB923C]' : 'bg-orange-50 border-orange-200 text-orange-700',
          label: 'โหวตอนุมัติ'
        };
      case 'FundsContributed':
        return {
          icon: <ArrowDownLeft className="w-3 h-3 text-[#EA580C]" />,
          bg: isDark ? 'bg-[#431407]/70 border-[#9A3412]/60 text-[#FB923C]' : 'bg-orange-50/70 border-orange-200 text-orange-700',
          label: 'สมทบเงินเข้า'
        };
      case 'MemberDroppedOut':
        return {
          icon: <LogOut className="w-3 h-3 text-rose-500" />,
          bg: isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700',
          label: 'ถอนตัว & คืนเงิน'
        };
      case 'TripCancelled':
        return {
          icon: <LogOut className="w-3 h-3 text-rose-500" />,
          bg: isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700',
          label: 'ยกเลิกทริป'
        };
      case 'TripCancelVoteCast':
        return {
          icon: <Vote className="w-3 h-3 text-amber-500" />,
          bg: isDark ? 'bg-[#451A03] border-amber-900/60 text-[#FBBF24]' : 'bg-amber-50 border-amber-200 text-amber-800',
          label: 'โหวตยุบทริป'
        };
      case 'TripCreatorTransferred':
        return {
          icon: <Compass className="w-3 h-3 text-amber-500" />,
          bg: isDark ? 'bg-[#451A03] border-amber-900/60 text-[#FBBF24]' : 'bg-amber-50 border-amber-200 text-amber-800',
          label: 'แต่งตั้งหัวหน้าใหม่'
        };
      case 'RefundIssued':
        return {
          icon: <ArrowDownLeft className="w-3 h-3 text-[#10B981]" />,
          bg: isDark ? 'bg-[#064E3B] border-emerald-900/60 text-[#34D399]' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
          label: 'คืนเงินสำเร็จ'
        };
      default:
        return {
          icon: <Compass className="w-3 h-3 text-stone-400" />,
          bg: isDark ? 'bg-[#292524] border-[#44403C] text-[#A8A29E]' : 'bg-stone-100 border-stone-200 text-stone-700',
          label: 'กิจกรรมในทริป'
        };
    }
  };

  return (
    <div className={`rounded-2xl p-6 sm:p-7 shadow-sm transition-colors ${
      isDark ? 'bg-[#1C1917] border border-[#292524] text-[#F5F5F4]' : 'bg-[#FFFFFF] border border-[#E7E5E4] text-[#1C1917]'
    }`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-[#292524]' : 'border-[#F5F5F4]'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#EA580C]" />
            <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              บันทึกความโปร่งใส (Transparency Ledger)
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium tabular-nums border ${
              isDark ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]' : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {events.length} ธุรกรรม
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
            บันทึกธุรกรรมแบบ On-Chain บน Ethereum Sepolia ตรวจสอบความถูกต้องและประวัติได้แบบ Real-time
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => { setEventTypeFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              eventTypeFilter === 'all'
                ? 'bg-[#EA580C] text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-[#292524] text-[#A8A29E] border border-[#44403C] hover:bg-[#44403C]'
                : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
            }`}
          >
            ทั้งหมด ({events.length})
          </button>
          {paidCount > 0 && (
            <button
              onClick={() => { setEventTypeFilter('MilestonePaid'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-colors border ${
                eventTypeFilter === 'MilestonePaid'
                  ? 'bg-[#10B981] text-white border-emerald-600 font-semibold'
                  : isDark
                  ? 'bg-[#064E3B] text-[#34D399] border-emerald-900/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              เบิกจ่าย ({paidCount})
            </button>
          )}
          {contribCount > 0 && (
            <button
              onClick={() => { setEventTypeFilter('FundsContributed'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-colors border ${
                eventTypeFilter === 'FundsContributed'
                  ? 'bg-[#EA580C] text-white border-orange-600 font-semibold'
                  : isDark
                  ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]'
                  : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
              }`}
            >
              สมทบ ({contribCount})
            </button>
          )}
          {approvedCount > 0 && (
            <button
              onClick={() => { setEventTypeFilter('MilestoneApproved'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-colors border ${
                eventTypeFilter === 'MilestoneApproved'
                  ? 'bg-[#EA580C] text-white border-orange-600 font-semibold'
                  : isDark
                  ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]'
                  : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
              }`}
            >
              โหวต ({approvedCount})
            </button>
          )}
          {dropoutCount > 0 && (
            <button
              onClick={() => { setEventTypeFilter('MemberDroppedOut'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-colors border ${
                eventTypeFilter === 'MemberDroppedOut'
                  ? 'bg-rose-500 text-white border-rose-600 font-semibold'
                  : isDark
                  ? 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              ถอนตัว ({dropoutCount})
            </button>
          )}
        </div>
      </div>

      <div className={`mt-4 overflow-x-auto rounded-xl border shadow-xs max-h-[460px] overflow-y-auto ${
        isDark ? 'border-[#292524] bg-[#1C1917]' : 'border-[#E7E5E4] bg-white'
      }`}>
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className={`sticky top-0 backdrop-blur z-10 border-b ${
            isDark ? 'bg-[#292524]/95 border-[#44403C] text-[#A8A29E]' : 'bg-stone-50/95 border-stone-200 text-stone-600'
          }`}>
            <tr>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">ประเภทรายการ</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">รายละเอียดธุรกรรม</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">จำนวนเงิน</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">ผู้ดำเนินการ / ผู้รับ</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">เวลา</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider text-right">Etherscan</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#292524] bg-[#1C1917]' : 'divide-stone-100 bg-white'}`}>
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan="6" className={`py-8 text-center text-xs ${isDark ? 'text-[#78716C]' : 'text-stone-400'}`}>
                  {events.length === 0 ? 'ยังไม่มีประวัติธุรกรรมในระบบ' : 'ไม่พบประวัติธุรกรรมตามประเภทที่เลือก'}
                </td>
              </tr>
            ) : (
              paginatedEvents.map((evt, idx) => {
                const badge = getEventBadge(evt.type);
                return (
                  <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-[#292524]/50' : 'hover:bg-stone-50/80'}`}>
                    {/* Event Badge */}
                    <td className="py-3.5 px-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.bg}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Title */}
                    <td className={`py-3.5 px-3.5 font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                      {evt.title}
                    </td>

                    {/* Amount */}
                    <td className={`py-3.5 px-3.5 font-mono tabular-nums font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                      {evt.amount || '-'}
                    </td>

                    {/* Actor */}
                    <td className={`py-3.5 px-3.5 font-mono tabular-nums text-xs ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                      {evt.actor}
                    </td>

                    {/* Time */}
                    <td className={`py-3.5 px-3.5 text-xs tabular-nums ${isDark ? 'text-[#78716C]' : 'text-stone-400'}`}>
                      {evt.time}
                    </td>

                    {/* Link */}
                    <td className="py-3.5 px-3.5 text-right">
                      <a
                        href={`${SEPOLIA_EXPLORER}/tx/${evt.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-[#EA580C] hover:underline font-medium transition-colors"
                      >
                        <span>{evt.txHash}</span>
                        <ExternalLink className="w-3 h-3 text-[#EA580C]" />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={`pt-3.5 flex items-center justify-between text-xs ${isDark ? 'text-[#78716C]' : 'text-stone-500'}`}>
          <div>
            แสดง {(safePage - 1) * pageSize + 1} - {Math.min(safePage * pageSize, filteredEvents.length)} จาก {filteredEvents.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={safePage <= 1}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
                safePage <= 1
                  ? 'opacity-40 cursor-not-allowed'
                  : isDark ? 'border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]' : 'border-stone-200 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ก่อนหน้า</span>
            </button>
            <span className={`font-mono px-2 font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={safePage >= totalPages}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
                safePage >= totalPages
                  ? 'opacity-40 cursor-not-allowed'
                  : isDark ? 'border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]' : 'border-stone-200 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <span className="hidden sm:inline">ถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
