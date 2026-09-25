import React, { useState, useEffect, useRef } from 'react';
import { AssetQuote, ChatMessage, AuthSession, AlertTrigger } from './types';
import { INITIAL_QUOTES, MOCK_ALERTS } from './data/mockMarketData';
import { Navbar } from './components/Navbar';
import { MarketDashboard } from './components/MarketDashboard';
import { StockAnalysisView } from './components/StockAnalysisView';
import { ScreenerView } from './components/ScreenerView';
import { NewsFeedView } from './components/NewsFeedView';
import { PortfolioView } from './components/PortfolioView';
import { AlertsView } from './components/AlertsView';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { AuthModal } from './components/AuthModal';
import { DataModelView } from './components/DataModelView';
import { Bell, AlertTriangle, X, Zap } from 'lucide-react';

export default function App() {
  const [quotes, setQuotes] = useState<AssetQuote[]>(INITIAL_QUOTES);
  const [selectedQuote, setSelectedQuote] = useState<AssetQuote>(INITIAL_QUOTES[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  // Volatility Monitoring & Alerts state
  const [alerts, setAlerts] = useState<AlertTrigger[]>(MOCK_ALERTS);
  const [volatilityThreshold, setVolatilityThreshold] = useState<number>(2.0); // 2.0% threshold vs sparkline baseline
  const [activeVolatilityToast, setActiveVolatilityToast] = useState<AlertTrigger | null>(null);
  const alertedHistoryRef = useRef<Map<string, { lastAlertedPrice: number; lastAlertedTime: number }>>(new Map());

  // Authentication & Session state
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Welcome to DEEPDATA. I am your Senior Market Analyst AI powered by Gemini 3.6. Ask me for real-time stock breakdowns, technical setups, Indian market (NSE/BSE) insights, or worldwide portfolio optimization advice.',
      timestamp: 'Just now',
      suggestedActions: ['Analyze RELIANCE NSE target', 'Evaluate Fed Rate Cut Impact', 'Check TCS Q3 Earnings'],
    },
  ]);

  // Initial Auth Check (GET /api/auth/me using default demo token)
  useEffect(() => {
    const checkAuthSession = async () => {
      const demoToken = 'deepdata_demo_session_token_101';
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${demoToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setCurrentSession(data.session);
          }
        }
      } catch (e) {
        // Fallback session state
      }
    };
    checkAuthSession();
  }, []);

  // Periodically fetch quotes from server API
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/market/quotes');
        if (res.ok) {
          const data = await res.json();
          setQuotes(data);
        }
      } catch (e) {
        // Fallback to initial local quotes
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Automatically monitors the 'quotes' state and compares current prices against the 'sparkline' history.
   * If price volatility threshold is exceeded, triggers a notification via MOCK_ALERTS and local alerts state.
   */
  const monitorPriceVolatility = (quotesList: AssetQuote[], thresholdPercent: number = 2.0) => {
    if (!quotesList || quotesList.length === 0) return;

    const now = Date.now();
    const cooldownMs = 60000; // 60s cooldown per symbol unless price shifts by an additional 1.0%

    quotesList.forEach((quote) => {
      // Must have sparkline historical data to compare against
      if (!quote.sparkline || quote.sparkline.length === 0) return;

      // Extract baseline price from sparkline history (earliest historical tick point)
      const baselinePrice = quote.sparkline[0];
      if (!baselinePrice || baselinePrice <= 0) return;

      // Calculate percentage deviation between current price and sparkline baseline
      const deviationPct = ((quote.price - baselinePrice) / baselinePrice) * 100;
      const absVolatility = Math.abs(deviationPct);

      // Check if price volatility threshold is exceeded
      if (absVolatility >= thresholdPercent) {
        const existingRecord = alertedHistoryRef.current.get(quote.symbol);

        // Deduplication & cooldown check
        if (existingRecord) {
          const timeSinceLastAlert = now - existingRecord.lastAlertedTime;
          const priceShiftSinceAlert = Math.abs((quote.price - existingRecord.lastAlertedPrice) / existingRecord.lastAlertedPrice) * 100;

          if (timeSinceLastAlert < cooldownMs && priceShiftSinceAlert < 1.0) {
            return;
          }
        }

        // Record this alert event
        alertedHistoryRef.current.set(quote.symbol, {
          lastAlertedPrice: quote.price,
          lastAlertedTime: now,
        });

        const isIndia = quote.currency === 'INR' || quote.region === 'INDIA';
        const currSym = isIndia ? '₹' : '$';
        const isSurge = deviationPct >= 0;
        const direction = isSurge ? 'SURGE' : 'PLUNGE';
        const severity = absVolatility >= 3.5 ? 'CRITICAL' : 'HIGH';

        const newAlert: AlertTrigger = {
          id: `vol-${quote.symbol}-${Date.now()}`,
          symbol: quote.symbol,
          title: `PRICE VOLATILITY ALERT: ${quote.symbol} ${direction}`,
          type: 'PRICE_BREAKOUT',
          severity,
          timestamp: 'Just now',
          message: `Automated Volatility Detection: ${quote.name} (${quote.symbol}) current price ${currSym}${quote.price.toFixed(2)} moved ${deviationPct >= 0 ? '+' : ''}${deviationPct.toFixed(2)}% against sparkline historical baseline (${currSym}${baselinePrice.toFixed(2)}). Volatility threshold (${thresholdPercent.toFixed(1)}%) exceeded.`,
          currentPrice: quote.price,
          recommendation: isSurge
            ? `Upward breakout confirmed. Tighten trailing stop to ${currSym}${(quote.price * 0.97).toFixed(2)} and monitor volume.`
            : `Sharp drawdown below sparkline support range. Risk mitigation advised near ${currSym}${(quote.price * 0.95).toFixed(2)}.`,
          isRead: false,
        };

        // 1. Trigger notification via global MOCK_ALERTS
        MOCK_ALERTS.unshift(newAlert);

        // 2. Synchronize local alerts state
        setAlerts((prev) => [newAlert, ...prev]);

        // 3. Trigger immediate interactive notification toast
        setActiveVolatilityToast(newAlert);
      }
    });
  };

  // Automatically monitor the 'quotes' state for price volatility compared to sparkline history
  useEffect(() => {
    monitorPriceVolatility(quotes, volatilityThreshold);
  }, [quotes, volatilityThreshold]);

  // Auto-dismiss active volatility toast notification after 7 seconds
  useEffect(() => {
    if (!activeVolatilityToast) return;
    const timer = setTimeout(() => {
      setActiveVolatilityToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeVolatilityToast]);

  // Simulates a live price spike to test the automated volatility monitor
  const handleSimulateVolatilitySpike = () => {
    setQuotes((prevQuotes) => {
      return prevQuotes.map((q, idx) => {
        if (idx === 0) {
          // Induce a +3.6% volatility spike on the first quote (e.g. RELIANCE)
          const baseline = q.sparkline?.[0] || q.price;
          const isUp = Math.random() > 0.4;
          const factor = isUp ? 1.036 : 0.964;
          const spikedPrice = Number((baseline * factor).toFixed(2));
          const newChange = Number((spikedPrice - baseline).toFixed(2));
          const newChangePct = Number(((newChange / baseline) * 100).toFixed(2));
          return {
            ...q,
            price: spikedPrice,
            change: newChange,
            changePercent: newChangePct,
          };
        }
        return q;
      });
    });
  };

  const handleSearchSymbol = (symbol: string) => {
    const uppercaseSymbol = symbol.trim().toUpperCase();
    const existing = quotes.find((q) => q.symbol.toUpperCase() === uppercaseSymbol);

    if (existing) {
      setSelectedQuote(existing);
    } else {
      // Create new dynamic asset quote object for search query
      const isIndia = uppercaseSymbol.includes('NSE') || uppercaseSymbol.includes('BSE') || uppercaseSymbol === 'RELIANCE' || uppercaseSymbol === 'TCS' || uppercaseSymbol === 'HDFCBANK';
      const newQuote: AssetQuote = {
        symbol: uppercaseSymbol,
        name: `${uppercaseSymbol} Corp.`,
        type: 'stock',
        price: 195.50,
        change: 2.40,
        changePercent: 1.24,
        high52w: 210.00,
        low52w: 150.00,
        volume: '18.5M',
        marketCap: isIndia ? '₹1.2T' : '$120B',
        peRatio: 24.5,
        dividendYield: 1.2,
        sector: 'Technology',
        country: isIndia ? 'India' : 'USA',
        region: isIndia ? 'INDIA' : 'GLOBAL',
        exchange: isIndia ? 'NSE' : 'NASDAQ',
        currency: isIndia ? 'INR' : 'USD',
        sparkline: [190, 192, 191, 193, 194, 195.5],
        chartData: [
          { time: '09:30', price: 190.0 },
          { time: '11:30', price: 192.5 },
          { time: '13:30', price: 194.0 },
          { time: '15:30', price: 195.5 },
        ],
      };
      setQuotes((prev) => [newQuote, ...prev]);
      setSelectedQuote(newQuote);
    }
  };

  const handleSendMessageToCopilot = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsCopilotLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
        suggestedActions: data.suggestedActions,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I am currently processing high volume order flow. Local research engine indicates positive growth metrics.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSearchSymbol={handleSearchSymbol}
          onToggleCopilot={() => setIsCopilotOpen(true)}
          unreadAlertsCount={alerts.filter((a) => !a.isRead).length}
          currentSession={currentSession}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* View Switcher */}
        <main className="pb-12">
          {activeTab === 'dashboard' && (
            <MarketDashboard
              quotes={quotes}
              selectedQuote={selectedQuote}
              onSelectQuote={setSelectedQuote}
              onAnalyzeQuote={(q) => {
                setSelectedQuote(q);
                setActiveTab('analysis');
              }}
            />
          )}

          {activeTab === 'analysis' && (
            <StockAnalysisView
              selectedQuote={selectedQuote}
              onAskCopilot={(prompt) => {
                setIsCopilotOpen(true);
                handleSendMessageToCopilot(prompt);
              }}
            />
          )}

          {activeTab === 'screener' && (
            <ScreenerView
              quotes={quotes}
              onSelectQuote={setSelectedQuote}
              onAnalyzeQuote={(q) => {
                setSelectedQuote(q);
                setActiveTab('analysis');
              }}
            />
          )}

          {activeTab === 'news' && (
            <NewsFeedView
              onSearchSymbol={handleSearchSymbol}
              onNavigateToAnalysis={() => setActiveTab('analysis')}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioView
              onSearchSymbol={handleSearchSymbol}
              onNavigateToAnalysis={() => setActiveTab('analysis')}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onAddAlert={(customAlert) => {
                MOCK_ALERTS.unshift(customAlert);
                setAlerts((prev) => [customAlert, ...prev]);
              }}
              onSearchSymbol={handleSearchSymbol}
              onNavigateToAnalysis={() => setActiveTab('analysis')}
              volatilityThreshold={volatilityThreshold}
              onUpdateVolatilityThreshold={setVolatilityThreshold}
              onSimulateVolatilitySpike={handleSimulateVolatilitySpike}
            />
          )}

          {activeTab === 'datamodel' && (
            <DataModelView />
          )}
        </main>
      </div>

      {/* Floating Volatility Alert Toast Notification */}
      {activeVolatilityToast && (
        <div className="fixed top-14 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-[#121214]/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl shadow-cyan-500/10 rounded-lg p-3.5 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <div className="p-2 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-white">{activeVolatilityToast.symbol}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    activeVolatilityToast.severity === 'CRITICAL'
                      ? 'bg-rose-950/70 text-rose-400 border-rose-800'
                      : 'bg-amber-950/70 text-amber-400 border-amber-800'
                  }`}>
                    {activeVolatilityToast.severity} VOLATILITY
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                  {activeVolatilityToast.message}
                </p>
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-[#1F1F23]">
                  <button
                    onClick={() => {
                      handleSearchSymbol(activeVolatilityToast.symbol);
                      setActiveTab('analysis');
                      setActiveVolatilityToast(null);
                    }}
                    className="text-[11px] font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    Analyze {activeVolatilityToast.symbol}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('alerts');
                      setActiveVolatilityToast(null);
                    }}
                    className="text-[11px] font-mono text-cyan-300 hover:text-white px-2 py-1 rounded cursor-pointer"
                  >
                    View Signals
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveVolatilityToast(null)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1F1F23] cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#09090B] py-6 text-center text-xs text-gray-500 font-mono">
        <p className="max-w-7xl mx-auto px-4">
          DEEPDATA Capital Market Research Platform • Powered by Gemini 3.6 AI Models • Institutional Real-Time Intelligence
        </p>
      </footer>

      {/* Slide-out AI Analyst Copilot */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessageToCopilot}
        isLoading={isCopilotLoading}
      />

      {/* User Authentication & Session Gateway Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentSession={currentSession}
        onAuthSuccess={(session) => setCurrentSession(session)}
        onLogout={() => setCurrentSession(null)}
      />
    </div>
  );
}

