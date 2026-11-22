import React from 'react';
import { Target, TrendingUp, PiggyBank, Users, Clock, ArrowDownLeft, ShieldCheck, LogOut, Info, AlertOctagon, RefreshCw } from 'lucide-react';

export default function TripHero({
  trip,
  currentAccount,
  onOpenContribute,
  onOpenDropout,
  onOpenCancelTrip,
  onClaimRefund
}) {
  if (!trip) return null;

  const collected = parseFloat(trip.totalCollected || "0");
  const target = parseFloat(trip.targetAmount || "0.001");
  const spent = parseFloat(trip.totalSpent || "0");
  const unspent = parseFloat(trip.unspentBalance || (collected - spent).toFixed(4));
  const progressPercent = Math.min(Math.round((collected / target) * 100), 100);

  // คำนวณวันคงเหลือ
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = trip.deadline ? trip.deadline - now : 0;
  const daysLeft = Math.max(Math.ceil(timeLeft / 86400), 0);
  const isExpired = timeLeft <= 0;
  const isCancelled = trip.isCancelled || false;

  // อ่านข้อตกลง
  let charter = {};
  try {
    charter = typeof trip.tripCharterURI === 'string' && trip.tripCharterURI.startsWith('{')
      ? JSON.parse(trip.tripCharterURI)
      : { terms: trip.tripCharterURI || '' };
  } catch {
    charter = { terms: trip.tripCharterURI || '' };
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Top: Trip Title & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              ทริป #{trip.id}
            </span>

            {isCancelled ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 bg-rose-50 text-rose-700 border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                ทริปถูกยกเลิกแล้ว (Cancelled)
              </span>
            ) : (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                trip.isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${trip.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {trip.isActive ? 'กำลังเปิดระดมทุน & เบิกจ่าย' : 'ปิดทริปแล้ว'}
              </span>
            )}

            {charter.paymentType === 'installment' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                เก็บเป็นงวด ({charter.expectedPerMember || '0.1'} ETH/คน)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            {trip.tripName}
          </h1>
          {charter.description && (
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {charter.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
          
          {/* ปุ่มสมทบเงิน (ถ้าทริปยังไม่ยกเลิก) */}
          {!isCancelled && (
            <button
              onClick={onOpenContribute}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>สมทบเงิน (Contribute)</span>
            </button>
          )}

          {/* ปุ่มถอนตัวกลางคัน (Pro-rata Dropout) */}
          {!isCancelled && (
            <button
              onClick={onOpenDropout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs sm:text-sm font-medium transition-all shadow-xs"
              title="หากมาไม่ได้ สามารถขอยกเลิกและรับเงินคืนเฉพาะส่วนที่ยังไม่จ่ายจริง"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>ขอยกเลิก/ถอนตัว</span>
            </button>
          )}

          {/* ปุ่มโหวตยกเลิกทริปทั้งหมด */}
          {!isCancelled && (
            <button
              onClick={onOpenCancelTrip}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs sm:text-sm font-medium transition-all shadow-xs"
              title="กรณีทริปล่มหรือไม่เป็นไปตามแผน สมาชิกสามารถโหวตยุบทริปและคืนเงินส่วนที่เหลือได้"
            >
              <AlertOctagon className="w-4 h-4 text-amber-500" />
              <span>โหวตยกเลิกทริป</span>
            </button>
          )}

          {/* ปุ่ม Refund คืนเงิน (เมื่อทริปยกเลิก หรือหมดเวลาไม่ถึงเป้า) */}
          {(isCancelled || (isExpired && collected < target)) && (
            <button
              onClick={onClaimRefund}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>กดรับเงินคืนตามสัดส่วน (Claim Refund)</span>
            </button>
          )}

        </div>
      </div>

      {/* Center: Funding Progress Bar */}
      <div className="py-1">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2 font-medium">
          <span className="text-slate-600 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>ความคืบหน้ายอดสะสม</span>
          </span>
          <span className="font-mono text-slate-900 font-bold tabular-nums">
            {progressPercent}% ({collected} / {target} ETH)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom: 4 Key Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: เป้าหมายรวม */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>เป้าหมายเงินกองกลาง</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {target} <span className="text-xs text-slate-500 font-sans font-normal">ETH</span>
          </div>
        </div>

        {/* Metric 2: เบิกจ่ายแล้วจริง */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>เบิกจ่ายจริงแล้ว</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {spent} <span className="text-xs text-slate-500 font-sans font-normal">ETH</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {trip.milestones ? trip.milestones.filter(m => m.isPaid).length : 0} รายการที่โอนแล้ว
          </p>
        </div>

        {/* Metric 3: เงินคงเหลือใน Smart Contract */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>เงินพร้อมใช้ในกองกลาง</span>
            <PiggyBank className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {unspent} <span className="text-xs text-slate-500 font-sans font-normal">ETH</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ล็อกไว้ใน Smart Contract
          </p>
        </div>

        {/* Metric 4: สมาชิก & วันที่เหลือ */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>สมาชิก & เวลาเหลือ</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums flex items-center justify-between">
            <span>{trip.activeMembersCount || 0} คน</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white font-mono text-slate-700 border border-slate-200 shadow-xs">
              {daysLeft > 0 ? `${daysLeft} วัน` : 'หมดเวลา'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>ครบกำหนด: {new Date((trip.deadline || now) * 1000).toLocaleDateString('th-TH')}</span>
          </p>
        </div>

      </div>

      {/* ข้อตกลงประจำทริป */}
      {charter.terms && (
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-950">ข้อตกลงและกฎประจำทริป (Trip Charter): </span>
            <span className="text-slate-600 leading-relaxed">{charter.terms}</span>
          </div>
        </div>
      )}

    </div>
  );
}
