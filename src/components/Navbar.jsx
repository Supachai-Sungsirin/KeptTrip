import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, Plus, Share2, Sun, Moon, LayoutGrid } from 'lucide-react';

export default function Navbar({
  currentView = 'landing',
  onGoLanding,
  onGoHub,
  onOpenCreateTrip,
  onOpenShareLink,
  onOpenSettings,
  currentTrip,
  theme = 'dark',
  onToggleTheme
}) {
  const { account, isSepolia, isConnecting, connectWallet, disconnectWallet, isDemoMode } = useWeb3();

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors ${
      isDark
        ? 'bg-[#0C0A09]/95 border-b border-[#292524]'
        : 'bg-[#FFFFFF]/95 border-b border-[#E7E5E4]'
    }`}>
      <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
        
        {/* Left: Brand or Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-6">
          {currentView !== 'trip' ? (
            /* Home / Hub View: Logo & Nav Links */
            <div className="flex items-center gap-6">
              <div
                onClick={onGoLanding}
                className="flex items-center gap-2.5 cursor-pointer group select-none"
                title="กลับสู่หน้าแรก (Landing Page)"
              >
                <span className={`font-bold text-lg sm:text-xl tracking-tight transition-colors ${
                  isDark ? 'text-[#F5F5F4] group-hover:text-[#EA580C]' : 'text-[#1C1917] group-hover:text-[#EA580C]'
                }`}>
                  KeptTrip
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isDark
                    ? 'bg-[#431407] text-[#FB923C]'
                    : 'bg-[#FFEDD5] text-[#C2410C]'
                }`}>
                  กองทุนทริป
                </span>
              </div>

              {/* Navigation Links: Removed Shared Albums and Rules & Security */}
              <nav className="hidden md:flex items-center gap-6 text-xs sm:text-[13px] font-medium">
                <button
                  onClick={onGoLanding}
                  className={`transition-colors ${
                    currentView === 'landing'
                      ? 'text-[#EA580C] font-semibold'
                      : isDark ? 'text-[#78716C] hover:text-[#A8A29E]' : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  หน้าแรก
                </button>
                <button
                  onClick={onGoHub}
                  className={`transition-colors ${
                    currentView === 'hub'
                      ? 'text-[#EA580C] font-semibold'
                      : isDark ? 'text-[#78716C] hover:text-[#A8A29E]' : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  ทริปของฉัน (Trip Hub)
                </button>
              </nav>
            </div>
          ) : (
            /* Trip Detail View: Breadcrumb Navigation */
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[14px]">
              <button
                onClick={onGoLanding}
                className={`font-medium transition-colors ${
                  isDark ? 'text-[#A8A29E] hover:text-[#F5F5F4]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                หน้าแรก
              </button>
              <span className={isDark ? 'text-[#44403C]' : 'text-[#D6D3D1]'}>/</span>
              <button
                onClick={onGoHub}
                className={`font-medium transition-colors ${
                  isDark ? 'text-[#A8A29E] hover:text-[#F5F5F4]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                ทริปของฉัน
              </button>
              <span className={isDark ? 'text-[#44403C]' : 'text-[#D6D3D1]'}>/</span>
              <span className={`font-semibold line-clamp-1 max-w-[200px] sm:max-w-[320px] ${
                isDark ? 'text-[#F5F5F4]' : 'text-[#1C1917]'
              }`}>
                {currentTrip?.tripName || 'รายละเอียดทริป'}
              </span>
            </nav>
          )}
        </div>

        {/* Right: Network, Wallet, Theme Toggle, Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Network Pill (Sepolia Testnet) */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            isDark
              ? 'bg-[#064E3B] text-[#34D399]'
              : 'bg-[#ECFDF5] text-[#047857]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sepolia Testnet</span>
          </div>

          {/* Wallet Address & Balance Pill */}
          {account ? (
            <div
              onClick={disconnectWallet}
              title="คลิกเพื่อยกเลิกการเชื่อมต่อกระเป๋า"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#1C1917] border border-[#292524] hover:border-[#44403C] text-[#F5F5F4]'
                  : 'bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#D6D3D1] text-[#292524]'
              }`}
            >
              <span>{truncateAddress(account)}</span>
              <span className={isDark ? 'text-[#78716C]' : 'text-[#A8A29E]'}>
                (เชื่อมต่อแล้ว)
              </span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-[#1C1917] border border-[#292524] text-[#F5F5F4] hover:border-[#44403C]'
                  : 'bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] hover:border-[#D6D3D1]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{isConnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อกระเป๋า'}</span>
            </button>
          )}

          {/* Share Link Button (Shown in Trip Detail) */}
          {currentView === 'trip' && (
            <button
              onClick={onOpenShareLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'border border-[#44403C] hover:bg-[#1C1917] text-[#F5F5F4]'
                  : 'border border-[#D6D3D1] hover:bg-stone-50 text-[#1C1917]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="hidden sm:inline">แชร์ทริป</span>
            </button>
          )}

          {/* Theme Toggle (Dark Theme / Sunset Campfire) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "สลับเป็นโหมดสีสว่าง (Sunset Campfire)" : "สลับเป็นโหมดมืด (Dark Theme)"}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'bg-[#1C1917] border border-[#292524] text-[#FBBF24] hover:bg-[#292524]'
                : 'bg-[#F5F5F4] border border-[#E7E5E4] text-[#EA580C] hover:bg-[#E7E5E4]'
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Create Trip Button */}
          <button
            onClick={onOpenCreateTrip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-[13px] font-semibold transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>สร้างทริปใหม่</span>
          </button>

        </div>
      </div>
    </header>
  );
}
