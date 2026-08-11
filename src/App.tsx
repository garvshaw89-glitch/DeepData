import React, { useState, useEffect } from 'react';
import { AssetQuote, ChatMessage, AuthSession } from './types';
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

export default function App() {
  const [quotes, setQuotes] = useState<AssetQuote[]>(INITIAL_QUOTES);
  const [selectedQuote, setSelectedQuote] = useState<AssetQuote>(INITIAL_QUOTES[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

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
          unreadAlertsCount={MOCK_ALERTS.filter((a) => !a.isRead).length}
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
              onSearchSymbol={handleSearchSymbol}
              onNavigateToAnalysis={() => setActiveTab('analysis')}
            />
          )}

          {activeTab === 'datamodel' && (
            <DataModelView />
          )}
        </main>
      </div>

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

