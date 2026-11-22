import React, { useState, useMemo } from 'react';
import { Users, UserCheck, AlertCircle, Clock, Copy, Check, Share2, Search, Filter, Crown } from 'lucide-react';

export default function MemberLedger({ trip, currentAccount, onQuickPay, onOpenInvite, theme = 'dark' }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | paid | grace | overdue

  if (!trip) return null;

  const isDark = theme === 'dark';
  const rawMembers = trip.members || [];
  // สมาชิกที่ยังคงอยู่ในทริป (ไม่รวมคนที่ถอนตัวออกไปแล้ว)
  const members = useMemo(() => {
    return rawMembers.filter(m => !m.hasDroppedOut && m.status !== 'dropped');
  }, [rawMembers]);

  const totalSpent = parseFloat(trip.totalSpent || "0");
  const totalCollected = parseFloat(trip.totalCollected || "0.0001");

  // Summary counts
  const paidCount = members.filter(m => m.status === 'paid').length;
  const graceCount = members.filter(m => m.status === 'grace').length;
  const overdueCount = members.filter(m => m.status === 'overdue').length;

  const handleShare = () => {
    if (onOpenInvite) {
      onOpenInvite();
      return;
    }
    const inviteUrl = `${window.location.origin}/?trip=${trip.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        (m.name && m.name.toLowerCase().includes(query)) ||
        (m.address && m.address.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [members, statusFilter, searchQuery]);

  return (
    <div className={`rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col transition-colors ${
      isDark ? 'bg-[#1C1917] border border-[#292524] text-[#F5F5F4]' : 'bg-[#FFFFFF] border border-[#E7E5E4] text-[#1C1917]'
    }`}>
      
      {/* Header */}
      <div className={`pb-4 border-b space-y-2 ${isDark ? 'border-[#292524]' : 'border-[#F5F5F4]'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Users className="w-4 h-4 text-[#EA580C] shrink-0" />
            <h2 className={`text-sm sm:text-base font-bold whitespace-nowrap ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              สถานะการสมทบเงิน (Member Ledger)
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium tabular-nums border whitespace-nowrap shrink-0 ${
              isDark ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'
            }`}>
              {members.length} คน
            </span>
          </div>

          {/* Invite Friends Button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 whitespace-nowrap ${
              isDark
                ? 'bg-[#431407] text-[#FB923C] border-[#9A3412] hover:bg-[#5a1b09]'
                : 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] hover:bg-[#FFE4C4]'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'คัดลอกลิงก์แล้ว' : 'ชวนเพื่อนร่วมทริป'}</span>
          </button>
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
          ติดตามสถานะการโอนเงินของสมาชิกแต่ละคนในทริป และสัดส่วนเงินที่ถูกใช้จริง
        </p>
      </div>

      {/* Large Group Controls: Search & Filter Tabs */}
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
            placeholder="ค้นหาชื่อสมาชิก หรือ Wallet Address (0x...)"
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

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#EA580C] text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-[#292524] text-[#A8A29E] border border-[#44403C] hover:bg-[#44403C]'
                : 'bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4] hover:bg-[#E7E5E4]'
            }`}
          >
            ทั้งหมด ({members.length})
          </button>
          {overdueCount > 0 && (
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                statusFilter === 'overdue'
                  ? 'bg-rose-500 text-white border-rose-600 font-semibold'
                  : isDark
                  ? 'bg-rose-950/40 text-rose-300 border-rose-900/60 hover:bg-rose-900/50'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>ค้างชำระ ({overdueCount})</span>
            </button>
          )}
          {graceCount > 0 && (
            <button
              onClick={() => setStatusFilter('grace')}
              className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                statusFilter === 'grace'
                  ? 'bg-amber-500 text-white border-amber-600 font-semibold'
                  : isDark
                  ? 'bg-[#451A03] text-[#FBBF24] border-amber-900/60 hover:bg-[#5a2104]'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>ผ่อนผัน ({graceCount})</span>
            </button>
          )}
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
              statusFilter === 'paid'
                ? 'bg-[#10B981] text-white border-emerald-600 font-semibold'
                : isDark
                ? 'bg-[#064E3B] text-[#34D399] border-emerald-900/60 hover:bg-emerald-900/50'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>จ่ายครบ ({paidCount})</span>
          </button>
        </div>
      </div>

      {/* Table with Sticky Header */}
      <div className={`mt-2 overflow-x-auto max-h-[480px] overflow-y-auto rounded-xl border shadow-xs ${
        isDark ? 'border-[#292524] bg-[#1C1917]' : 'border-[#E7E5E4] bg-white'
      }`}>
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className={`sticky top-0 backdrop-blur z-10 border-b ${
            isDark ? 'bg-[#292524]/95 border-[#44403C] text-[#A8A29E]' : 'bg-stone-50/95 border-stone-200 text-stone-600'
          }`}>
            <tr>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">สมาชิก</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">ยอดโอนแล้ว</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider hidden md:table-cell">ใช้จริงแล้ว</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider">สถานะงวด</th>
              <th className="py-3 px-3.5 text-[11px] font-bold uppercase tracking-wider text-right">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#292524] bg-[#1C1917]' : 'divide-stone-100 bg-white'}`}>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="5" className={`py-8 text-center text-xs ${isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>
                  ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              filteredMembers.map((m, index) => {
                const isMe = currentAccount && m.address.toLowerCase() === currentAccount.toLowerCase();
                const isTripCreator = trip.creator && m.address.toLowerCase() === trip.creator.toLowerCase();
                const userContributed = parseFloat(m.contributed || "0");
                const userShareOfSpent = totalCollected > 0 
                  ? ((userContributed * totalSpent) / totalCollected).toFixed(4)
                  : "0.0000";

                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isMe
                        ? isDark ? 'bg-[#431407]/25 hover:bg-[#431407]/40' : 'bg-orange-50/40 hover:bg-orange-50/70'
                        : isDark ? 'hover:bg-[#292524]/50' : 'hover:bg-stone-50/80'
                    }`}
                  >
                    {/* สมาชิก */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full border text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]'
                        }`}>
                          {m.name ? m.name.substring(0, 1) : '#'}
                        </div>
                        <div>
                          <div className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                            <span>{m.name || truncateAddress(m.address)}</span>
                            {isTripCreator && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border flex items-center gap-0.5 ${
                                isDark ? 'bg-[#451A03] text-[#FBBF24] border-[#9A3412]' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                <Crown className="w-2.5 h-2.5 text-amber-500" />
                                หัวหน้าทริป
                              </span>
                            )}
                            {isMe && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold border ${
                                isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-orange-100 text-orange-700 border-orange-200'
                              }`}>
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] font-mono tabular-nums ${isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>
                            {truncateAddress(m.address)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ยอดที่โอนแล้ว */}
                    <td className={`py-3.5 px-3.5 font-mono tabular-nums font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                      {m.contributed} <span className={`font-sans font-normal text-xs ${isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>ETH</span>
                    </td>

                    {/* สัดส่วนเงินที่ถูกเบิกจ่ายไปแล้ว */}
                    <td className={`py-3.5 px-3.5 hidden md:table-cell font-mono tabular-nums text-xs ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                      {userShareOfSpent} ETH
                      <div className={`text-[10px] font-sans ${isDark ? 'text-[#78716C]' : 'text-stone-400'}`}>
                        จ่ายจริงแล้ว
                      </div>
                    </td>

                    {/* สถานะงวดนี้ */}
                    <td className="py-3.5 px-3.5">
                      {m.status === 'paid' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isDark ? 'bg-[#064E3B] text-[#34D399] border-emerald-900/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          <span>จ่ายครบ</span>
                        </span>
                      )}
                      {m.status === 'grace' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isDark ? 'bg-[#451A03] text-[#FBBF24] border-amber-900/60' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>ผ่อนผัน</span>
                        </span>
                      )}
                      {m.status === 'overdue' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isDark ? 'bg-rose-950/50 text-rose-300 border-rose-900/60' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>ค้างชำระ</span>
                        </span>
                      )}
                    </td>

                    {/* ดำเนินการ */}
                    <td className="py-3.5 px-3.5 text-right">
                      {isMe && (m.status === 'overdue' || m.status === 'grace') ? (
                        <button
                          onClick={() => onQuickPay("0.04")}
                          className="px-3 py-1 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          โอนสมทบ
                        </button>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-[#44403C]' : 'text-stone-300'}`}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator when filtered */}
      {filteredMembers.length > 0 && filteredMembers.length !== members.length && (
        <div className={`pt-2 text-right text-[11px] font-mono tabular-nums ${isDark ? 'text-[#78716C]' : 'text-stone-400'}`}>
          แสดง {filteredMembers.length} จากทั้งหมด {members.length} คน
        </div>
      )}

    </div>
  );
}
