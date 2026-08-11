import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Bell, 
  Bot, 
  BarChart3, 
  LineChart, 
  Filter, 
  Newspaper, 
  PieChart, 
  ShieldAlert, 
  Zap,
  Globe,
  Sparkles,
  Layers,
  Database,
  UserCheck,
  User,
  Shield
} from 'lucide-react';
import { AuthSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchSymbol: (symbol: string) => void;
  onToggleCopilot: () => void;
  unreadAlertsCount: number;
  currentSession: AuthSession | null;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSearchSymbol,
  onToggleCopilot,
  unreadAlertsCount,
  currentSession,
  onOpenAuthModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSymbol(searchQuery.trim().toUpperCase());
      setActiveTab('analysis');
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'analysis', label: 'AI Research', icon: Sparkles },
    { id: 'screener', label: 'Screener', icon: Filter },
    { id: 'news', label: 'Live News', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'alerts', label: 'Signals', icon: ShieldAlert, badge: unreadAlertsCount },
    { id: 'datamodel', label: 'Data Model', icon: Database },
  ];

  const quickSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'NIFTY50', 'AAPL', 'MSFT', 'NVDA', 'VOO', 'GOI_687_2033'];

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F12] border-b border-[#1F1F23] text-[#A1A1AA]">
      {/* Top Telemetry & Market Bar */}
      <div className="bg-[#09090B] border-b border-[#1F1F23] px-4 py-1 text-[10px] font-mono flex items-center justify-between text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-1.5 bg-[#1F1F23] px-2 py-0.5 rounded text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-300 font-semibold tracking-wider">NODE_ALPHA_READY</span>
          </div>
          <div className="flex items-center space-x-4 text-[10px]">
            <span>NIFTY 50: <strong className="text-emerald-400">24,850.40 (+0.75%)</strong></span>
            <span>SENSEX: <strong className="text-emerald-400">81,420.10 (+0.81%)</strong></span>
            <span>RELIANCE: <strong className="text-emerald-400">₹2,980.50 (+1.43%)</strong></span>
            <span>TCS: <strong className="text-emerald-400">₹4,150.00 (+1.68%)</strong></span>
            <span>S&P 500: <strong className="text-emerald-400">5,430.20 (+0.45%)</strong></span>
            <span>10Y G-SEC: <strong className="text-emerald-400">6.15% (-2bps)</strong></span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 pl-4 border-l border-[#1F1F23]">
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>Ingest Stream: <strong className="text-white">India & Global Sync</strong></span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-5 h-5 bg-cyan-500 rounded-sm flex items-center justify-center text-black font-black text-[10px] shadow-sm">
              D
            </div>
            <span className="text-white font-semibold tracking-tighter text-sm">
              DEEPDATA <span className="text-cyan-500 font-normal">v2.4</span>
            </span>
          </div>

          {/* Compact High-Density Search Bar */}
          <div className="relative flex-1 max-w-sm mx-1.5 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search symbol (RELIANCE, AAPL)..."
                className="w-full bg-[#121214] text-white text-xs pl-8 pr-16 sm:pr-20 py-1.5 rounded border border-[#1F1F23] focus:border-cyan-500 transition-all outline-none placeholder:text-gray-600 font-mono"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] px-1.5 sm:px-2 py-0.5 rounded transition-colors font-mono font-medium cursor-pointer"
              >
                RESEARCH
              </button>
            </form>

            {/* Quick Symbol Dropdown */}
            {isSearchOpen && (
              <div 
                className="absolute left-0 right-0 top-9 bg-[#121214] border border-[#1F1F23] rounded shadow-2xl p-2.5 z-50"
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quick Ingest Target</p>
                <div className="flex flex-wrap gap-1">
                  {quickSymbols.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        onSearchSymbol(sym);
                        setActiveTab('analysis');
                        setIsSearchOpen(false);
                      }}
                      className="text-[10px] bg-[#18181B] hover:bg-[#27272A] text-cyan-400 px-2 py-0.5 rounded border border-[#27272A] font-mono cursor-pointer transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auth & AI Copilot Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* User Auth Profile Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded text-xs font-mono border transition-all cursor-pointer ${
                currentSession
                  ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 hover:bg-cyan-900/80'
                  : 'bg-[#1F1F23] border-[#3F3F46] text-gray-300 hover:text-white'
              }`}
            >
              {currentSession ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="max-w-[70px] sm:max-w-[90px] truncate font-bold text-[11px]">{currentSession.user.fullName.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-[11px]">LOG_IN</span>
                </>
              )}
            </button>

            {/* AI Copilot Launch Button */}
            <button
              onClick={onToggleCopilot}
              className="flex items-center space-x-1.5 bg-[#1F1F23] hover:bg-[#27272A] text-white px-2.5 sm:px-3 py-1.5 rounded text-xs font-medium border border-[#3F3F46] transition-all cursor-pointer shrink-0"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-mono">AI_COPILOT</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex space-x-4 sm:space-x-6 text-[11px] uppercase tracking-widest font-medium border-t border-[#1F1F23] overflow-x-auto scrollbar-none pt-2 pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white border-cyan-500 font-bold'
                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

