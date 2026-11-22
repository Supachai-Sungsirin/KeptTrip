import React, { useState } from 'react';
import {
  Compass, ArrowRight, ShieldCheck, Users, Vote, RefreshCw,
  Search, Plus, Sparkles, CheckCircle2, AlertTriangle, Layers,
  ExternalLink, ChevronRight, Lock, DollarSign, Clock, FileText, LayoutGrid
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export default function LandingPage({
  trips = [],
  onSelectTrip,
  onOpenCreateTrip,
  onGoToHub,
  theme = 'dark'
}) {
  const { account } = useWeb3();
  const [tripIdInput, setTripIdInput] = useState('');
  const [searchError, setSearchError] = useState('');

  const isDark = theme === 'dark';

  // ค้นหาทริปที่กระเป๋าที่เชื่อมต่ออยู่นี้เป็นสมาชิกหรือผู้สร้าง (My Trips)
  const myTrips = trips.filter(t => {
    if (!account) return false;
    const isCreator = t.creator && t.creator.toLowerCase() === account.toLowerCase();
    const isMember = (t.members || []).some(m => m.address && m.address.toLowerCase() === account.toLowerCase());
    return isCreator || isMember;
  });

  const handleSearchTrip = (e) => {
    e.preventDefault();
    setSearchError('');
    const id = parseInt(tripIdInput.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setSearchError('กรุณากรอกหมายเลข Trip ID ให้ถูกต้อง (เช่น 1, 2, 3)');
      return;
    }
    const found = trips.find(t => t.id === id);
    if (found) {
      onSelectTrip(id);
    } else {
      setSearchError(`ไม่พบข้อมูลทริปหมายเลข #${id} ในระบบ`);
    }
  };

  return (
    <div className="space-y-20 pb-16 animate-fade-in">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-6">
        
        {/* Web3 Security Badge */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-xs animate-fade-in ${
          isDark
            ? 'bg-[#1C1917] border-[#292524] text-[#A8A29E]'
            : 'bg-[#FFFFFF] border-[#E7E5E4] text-[#78716C]'
        }`}>
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className={`font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
            Ethereum Sepolia Powered
          </span>
          <span className={isDark ? 'text-[#44403C]' : 'text-[#D6D3D1]'}>•</span>
          <span>ระบบกองทุนท่องเที่ยวกลุ่มแรกบนบล็อกเชน</span>
        </div>

        {/* Main Headline */}
        <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.18] ${
          isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
        }`}>
          เที่ยวสบายใจ ไร้กังวลเรื่องเงินกองกลาง{' '}
          <span className="text-[#EA580C]">
            โปร่งใสทุกบาทด้วยบล็อกเชน
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed ${
          isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
        }`}>
          Smart Contract ทำหน้าที่เป็นตู้นิรภัยเก็บเงินออมร่วมกันของกลุ่มเพื่อน
          เบิกจ่ายค่าตั๋วและที่พักตามแผนงานจริง และปลดล็อกโอนเงินอัตโนมัติเมื่อสมาชิกโหวตอนุมัติเกินกึ่งหนึ่ง
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenCreateTrip}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98] shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>สร้างทริปท่องเที่ยวใหม่</span>
          </button>

          <button
            onClick={onGoToHub}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-[#1C1917] border-[#292524] hover:border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]'
                : 'bg-[#FFFFFF] border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-[#EA580C]" />
            <span>ดูหน้ารวมทริปทั้งหมด (Trip Hub)</span>
            <ArrowRight className="w-4 h-4 text-[#EA580C]" />
          </button>
        </div>

        {/* Interactive Preview Mockup Card (Matching FigCraft Preview) */}
        <div className="pt-8 max-w-2xl mx-auto">
          <div className={`rounded-2xl border p-5 sm:p-6 text-left shadow-lg space-y-4 ${
            isDark
              ? 'bg-[#1C1917] border-[#292524]'
              : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <div className={`flex items-center justify-between text-xs pb-3 border-b ${
              isDark ? 'border-[#292524]' : 'border-[#F5F5F4]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className={`font-mono font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                  ตัวอย่างทริปจำลอง #1
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  isDark
                    ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]'
                    : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'
                }`}>
                  Smart Contract Verified
                </span>
              </div>
              <span className="font-mono font-bold text-[#EA580C] tabular-nums">0.450 / 0.600 ETH (75%)</span>
            </div>

            <div className="space-y-2">
              <div className={`text-sm font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                Japan: Tokyo & Fuji Expedition 🌸
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                isDark ? 'bg-[#292524]' : 'bg-[#E7E5E4]'
              }`}>
                <div className="h-full bg-[#EA580C] rounded-full transition-all duration-500" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-[#F5F5F4] border-[#E7E5E4]'
              }`}>
                <div className={`text-[11px] ${isDark ? 'text-[#78716C]' : 'text-[#78716C]'}`}>เบิกจ่ายแล้ว</div>
                <div className="font-mono font-bold text-[#10B981] mt-0.5 text-sm tabular-nums">0.120 ETH</div>
              </div>
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-[#F5F5F4] border-[#E7E5E4]'
              }`}>
                <div className={`text-[11px] ${isDark ? 'text-[#78716C]' : 'text-[#78716C]'}`}>เงินพร้อมใช้</div>
                <div className={`font-mono font-bold mt-0.5 text-sm tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>0.330 ETH</div>
              </div>
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-[#F5F5F4] border-[#E7E5E4]'
              }`}>
                <div className={`text-[11px] ${isDark ? 'text-[#78716C]' : 'text-[#78716C]'}`}>สมาชิกในทริป</div>
                <div className={`font-mono font-bold mt-0.5 text-sm tabular-nums ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>4 คน</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ======================================================== */}
      {/* 2. QUICK ACCESS & MY TRIPS PORTAL                        */}
      {/* ======================================================== */}
      <section id="quick-access" className="max-w-4xl mx-auto space-y-8 scroll-mt-24">
        
        {/* Search Trip Bar */}
        <div className={`rounded-2xl border p-6 sm:p-8 space-y-4 shadow-sm ${
          isDark
            ? 'bg-[#1C1917] border-[#292524]'
            : 'bg-[#FFFFFF] border-[#E7E5E4]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
            }`}>
              <Search className="w-4 h-4" />
            </div>
            <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              เข้าสู่ห้องทริปของคุณ (Enter Trip ID)
            </h2>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
            หากเพื่อนแชร์หมายเลข Trip ID ให้คุณ สามารถกรอกหมายเลขเพื่อเปิดหน้ารายละเอียดและเริ่มสมทบเงินได้ทันที
          </p>

          <form onSubmit={handleSearchTrip} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <input
              type="number"
              min="1"
              value={tripIdInput}
              onChange={(e) => {
                setTripIdInput(e.target.value);
                setSearchError('');
              }}
              placeholder="กรอก Trip ID เช่น 1, 2, 3..."
              className={`w-full sm:flex-1 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                  : 'bg-[#FFFFFF] border-[#D6D3D1] text-[#1C1917] placeholder-[#A8A29E] focus:border-[#EA580C]'
              }`}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm"
            >
              เปิดห้องทริป
            </button>
          </form>

          {searchError && (
            <div className="text-xs text-rose-500 flex items-center gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* My Trips (แสดงเมื่อเชื่อมต่อ Wallet แล้วมีทริป) */}
        {account && myTrips.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#EA580C]" />
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                  ทริปของคุณ (My Trips)
                </h3>
              </div>
              <span className={`text-xs font-mono tabular-nums ${isDark ? 'text-[#78716C]' : 'text-[#78716C]'}`}>
                {myTrips.length} ทริปที่เข้าร่วม
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myTrips.map(t => {
                const isCreator = t.creator && t.creator.toLowerCase() === account.toLowerCase();
                const col = parseFloat(t.totalCollected || "0");
                const tar = parseFloat(t.targetAmount || "0.001");
                const pct = Math.min(Math.round((col / tar) * 100), 100);

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTrip(t.id)}
                    className={`p-5 rounded-2xl border hover:border-[#EA580C] cursor-pointer transition-all space-y-3 ${
                      isDark
                        ? 'bg-[#1C1917] border-[#292524] hover:shadow-lg hover:shadow-orange-950/20'
                        : 'bg-[#FFFFFF] border-[#E7E5E4] hover:shadow-md hover:shadow-orange-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-mono font-medium ${isDark ? 'text-[#78716C]' : 'text-[#78716C]'}`}>
                        ทริป #{t.id}
                      </span>
                      {isCreator ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          isDark
                            ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]'
                            : 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]'
                        }`}>
                          หัวหน้าทริป
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          isDark
                            ? 'bg-[#292524] text-[#A8A29E] border-[#44403C]'
                            : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'
                        }`}>
                          สมาชิก
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold truncate ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                      {t.tripName}
                    </h4>

                    <div className="space-y-1.5">
                      <div className={`flex justify-between text-[11px] font-mono tabular-nums ${
                        isDark ? 'text-[#78716C]' : 'text-[#78716C]'
                      }`}>
                        <span>ยอดสะสม</span>
                        <span className={`font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
                          {col} / {tar} ETH ({pct}%)
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        isDark ? 'bg-[#292524]' : 'bg-[#E7E5E4]'
                      }`}>
                        <div className="h-full bg-[#EA580C] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className={`pt-2 flex items-center justify-between text-xs border-t ${
                      isDark ? 'border-[#292524] text-[#78716C]' : 'border-[#F5F5F4] text-[#78716C]'
                    }`}>
                      <span>สมาชิก {t.activeMembersCount || 0} คน</span>
                      <span className="text-[#EA580C] font-semibold flex items-center gap-1 group">
                        เข้าสู่ทริป <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>

      {/* ======================================================== */}
      {/* 3. PAIN POINTS VS SMART CONTRACT SOLUTION                */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#EA580C] font-semibold">
            Why KeptTrip?
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
          }`}>
            แก้ปัญหาคลาสสิกของการเก็บเงินเที่ยวร่วมกัน
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
            isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
          }`}>
            เปลี่ยนความคลุมเครือของการโอนเข้าบัญชีส่วนตัว มาเป็นระบบที่มีกฎชัดเจนและเป็นธรรมกับทุกคน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Feature 1 */}
          <div className={`p-6 sm:p-7 rounded-2xl border space-y-3 shadow-xs hover:border-[#EA580C]/40 transition-colors ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              ล็อกเงินในตู้นิรภัยบล็อกเชน (No Unilateral Withdrawal)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              ไม่มีใครในทริปสามารถแอบถอนเงินออกไปใช้ตามใจชอบได้ ทุกเม็ดเงินจะถูกล็อกอยู่ใน Smart Contract บน Ethereum Sepolia จนกว่าจะถึงกำหนดจ่ายตามแผนงาน
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`p-6 sm:p-7 rounded-2xl border space-y-3 shadow-xs hover:border-[#EA580C]/40 transition-colors ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#ECFDF5] text-[#047857]'
            }`}>
              <Vote className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              เบิกจ่ายตามงวด พร้อมแนบหลักฐานและโหวตอนุมัติ (&gt;50%)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              เมื่อถึงเวลาจองตั๋วหรือที่พัก ผู้จัดต้องแนบลิงก์รูปใบเสร็จและระบุกระเป๋า Vendor สมาชิกทุกคนจะตรวจสอบและกดโหวต เมื่อคะแนนถึงเกณฑ์ ระบบจะโอนเงินออกอัตโนมัติ
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`p-6 sm:p-7 rounded-2xl border space-y-3 shadow-xs hover:border-[#EA580C]/40 transition-colors ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-[#451A03] text-[#FBBF24]' : 'bg-[#FEF3C7] text-[#B45309]'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              นโยบายจ่ายช้า & แจ้งเตือนโปร่งใส (Social Accountability)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              กำหนดนโยบายงวดและผ่อนผันได้ (เช่น ผ่อนผัน 3 วัน) ตารางสมาชิกจะแสดงสถานะชัดเจนว่าใครจ่ายครบหรือค้างชำระ เพื่อให้เพื่อนๆ รับรู้ร่วมกันโดยไม่ต้องมาคอยทวงให้เสียน้ำใจ
            </p>
          </div>

          {/* Feature 4 */}
          <div className={`p-6 sm:p-7 rounded-2xl border space-y-3 shadow-xs hover:border-[#EA580C]/40 transition-colors ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
            }`}>
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>
              ถอนตัวหรือทริปล่ม คืนเงินตามสัดส่วนจริง (Pro-rata Fair Refund)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              หากเพื่อนมาไม่ได้ก่อนวันจริง จะได้รับเงินคืนเฉพาะส่วนที่ยังไม่จ่าย (เช่น ค่ากิน/กิจกรรม) ส่วนที่จ่ายค่าตั๋ว/โรงแรมไปแล้วหักตามจริงอย่างยุติธรรม พร้อมระบบโหวตยกเลิกทริป
            </p>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS (4 STEPS)                                */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#EA580C] font-semibold">
            Workflow
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
          }`}>
            เริ่มต้นใช้งานง่ายๆ ใน 4 ขั้นตอน
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className={`p-6 rounded-2xl border space-y-2 relative shadow-xs ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <span className={`text-3xl font-black font-mono ${isDark ? 'text-[#292524]' : 'text-[#E7E5E4]'}`}>01</span>
            <h4 className={`text-sm font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>สร้างโครงการทริป</h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              ตั้งเป้าหมายงบรวม กำหนดระยะเวลา และระบุกฎกติกาข้อตกลงประจำทริป
            </p>
          </div>

          <div className={`p-6 rounded-2xl border space-y-2 relative shadow-xs ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <span className={`text-3xl font-black font-mono ${isDark ? 'text-[#292524]' : 'text-[#E7E5E4]'}`}>02</span>
            <h4 className={`text-sm font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>ชวนเพื่อน & ทยอยสมทบ</h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              แชร์ลิงก์คำเชิญให้เพื่อน เพื่อนต่อ MetaMask และโอน ETH เข้ากองกลางตามงวด
            </p>
          </div>

          <div className={`p-6 rounded-2xl border space-y-2 relative shadow-xs ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <span className={`text-3xl font-black font-mono ${isDark ? 'text-[#292524]' : 'text-[#E7E5E4]'}`}>03</span>
            <h4 className={`text-sm font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>ขอเบิกจ่ายพร้อมใบเสร็จ</h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              เมื่อถึงกำหนดจองตั๋ว/ที่พัก ผู้จัดแนบรูปใบแจ้งหนี้เพื่อเปิดรอบโหวต
            </p>
          </div>

          <div className={`p-6 rounded-2xl border space-y-2 relative shadow-xs ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <span className={`text-3xl font-black font-mono ${isDark ? 'text-[#292524]' : 'text-[#E7E5E4]'}`}>04</span>
            <h4 className={`text-sm font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'}`}>โหวตปลดล็อกโอนเงิน</h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              สมาชิกโหวตอนุมัติเกินกึ่งหนึ่ง (&gt;50%) สัญญาจะโอนเงินไปยังกระเป๋า Vendor อัตโนมัติ
            </p>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. BOTTOM CTA BANNER                                     */}
      {/* ======================================================== */}
      <section className="max-w-4xl mx-auto">
        <div className={`rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl border ${
          isDark
            ? 'bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#0C0A09] border-[#44403C] text-white'
            : 'bg-gradient-to-br from-[#FFFFFF] via-[#FAF9F6] to-[#FFEDD5] border-[#E7E5E4] text-[#1C1917]'
        }`}>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            พร้อมวางแผนทริปถัดไปของคุณกับเพื่อนๆ แล้วหรือยัง?
          </h2>
          <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${
            isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'
          }`}>
            สร้างทริปบน Ethereum Sepolia ได้ทันที ฟรีค่าธรรมเนียมทดสอบ และโปร่งใส 100%
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenCreateTrip}
              className="px-8 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              เริ่มต้นสร้างทริปแรกของคุณ
            </button>
            <button
              onClick={onGoToHub}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold border transition-all ${
                isDark
                  ? 'border-[#44403C] hover:bg-[#292524] text-[#F5F5F4]'
                  : 'border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
              }`}
            >
              ดูหน้ารวมทริปทั้งหมด (Trip Hub)
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
