import React, { useState } from 'react';
import { Settings, X, Check, Copy, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { SEPOLIA_EXPLORER } from '../config/constants';
import KeptTripFundABI from '../contracts/KeptTripFundABI.json';

export default function ContractConfigModal({ isOpen, onClose, theme = 'dark' }) {
  const { contractAddress, updateContractAddress, isDemoMode, toggleDemoMode } = useWeb3();
  const [addressInput, setAddressInput] = useState(contractAddress || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSave = (e) => {
    e.preventDefault();
    updateContractAddress(addressInput.trim());
    onClose();
  };

  const handleCopyABI = () => {
    navigator.clipboard.writeText(JSON.stringify(KeptTripFundABI, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border transition-all ${
        isDark ? 'bg-[#1C1917] border-[#292524] text-[#F5F5F4]' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-[#292524]' : 'border-stone-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-[#431407] text-[#FB923C] border-[#9A3412]' : 'bg-orange-50 text-orange-600 border border-orange-200/60'
            }`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-[#F5F5F4]' : 'text-stone-900'}`}>
                ตั้งค่า Smart Contract & โหมดการทำงาน
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
                สลับระหว่าง Demo Mode กับ Live Contract บน Sepolia
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

        {/* Demo Mode Toggle Box */}
        <div className={`p-4 sm:p-5 rounded-xl border flex items-center justify-between gap-5 ${
          isDark ? 'bg-[#292524] border-[#44403C]' : 'bg-stone-50 border-stone-200/80'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-[#F5F5F4]' : 'text-stone-800'}`}>
                โหมดจำลอง (Interactive Demo Mode)
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                isDemoMode
                  ? isDark ? 'bg-[#451A03] border-amber-900/60 text-[#FBBF24]' : 'bg-amber-50 border-amber-200 text-amber-700'
                  : isDark ? 'bg-[#1C1917] border-[#44403C] text-[#78716C]' : 'bg-stone-200 text-stone-600'
              }`}>
                {isDemoMode ? 'เปิดใช้งาน' : 'ปิดอยู่'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A8A29E]' : 'text-stone-500'}`}>
              ทดสอบฟังก์ชันทุกอย่าง (โอนเงิน, ขอเบิก, โหวต, ถอนตัว) ได้ทันทีโดยไม่ต้องใช้ Sepolia ETH
            </p>
          </div>
          <button
            onClick={() => toggleDemoMode()}
            className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 shrink-0 ${
              isDemoMode ? 'bg-[#EA580C]' : isDark ? 'bg-[#44403C]' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full transition-transform bg-white ${
                isDemoMode ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Contract Address Input */}
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <label className={`block font-medium mb-2 text-xs sm:text-sm ${isDark ? 'text-[#F5F5F4]' : 'text-stone-700'}`}>
              ที่อยู่ Smart Contract บน Sepolia (เมื่อ Deploy แล้ว):
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="0x..."
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-[#292524] border-[#44403C] text-[#F5F5F4] placeholder-[#78716C] focus:border-[#EA580C]'
                  : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#EA580C]'
              }`}
            />
          </div>

          {/* Quick Helper Tools */}
          <div className={`flex items-center justify-between pt-1 text-xs sm:text-sm ${
            isDark ? 'text-[#A8A29E]' : 'text-stone-500'
          }`}>
            <button
              type="button"
              onClick={handleCopyABI}
              className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-stone-400" />}
              <span>{copied ? 'คัดลอก ABI แล้ว!' : 'คัดลอก Contract ABI'}</span>
            </button>

            <a
              href="https://remix.ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors"
            >
              <span>เปิด Remix IDE</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`w-1/2 py-2.5 rounded-xl font-medium text-sm border transition-colors ${
                isDark ? 'bg-[#292524] border-[#44403C] hover:bg-[#44403C] text-[#F5F5F4]' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
