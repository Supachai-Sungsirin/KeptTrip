import React, { useState } from 'react';
import { Share2, X, Copy, Check, ExternalLink, Users, Sparkles, MessageCircle } from 'lucide-react';

export default function InviteModal({ isOpen, onClose, trip, theme = 'dark' }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen || !trip) return null;

  const isDark = theme === 'dark';

  // อ่านนโยบายจาก tripCharterURI
  let charter = {};
  try {
    charter = typeof trip.tripCharterURI === 'string' && trip.tripCharterURI.startsWith('{')
      ? JSON.parse(trip.tripCharterURI)
      : { terms: trip.tripCharterURI || '' };
  } catch {
    charter = { terms: trip.tripCharterURI || '' };
  }

  // สร้างลิงก์เชิญที่มี Trip ID แนบไปด้วย
  const inviteUrl = `${window.location.origin}/?trip=${trip.id}`;

  // ข้อความสำเร็จรูปสำหรับส่งใน LINE / Messenger / Discord
  const inviteMessage = `🎒 ชวนไปเที่ยวกัน! ร่วมทริป "${trip.tripName}" บน KeptTrip\n` +
    `• เป้าหมายงบกองกลาง: ${trip.targetAmount} ETH\n` +
    (charter.expectedPerMember ? `• ยอดเก็บต่องวด: คนละ ${charter.expectedPerMember} ETH\n` : '') +
    `• กฎประจำทริป: ทุกการเบิกจ่ายต้องผ่านการโหวตจากสมาชิกเกินกึ่งหนึ่ง (>50%) และถอนตัวได้เงินคืนตามสัดส่วน\n` +
    `👉 กดเข้าร่วมและดูแผนทริปที่นี่: ${inviteUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border transition-all ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-3.5 border-b ${
          isDark ? 'border-[#292524]' : 'border-stone-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-orange-50 text-orange-600 border border-orange-200/60'
            }`}>
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                ชวนเพื่อนร่วมทริป (Invite Friends)
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                ทริป #{trip.id}: {trip.tripName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              isDark ? 'text-[#78716C] hover:text-[#F5F5F4]' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. ลิงก์คำเชิญระบุ Trip ID */}
        <div className="space-y-1.5 text-xs">
          <label className={`block font-medium ${isDark ? 'text-[#A8A29E]' : 'text-stone-700'}`}>
            ลิงก์เข้าร่วมทริปเฉพาะ (Invite Link):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4]'
                  : 'bg-stone-50 border-stone-200 text-stone-900'
              }`}
            />
            <button
              onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
            </button>
          </div>
        </div>

        {/* 2. ข้อความสำเร็จรูปสำหรับแชร์ใน LINE / แชตกลุ่ม */}
        <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
          isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
        }`}>
          <div className={`flex items-center justify-between ${isDark ? 'text-[#A8A29E]' : 'text-stone-700'}`}>
            <span className="font-medium flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>ข้อความสำเร็จรูปสำหรับส่งในแชตกลุ่ม:</span>
            </span>
            <button
              onClick={handleCopyMsg}
              className="text-[11px] font-medium text-[#EA580C] hover:underline flex items-center gap-1 transition-colors"
            >
              {copiedMsg ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMsg ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกทั้งข้อความ'}</span>
            </button>
          </div>
          <pre className={`text-[11px] font-sans whitespace-pre-wrap leading-relaxed p-2.5 rounded-lg border ${
            isDark ? 'bg-[#1C1917] border-[#44403C] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-600'
          }`}>
            {inviteMessage}
          </pre>
        </div>

        {/* 3. คำอธิบายขั้นตอนเมื่อเพื่อนเปิดลิงก์ */}
        <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
          isDark ? 'bg-[#292524]/60 border-[#44403C]' : 'bg-stone-50/70 border-stone-200/80'
        }`}>
          <span className={`font-medium block ${isDark ? 'text-[#F5F5F4]' : 'text-stone-800'}`}>
            เมื่อเพื่อนเปิดลิงก์นี้ จะต้องทำอะไรบ้าง?
          </span>
          <ol className={`space-y-1.5 text-[11px] list-decimal list-inside leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-600'}`}>
            <li>
              <strong className={isDark ? 'text-[#F5F5F4]' : 'text-stone-800'}>เปิดลิงก์ทริป:</strong> หน้าเว็บจะเปิดตรงมาที่ทริปนี้โดยอัตโนมัติ
            </li>
            <li>
              <strong className={isDark ? 'text-[#F5F5F4]' : 'text-stone-800'}>เชื่อมต่อกระเป๋า (Connect Wallet):</strong> เพื่อนเชื่อมต่อ MetaMask
            </li>
            <li>
              <strong className={isDark ? 'text-[#F5F5F4]' : 'text-stone-800'}>กดสมทบเงิน (Contribute):</strong> เมื่อโอนเงินเข้ากองกลาง สัญญาบล็อกเชนจะลงทะเบียนกระเป๋าของเพื่อนเป็นสมาชิกประจำทริป และให้สิทธิ์โหวตทันที
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl text-xs font-medium border transition-colors ${
              isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
            }`}
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
