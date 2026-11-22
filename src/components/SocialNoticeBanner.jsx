import React from 'react';
import { AlertCircle, Clock, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SocialNoticeBanner({ trip, currentAccount, onQuickPay, theme = 'dark' }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!trip) return null;

  const isDark = theme === 'dark';

  // อ่านนโยบายจาก tripCharterURI (JSON หรือข้อความ)
  let charter = {};
  try {
    charter = typeof trip.tripCharterURI === 'string' && trip.tripCharterURI.startsWith('{')
      ? JSON.parse(trip.tripCharterURI)
      : { terms: trip.tripCharterURI || '' };
  } catch {
    charter = { terms: trip.tripCharterURI || '' };
  }

  const members = trip.members || [];
  const overdueMembers = members.filter(m => m.status === 'overdue');
  const graceMembers = members.filter(m => m.status === 'grace');

  // ตรวจสอบว่าบัญชีที่กำลังเชื่อมต่อมียอดค้างชำระหรือไม่
  const myMemberInfo = members.find(
    m => currentAccount && m.address.toLowerCase() === currentAccount.toLowerCase()
  );
  const isMyTurnToPay = myMemberInfo && (myMemberInfo.status === 'overdue' || myMemberInfo.status === 'grace');

  // ข้อความนโยบายภาษาไทย
  const getPolicyLabel = (policy) => {
    switch (policy) {
      case 'strict':
        return 'เคร่งครัด: ต้องจ่ายตรงวันเท่านั้น (No Grace Period)';
      case 'grace_3_days':
        return 'ผ่อนผันได้ไม่เกิน 3 วัน (Grace Period: 3 Days)';
      case 'rollover':
        return 'อนุญาตให้ทบยอดไปจ่ายรวมงวดถัดไปได้';
      default:
        return 'จ่ายสมทบได้ตามความสะดวก (Flexible)';
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. แจ้งเตือนเฉพาะตัวผู้ใช้หากมียอดค้างชำระ (Personal Urgent Call to Action) */}
      {isMyTurnToPay && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
          isDark
            ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-2 rounded-xl mt-0.5 sm:mt-0 shrink-0 ${
              isDark ? 'bg-rose-900/60 text-rose-200' : 'bg-rose-100 text-rose-700'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold text-sm ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>
                  {myMemberInfo.status === 'overdue' ? 'ยอดค้างชำระประจำงวด' : 'กำลังอยู่ในระยะผ่อนผัน'}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium tabular-nums border ${
                  isDark ? 'bg-rose-900/50 border-rose-800 text-rose-200' : 'bg-rose-100 border-rose-200 text-rose-800'
                }`}>
                  {charter.expectedPerMember ? `เป้าหมาย ${charter.expectedPerMember} ETH` : 'ต้องชำระเพิ่ม'}
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
                คุณโอนเข้ามาแล้ว <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-white' : 'text-rose-900'}`}>{myMemberInfo.contributed} ETH</span> ({getPolicyLabel(charter.latePolicy)}) กรุณาโอนสมทบเพื่อให้โครงการดำเนินต่อได้
              </p>
            </div>
          </div>
          <button
            onClick={() => onQuickPay(charter.expectedPerMember ? (parseFloat(charter.expectedPerMember) - parseFloat(myMemberInfo.contributed)).toFixed(3) : "0.05")}
            className="self-end sm:self-center shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>โอนเงินงวดนี้</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. การแจ้งเตือนส่วนกลางให้สมาชิกทุกคนรับรู้ร่วมกัน (Social Accountability Notice) */}
      {(overdueMembers.length > 0 || graceMembers.length > 0) && (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs ${
          isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isDark ? 'bg-[#451A03] text-[#FBBF24]' : 'bg-amber-50 text-amber-600'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className={`text-xs sm:text-sm font-bold flex items-center gap-2 flex-wrap ${
                  isDark ? 'text-[#F5F5F4]' : 'text-stone-900'
                }`}>
                  <span>สถานะการสมทบเงินงวดปัจจุบัน</span>
                  <span className={`text-xs font-normal ${isDark ? 'text-[#78716C]' : 'text-stone-500'}`}>
                    (กำหนดชำระ: {charter.dueDate || 'ตามแผนงาน'} • {getPolicyLabel(charter.latePolicy)})
                  </span>
                </h4>

                {/* Quick Summary Pill */}
                <div className="flex items-center gap-2 text-xs">
                  {overdueMembers.length > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                      isDark ? 'bg-rose-950/50 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      ค้างชำระ {overdueMembers.length} คน
                    </span>
                  )}
                  {graceMembers.length > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                      isDark ? 'bg-[#451A03] border-amber-900/60 text-[#FBBF24]' : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      ผ่อนผัน {graceMembers.length} คน
                    </span>
                  )}
                </div>
              </div>

              {/* รายการคนที่ค้างชำระ / ผ่อนผัน */}
              {(() => {
                const allNoticeMembers = [
                  ...overdueMembers.map(m => ({ ...m, noticeType: 'overdue' })),
                  ...graceMembers.map(m => ({ ...m, noticeType: 'grace' }))
                ];
                const displayLimit = 6;
                const visibleMembers = isExpanded ? allNoticeMembers : allNoticeMembers.slice(0, displayLimit);
                const hasMore = allNoticeMembers.length > displayLimit;

                return (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {visibleMembers.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                          m.noticeType === 'overdue'
                            ? isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
                            : isDark ? 'bg-[#451A03] border-amber-900/60 text-[#FBBF24]' : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.noticeType === 'overdue' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold">{m.name || m.address.substring(0, 8)}</span>
                        <span className={`font-mono text-[11px] ${
                          m.noticeType === 'overdue'
                            ? isDark ? 'text-rose-400' : 'text-rose-600'
                            : isDark ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                          ({m.noticeType === 'overdue' ? 'ค้างชำระ' : 'ผ่อนผัน'})
                        </span>
                      </div>
                    ))}

                    {hasMore && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`px-3 py-1 rounded-full font-medium text-xs transition-colors border ${
                          isDark ? 'bg-[#292524] hover:bg-[#44403C] text-[#A8A29E] border-[#44403C]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                        }`}
                      >
                        {isExpanded ? 'ย่อลง ▴' : `+ อีก ${allNoticeMembers.length - displayLimit} คน (ดูทั้งหมด) ▾`}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 3. หากทุกคนจ่ายครบแล้ว แสดงกล่องความสำเร็จ */}
      {overdueMembers.length === 0 && graceMembers.length === 0 && members.length > 0 && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs ${
          isDark
            ? 'bg-[#064E3B]/40 border-emerald-900/60 text-[#34D399]'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="font-medium">สมาชิกทุกคน ({members.length} คน) สมทบเงินตรงตามกำหนดของงวดปัจจุบันครบถ้วน</span>
          </div>
          <span className={`hidden sm:inline text-[11px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {getPolicyLabel(charter.latePolicy)}
          </span>
        </div>
      )}
    </div>
  );
}
