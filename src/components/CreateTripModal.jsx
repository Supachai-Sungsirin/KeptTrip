import React, { useState } from 'react';
import { Compass, X, Calendar, DollarSign, ShieldAlert, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateTripModal({ isOpen, onClose, onCreateTrip, theme = 'dark' }) {
  const [tripName, setTripName] = useState('');
  const [targetAmount, setTargetAmount] = useState('0.5');
  const [durationInDays, setDurationInDays] = useState('30');
  const [errorMessage, setErrorMessage] = useState('');
  
  // กฎและการเก็บเงิน (Payment Rules & Charter)
  const [paymentType, setPaymentType] = useState('installment'); // installment | flexible
  const [expectedPerMember, setExpectedPerMember] = useState('0.1');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [latePolicy, setLatePolicy] = useState('grace_3_days'); // strict | grace_3_days | rollover
  const [terms, setTerms] = useState(
    'กฎประจำทริป: สมาชิกทยอยโอนตามกำหนด หากมาไม่ได้ก่อนวันจริง สามารถกด Dropout เพื่อขอเงินคืนเฉพาะส่วนที่ยังไม่ได้จ่ายจริง (เช่น ค่ากิน/กิจกรรม) ส่วนที่จ่ายจองไปแล้วจะไม่สามารถขอคืนได้'
  );

  // Milestone แรกเริ่ม
  const [initialMilestoneTitle, setInitialMilestoneTitle] = useState('จองตั๋วเครื่องบิน/ยานพาหนะ');
  const [initialMilestoneAmount, setInitialMilestoneAmount] = useState('0.2');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!tripName.trim()) {
      setErrorMessage("กรุณากรอกชื่อทริปท่องเที่ยว");
      return;
    }

    // บรรจุข้อตกลงและนโยบายเป็น JSON เก็บใน tripCharterURI
    const charterData = {
      description: `ทริป ${tripName}`,
      paymentType,
      expectedPerMember: paymentType === 'installment' ? expectedPerMember : '',
      dueDate: paymentType === 'installment' ? dueDate : '',
      latePolicy,
      terms
    };

    onCreateTrip({
      tripName: tripName.trim(),
      targetAmount,
      durationInDays: Number(durationInDays),
      tripCharterURI: JSON.stringify(charterData),
      initialMilestone: initialMilestoneTitle ? {
        title: initialMilestoneTitle,
        amount: initialMilestoneAmount
      } : null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className={`rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6 border transition-all ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-[#292524]' : 'border-stone-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isDark ? 'bg-[#431407] text-[#FB923C]' : 'bg-[#FFEDD5] text-[#C2410C]'
            }`}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                สร้างโครงการทริปท่องเที่ยวใหม่
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                กำหนดเป้าหมายงบประมาณ และตั้งกฎข้อตกลงประจำทริป
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              isDark ? 'text-[#78716C] hover:text-[#F5F5F4] hover:bg-[#292524]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {errorMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs animate-fade-in ${
              isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <div>
              <label className={`block font-semibold mb-2 ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                ชื่อทริปท่องเที่ยว *
              </label>
              <input
                type="text"
                required
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="เช่น ทริปแอ่วเจียงใหม่ หน้าหนาว 4 วัน 3 คืน ⛰️"
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                    : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block font-semibold mb-2 ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                  เป้าหมายงบประมาณรวม (ETH) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums focus:outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]'
                      : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-semibold mb-2 ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                  ระยะเวลาระดมเงิน (วัน) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={durationInDays}
                  onChange={(e) => setDurationInDays(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums focus:outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]'
                      : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ส่วนตั้งค่ากฎการจ่ายเงินและข้อตกลง (Payment Plan & Late Policy) */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
          }`}>
            <div className={`flex items-center gap-2 font-bold text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
              <ShieldAlert className="w-4 h-4 text-[#EA580C]" />
              <span>การกำหนดกฎและข้อตกลงการเก็บเงิน</span>
            </div>

            {/* รูปแบบการเก็บเงิน */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaymentType('installment')}
                className={`py-2.5 px-3 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                  paymentType === 'installment'
                    ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                    : isDark
                    ? 'bg-[#1C1917] border-[#44403C] text-[#A8A29E] hover:bg-[#292524]'
                    : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                เก็บเป็นงวด / มีกำหนดวัน
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('flexible')}
                className={`py-2.5 px-3 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                  paymentType === 'flexible'
                    ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                    : isDark
                    ? 'bg-[#1C1917] border-[#44403C] text-[#A8A29E] hover:bg-[#292524]'
                    : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                จ่ายตามสะดวก (Flexible)
              </button>
            </div>

            {/* ถ้าเป็นแบบเก็บเป็นงวด */}
            {paymentType === 'installment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className={`block mb-1.5 font-medium text-xs ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                    ยอดที่ควรโอนต่องวด (ETH/คน)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expectedPerMember}
                    onChange={(e) => setExpectedPerMember(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none border ${
                      isDark ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]' : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1.5 font-medium text-xs ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
                    กำหนดชำระงวดนี้
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-sm focus:outline-none border ${
                      isDark ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]' : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* นโยบายการจ่ายช้า (Late Payment Policy) */}
            <div className="pt-1">
              <label className={`block font-semibold mb-2 text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                นโยบายกรณีจ่ายไม่ตรงเวลา (ตามที่คนสร้างทริปตั้งกฎ):
              </label>
              <div className="space-y-2">
                {[
                  { id: 'grace_3_days', title: 'ผ่อนผันได้ไม่เกิน 3 วัน (Grace Period: 3 Days)', desc: 'เตือนสถานะสีส้ม หากเกิน 3 วันจะขึ้นเตือนค้างชำระสีแดง' },
                  { id: 'strict', title: 'เคร่งครัด: ต้องจ่ายตรงวันเท่านั้น', desc: 'หากเลยกำหนดวัน จะขึ้นแจ้งเตือนค้างชำระทันที' },
                  { id: 'rollover', title: 'อนุญาตให้ทบยอดไปงวดถัดไปได้', desc: 'ยอดที่ค้างจะถูกทบไปรวมกับงวดหน้า' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      latePolicy === item.id
                        ? isDark
                          ? 'bg-[#431407]/40 border-[#EA580C] text-[#F5F5F4]'
                          : 'bg-orange-50 border-orange-300 text-stone-900'
                        : isDark
                        ? 'bg-[#1C1917] border-[#44403C] text-[#A8A29E] hover:border-[#57534E]'
                        : 'bg-white/80 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="latePolicy"
                      checked={latePolicy === item.id}
                      onChange={() => setLatePolicy(item.id)}
                      className="mt-1 accent-[#EA580C]"
                    />
                    <div>
                      <div className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                        {item.title}
                      </div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-[#78716C]' : 'text-stone-500'}`}>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ช่องเขียนข้อตกลงประจำทริป */}
            <div className="pt-1">
              <label className={`block font-semibold mb-1.5 text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
                ข้อตกลงและกฎกติกาประจำทริป (Trip Charter & Terms):
              </label>
              <textarea
                rows="3"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="ระบุกฎเกณฑ์ นโยบายถอนตัว หรือเงื่อนไขของกลุ่ม..."
                className={`w-full rounded-xl p-3 text-xs sm:text-sm focus:outline-none border ${
                  isDark
                    ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                    : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
                }`}
              />
            </div>
          </div>

          {/* รายการเบิกจ่ายแรกเริ่ม */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
          }`}>
            <span className={`font-semibold block text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
              รายการค่าใช้จ่ายเริ่มต้น (Milestone #1):
            </span>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={initialMilestoneTitle}
                onChange={(e) => setInitialMilestoneTitle(e.target.value)}
                placeholder="ชื่อรายการ เช่น จองตั๋วบิน"
                className={`col-span-2 rounded-xl px-3.5 py-2 text-sm focus:outline-none border ${
                  isDark ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]' : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                }`}
              />
              <input
                type="number"
                step="0.01"
                value={initialMilestoneAmount}
                onChange={(e) => setInitialMilestoneAmount(e.target.value)}
                placeholder="ETH"
                className={`rounded-xl px-3.5 py-2 text-sm font-mono tabular-nums focus:outline-none border ${
                  isDark ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4] focus:border-[#EA580C]' : 'bg-white border-stone-200 text-stone-900 focus:border-[#EA580C]'
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`w-1/3 py-2.5 rounded-xl font-semibold text-sm transition-colors border ${
                isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-xs transition-colors"
            >
              สร้างทริปและบันทึกข้อตกลง
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
