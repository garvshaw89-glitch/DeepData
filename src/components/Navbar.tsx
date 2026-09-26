import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Briefcase, 
  Menu, 
  X, 
  Sliders,
  Layers,
  Terminal,
  Compass,
  User,
  ArrowRight
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
  viewMode: 'story' | 'terminal';
  onToggleViewMode: (mode: 'story' | 'terminal') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSearchSymbol,
  onToggleCopilot,
  unreadAlertsCount,
  currentSession,
  onOpenAuthModal,
  viewMode,
  onToggleViewMode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Terminal', targetMode: 'terminal' as const },
    { id: 'analysis', label: 'AI Research', targetMode: 'terminal' as const },
    { id: 'screener', label: 'Screener', targetMode: 'terminal' as const },
    { id: 'trading', label: 'Paper Trade', targetMode: 'terminal' as const },
    { id: 'portfolio', label: 'Portfolio', targetMode: 'terminal' as const },
    { id: 'alerts', label: 'Signals', unread: unreadAlertsCount, targetMode: 'terminal' as const },
    { id: 'news', label: 'News', targetMode: 'terminal' as const },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSymbol(searchQuery.trim().toUpperCase());
      onToggleViewMode('terminal');
      setActiveTab('analysis');
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleNavClick = (id: string, targetMode: 'story' | 'terminal') => {
    onToggleViewMode(targetMode);
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const quickTickers = ['RELIANCE', 'TCS', 'HDFCBANK', 'AAPL', 'NVDA', 'SPY', 'GLD'];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070709]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Bar Contract: Brand — 4-6 Nav Links — 1-2 Primary Actions */}
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onToggleViewMode('story');
                setActiveTab('dashboard');
              }}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
              aria-label="DEEPDATA Home"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                DEEPDATA
              </span>
            </button>
          </div>

          {/* Zone 2: Clean Typography Nav Links (Single-Line, Unboxed) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-sans tracking-wide">
            <button
              onClick={() => onToggleViewMode(viewMode === 'story' ? 'terminal' : 'story')}
              className={`relative py-1 transition-colors cursor-pointer ${
                viewMode === 'story'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Experience
              {viewMode === 'story' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-cyan-400 rounded-full" />
              )}
            </button>

            {navItems.map((item) => {
              const isActive = viewMode === 'terminal' && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.targetMode)}
                  className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.unread !== undefined && item.unread > 0 && (
                    <span className="text-[10px] font-mono text-cyan-400">
                      · {item.unread}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-cyan-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Search Symbol or Asset"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* AI Copilot Quick Trigger */}
            <button
              onClick={onToggleCopilot}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg transition-all cursor-pointer"
              title="Open Gemini AI Research Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Copilot</span>
            </button>

            {/* Mode Switcher Button: Story / Terminal */}
            <button
              onClick={() => onToggleViewMode(viewMode === 'story' ? 'terminal' : 'story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                viewMode === 'terminal'
                  ? 'bg-white text-black border-white shadow-sm hover:bg-slate-200'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 shadow-md shadow-cyan-500/10'
              }`}
            >
              {viewMode === 'story' ? (
                <>
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Launch Terminal</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Story Mode</span>
                </>
              )}
            </button>

            {/* User Session Profile Button */}
            <button
              onClick={onOpenAuthModal}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              title={currentSession ? `Logged in as ${currentSession.user.fullName}` : 'Sign In'}
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {isSearchOpen && (
          <div className="py-3 border-t border-white/[0.08] animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter ticker symbol (e.g. RELIANCE, AAPL, NVDA, TCS)..."
                  className="w-full bg-[#0F1115] border border-white/[0.1] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                Inspect
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 text-[11px] font-mono text-slate-500">
              <span>Quick Tickers:</span>
              {quickTickers.map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    onSearchSymbol(sym);
                    onToggleViewMode('terminal');
                    setActiveTab('analysis');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 bg-[#070709]/98 backdrop-blur-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 pb-2 border-b border-white/[0.08]">
              NAVIGATION & WORKSPACES
            </div>

            <button
              onClick={() => {
                onToggleViewMode('story');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left text-xl font-display font-semibold text-white py-2 flex items-center justify-between"
            >
              <span>Editorial Experience</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.targetMode)}
                className="w-full text-left text-xl font-display font-semibold text-slate-300 hover:text-cyan-300 py-2 flex items-center justify-between border-t border-white/[0.05]"
              >
                <span>{item.label}</span>
                {item.unread !== undefined && item.unread > 0 && (
                  <span className="text-xs font-mono text-cyan-400">· {item.unread} alerts</span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <button
              onClick={() => {
                onToggleCopilot();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Launch Gemini AI Copilot</span>
            </button>

            <button
              onClick={() => {
                onOpenAuthModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-lg bg-[#14161C] border border-white/[0.08] text-white font-mono text-xs font-medium"
            >
              {currentSession ? `Logged in: ${currentSession.user.fullName}` : 'Sign In / Account'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
