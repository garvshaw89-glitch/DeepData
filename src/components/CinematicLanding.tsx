import React, { useState } from 'react';
import { 
  AssetQuote, 
  PaperOrder, 
  PaperPosition, 
  AlertTrigger 
} from '../types';
import { MarketSpatialCanvas } from './MarketSpatialCanvas';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  FileSpreadsheet, 
  RotateCw, 
  Check, 
  Layers, 
  Activity, 
  Cpu, 
  TrendingUp, 
  Sliders, 
  Briefcase,
  Zap,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface CinematicLandingProps {
  quotes: AssetQuote[];
  selectedQuote: AssetQuote;
  onSelectQuote: (quote: AssetQuote) => void;
  onLaunchTerminal: (tab?: string) => void;
  onSearchSymbol: (symbol: string) => void;
  virtualCash: number;
  virtualPositions: PaperPosition[];
  virtualOrders: PaperOrder[];
  onPlaceOrder: (order: Omit<PaperOrder, 'id' | 'timestamp' | 'status'>) => { success: boolean; message: string };
  volatilityThreshold: number;
  onUpdateVolatilityThreshold: (threshold: number) => void;
  onSimulateVolatilitySpike: () => void;
  alerts: AlertTrigger[];
  onToggleCopilot: () => void;
}

// RFC-4180 CSV Helpers
const escapeCSV = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

const triggerCSVDownload = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  quotes,
  selectedQuote,
  onSelectQuote,
  onLaunchTerminal,
  onSearchSymbol,
  virtualCash,
  virtualPositions,
  virtualOrders,
  onPlaceOrder,
  volatilityThreshold,
  onUpdateVolatilityThreshold,
  onSimulateVolatilitySpike,
  alerts,
  onToggleCopilot,
}) => {
  // Sandbox Order State
  const [sandboxShares, setSandboxShares] = useState<string>('10');
  const [sandboxSide, setSandboxSide] = useState<'BUY' | 'SELL'>('BUY');
  const [sandboxMessage, setSandboxMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<string>('1D');

  const isPos = selectedQuote.change >= 0;
  const isINR = selectedQuote.currency === 'INR' || selectedQuote.region === 'INDIA';
  const symPrefix = isINR ? '₹' : '$';

  // Handle Quick Sandbox Order Placement
  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(sandboxShares, 10);
    if (!count || count <= 0) return;

    const totalCost = count * selectedQuote.price;
    const res = onPlaceOrder({
      symbol: selectedQuote.symbol,
      name: selectedQuote.name,
      type: 'MARKET',
      side: sandboxSide,
      shares: count,
      orderPrice: selectedQuote.price,
      executionPrice: selectedQuote.price,
      totalCost,
      currency: selectedQuote.currency,
    });

    if (res.success) {
      setSandboxMessage({ type: 'success', text: `Filled ${sandboxSide} ${count} shares of ${selectedQuote.symbol} at ${symPrefix}${selectedQuote.price.toFixed(2)}.` });
    } else {
      setSandboxMessage({ type: 'error', text: res.message });
    }
  };

  // Direct CSV Export Actions
  const handleExportFullWorkbook = () => {
    const today = new Date().toISOString().split('T')[0];
    const rows = [
      `# DEEPDATA FINANCIAL PLATFORM - COMPREHENSIVE VIRTUAL PORTFOLIO WORKBOOK`,
      `# Export Timestamp: ${new Date().toLocaleString()}`,
      `# Available Purchasing Power: $${virtualCash.toFixed(2)}`,
      `# Total Active Positions: ${virtualPositions.length}`,
      `# Total Executed Orders: ${virtualOrders.length}`,
      '',
      '# SECTION 1: OPEN VIRTUAL POSITIONS',
      ['Symbol', 'Asset Name', 'Shares Owned', 'Avg Cost', 'Currency', 'Region'].map(escapeCSV).join(',')
    ];

    virtualPositions.forEach((pos) => {
      rows.push([
        escapeCSV(pos.symbol),
        escapeCSV(pos.name),
        escapeCSV(pos.shares),
        escapeCSV(pos.avgCost.toFixed(2)),
        escapeCSV(pos.currency),
        escapeCSV(pos.region),
      ].join(','));
    });

    rows.push('');
    rows.push('# SECTION 2: EXECUTED ORDER AUDIT HISTORY');
    rows.push(['Order ID', 'Timestamp', 'Symbol', 'Side', 'Type', 'Shares', 'Price', 'Total Value', 'Currency', 'Status'].map(escapeCSV).join(','));

    virtualOrders.forEach((ord) => {
      rows.push([
        escapeCSV(ord.id),
        escapeCSV(ord.timestamp),
        escapeCSV(ord.symbol),
        escapeCSV(ord.side),
        escapeCSV(ord.type),
        escapeCSV(ord.shares),
        escapeCSV(ord.executionPrice.toFixed(2)),
        escapeCSV(ord.totalCost.toFixed(2)),
        escapeCSV(ord.currency),
        escapeCSV(ord.status),
      ].join(','));
    });

    const filename = `deepdata_virtual_portfolio_full_${today}.csv`;
    triggerCSVDownload(rows.join('\r\n'), filename);
    setExportedNotice(filename);
    setTimeout(() => setExportedNotice(null), 4000);
  };

  return (
    <div className="space-y-24 md:space-y-36 pb-20">
      {/* ========================================================================= */}
      {/* 01. CINEMATIC HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Unboxed Metadata Eyebrow */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Autonomous Quantitative Intelligence</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Sub-Millisecond Ingestion</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>NSE · BSE · Global Macro</span>
          </div>

          {/* Primary Editorial Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] max-w-3xl" style={{ textWrap: 'balance' }}>
            Algorithmic Precision for Sovereign & Global Capital Markets.
          </h1>

          {/* Supporting Prose */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-sans font-normal" style={{ textWrap: 'balance' }}>
            DEEPDATA bridges institutional telemetry with real-time quantitative modeling. Continuous mark-to-market valuations, autonomous sparkline volatility alerts, and FinBERT cross-border sentiment.
          </p>

          {/* Primary & Secondary Action Pair */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onLaunchTerminal('dashboard')}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs sm:text-sm px-6 py-3 rounded-lg transition-all cursor-pointer shadow-lg shadow-cyan-500/15 active:scale-[0.98]"
            >
              <Terminal className="w-4 h-4 text-black" />
              <span>Launch Live Terminal</span>
              <ArrowRight className="w-4 h-4 ml-1 text-black" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('sandbox-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 bg-[#121318] hover:bg-[#1A1C23] text-white border border-white/[0.1] font-mono text-xs sm:text-sm px-5 py-3 rounded-lg transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Test Paper Execution</span>
            </button>
          </div>
        </div>

        {/* 3D WebGL Spatial Market Environment */}
        <div className="mt-12 sm:mt-16 w-full">
          <MarketSpatialCanvas onSelectSymbol={onSearchSymbol} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02. REAL-TIME TICKER STREAM MARQUEE */}
      {/* ========================================================================= */}
      <section className="border-y border-white/[0.08] bg-[#0A0B0E]/60 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500 shrink-0 pr-6 border-r border-white/[0.08]">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-wider text-[10px]">TICK INGEST:</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none py-1 px-4">
            {quotes.map((q) => {
              const pos = q.change >= 0;
              const symP = q.currency === 'INR' ? '₹' : '$';
              return (
                <button
                  key={q.symbol}
                  onClick={() => {
                    onSelectQuote(q);
                    onLaunchTerminal('analysis');
                  }}
                  className="flex items-center gap-2.5 text-xs hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-slate-200 group-hover:text-cyan-300">{q.symbol}</span>
                  <span className="text-slate-400">{symP}{q.price.toFixed(2)}</span>
                  <span className={`text-[11px] font-bold ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pos ? '+' : ''}{q.changePercent.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03. THE MARKET PARADOX (PROBLEM / CONTEXT) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 block">
              01. Structural Asymmetry
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight" style={{ textWrap: 'balance' }}>
              Why Retail Analysis Fails in High-Volatility Regimes.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Market participants face fragmented data across exchanges, delayed execution signals, and emotional bias during volatility spikes. Institutional desks rely on continuous quantitative risk decomposition and systematic price action baselines.
            </p>
          </div>

          {/* Quantitative Metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-[#0D0F14] border border-white/[0.08] p-5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">TELEMETRY LATENCY</span>
              <span className="text-2xl sm:text-3xl font-display font-bold text-white block">12ms</span>
              <span className="text-xs text-slate-400 font-sans block">Sub-millisecond data ingest</span>
            </div>

            <div className="bg-[#0D0F14] border border-white/[0.08] p-5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">INGEST SOURCES</span>
              <span className="text-2xl sm:text-3xl font-display font-bold text-cyan-400 block">15,000+</span>
              <span className="text-xs text-slate-400 font-sans block">Live news & filing streams</span>
            </div>

            <div className="bg-[#0D0F14] border border-white/[0.08] p-5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">RISK RESOLUTION</span>
              <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-400 block">95% VaR</span>
              <span className="text-xs text-slate-400 font-sans block">1-Day mark-to-market bounds</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04. INTERACTIVE PRODUCT SHOWCASE & LIVE INTRADAY ENGINE */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 block">
              02. Live Execution Surface
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Interactive Intraday Charting Engine.
            </h2>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0E1015] border border-white/[0.08] rounded-lg font-mono text-xs">
            {['1D', '1W', '1M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setChartTimeframe(tf)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  chartTimeframe === tf ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Live Active Quote Inspection Frame */}
        <div className="bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-bold text-white">{selectedQuote.symbol}</span>
              <span className="text-xs font-sans text-slate-400">{selectedQuote.name}</span>
              <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800/60 bg-cyan-950/40 px-2 py-0.5 rounded">
                {selectedQuote.exchange}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="text-right">
                <span className="text-2xl font-bold text-white block">
                  {symPrefix}{selectedQuote.price.toFixed(2)}
                </span>
                <span className={`text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}{selectedQuote.change.toFixed(2)} ({isPos ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%)
                </span>
              </div>

              <button
                onClick={() => onLaunchTerminal('analysis')}
                className="bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Deep Research</span>
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="w-full h-[280px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedQuote.chartData}>
                <defs>
                  <linearGradient id="landingChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPos ? '#10b981' : '#f43f5e'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isPos ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1C23" vertical={false} />
                <XAxis dataKey="time" stroke="#52525B" fontSize={11} tickLine={false} fontFamily="monospace" />
                <YAxis domain={['auto', 'auto']} stroke="#52525B" fontSize={11} tickLine={false} orientation="right" fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1116',
                    borderColor: '#27272A',
                    borderRadius: '0.5rem',
                    color: '#F4F4F5',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPos ? '#10b981' : '#f43f5e'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#landingChartGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fundamentals Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08] font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">VOLUME</span>
              <span className="font-bold text-white">{selectedQuote.volume}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">MARKET CAP</span>
              <span className="font-bold text-white">{selectedQuote.marketCap}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">P/E RATIO</span>
              <span className="font-bold text-white">{selectedQuote.peRatio ? `${selectedQuote.peRatio}x` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">52W RANGE</span>
              <span className="font-bold text-slate-300">{symPrefix}{selectedQuote.low52w} – {symPrefix}{selectedQuote.high52w}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05. CORE QUANTITATIVE CAPABILITIES (ASYMMETRIC COMPOSITION) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 block">
            03. Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Institutional Research & Automated Risk Controls.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Volatility Detection (Wide Banner) */}
          <div className="md:col-span-8 bg-[#0D0E12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Autonomous Sparkline Volatility Detection
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans max-w-xl">
                Real-time comparator monitors the active quotes state against earliest session sparkline baselines. When market velocity breaches configurable volatility thresholds, critical signals trigger instantly via interactive toasts and unread signal counters.
              </p>
            </div>

            {/* Live Interactive Threshold Control */}
            <div className="bg-[#08090C] border border-white/[0.08] p-4 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-slate-300">Active Alert Threshold: <strong>±{volatilityThreshold.toFixed(1)}%</strong></span>
                <div className="flex items-center gap-1.5">
                  {[1.0, 1.5, 2.0, 3.0].map((t) => (
                    <button
                      key={t}
                      onClick={() => onUpdateVolatilityThreshold(t)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                        volatilityThreshold === t
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#15171F] text-slate-400 hover:text-white'
                      }`}
                    >
                      ±{t.toFixed(1)}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Test Volatility Monitor on Demand:</span>
                <button
                  onClick={onSimulateVolatilitySpike}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Simulate Price Spike
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Gemini Deep Research (Vertical Feature) */}
          <div className="md:col-span-4 bg-[#0D0E12] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Gemini AI Copilot
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Powered by Google GenAI SDK. Natural language technical breakdowns, Fed macro analysis, and Indian NSE/BSE corporate governance auditing.
              </p>
            </div>

            <button
              onClick={onToggleCopilot}
              className="w-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06. INTERACTIVE PAPER TRADING SANDBOX */}
      {/* ========================================================================= */}
      <section id="sandbox-section" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 block">
              04. Simulated Execution
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Virtual Paper Trading Terminal.
            </h2>
          </div>

          <button
            onClick={() => onLaunchTerminal('trading')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Dedicated Paper Trading Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Order Placement Form */}
          <div className="lg:col-span-5 bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-6 space-y-5 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">MOCK ORDER TICKET</span>
              <span className="text-xs text-emerald-400 font-bold">
                CASH: ${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <form onSubmit={handleQuickOrder} className="space-y-4 text-xs">
              <div className="flex rounded-lg overflow-hidden border border-white/[0.08] p-0.5 bg-[#08090C]">
                <button
                  type="button"
                  onClick={() => setSandboxSide('BUY')}
                  className={`flex-1 py-2 font-bold rounded-md transition-colors cursor-pointer ${
                    sandboxSide === 'BUY' ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxSide('SELL')}
                  className={`flex-1 py-2 font-bold rounded-md transition-colors cursor-pointer ${
                    sandboxSide === 'SELL' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">ASSET IN FOCUS</label>
                <div className="flex items-center justify-between bg-[#111318] border border-white/[0.08] p-2.5 rounded-lg text-white">
                  <span className="font-bold text-sm">{selectedQuote.symbol}</span>
                  <span className="text-slate-400">{symPrefix}{selectedQuote.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">QUANTITY (SHARES)</label>
                <input
                  type="number"
                  min="1"
                  value={sandboxShares}
                  onChange={(e) => setSandboxShares(e.target.value)}
                  className="w-full bg-[#111318] border border-white/[0.08] rounded-lg p-2.5 text-white font-bold focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>ESTIMATED VALUE:</span>
                <span className="font-bold text-white text-sm">
                  {symPrefix}{((parseInt(sandboxShares, 10) || 0) * selectedQuote.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-bold transition-all cursor-pointer ${
                  sandboxSide === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10'
                }`}
              >
                PLACE PAPER {sandboxSide} ORDER
              </button>
            </form>

            {sandboxMessage && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                sandboxMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                {sandboxMessage.text}
              </div>
            )}
          </div>

          {/* Current Live Virtual Positions Table */}
          <div className="lg:col-span-7 bg-[#0B0C10] border border-white/[0.08] rounded-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                ACTIVE VIRTUAL POSITIONS ({virtualPositions.length})
              </span>
              <button
                onClick={handleExportFullWorkbook}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-[11px] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Workbook CSV</span>
              </button>
            </div>

            {virtualPositions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No active positions. Execute a mock order on the left to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase border-b border-white/[0.08] pb-2">
                      <th className="py-2">SYMBOL</th>
                      <th className="py-2">SHARES</th>
                      <th className="py-2">AVG COST</th>
                      <th className="py-2">CURRENCY</th>
                      <th className="py-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {virtualPositions.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-bold text-white">{pos.symbol}</td>
                        <td className="py-2.5 text-slate-300">{pos.shares}</td>
                        <td className="py-2.5 text-slate-300">${pos.avgCost.toFixed(2)}</td>
                        <td className="py-2.5 text-slate-400">{pos.currency}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              onSearchSymbol(pos.symbol);
                              onLaunchTerminal('analysis');
                            }}
                            className="text-cyan-400 hover:underline text-[11px] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07. EXCEL & FINANCIAL CSV EXPORT CENTER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0A0C10] border border-cyan-900/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-cyan-950/20">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-display font-bold text-white">
                Download RFC-4180 Financial Audit Reports
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Export complete structured CSV workbooks including mark-to-market valuations, open positions, and executed trade order history for Excel, Google Sheets, Python/Pandas, or institutional accounting review.
            </p>
            {exportedNotice && (
              <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 pt-1">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded: <strong>{exportedNotice}</strong></span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <button
              onClick={handleExportFullWorkbook}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-3 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              <Download className="w-4 h-4 text-black" />
              <span>Download Master CSV</span>
            </button>

            <button
              onClick={() => onLaunchTerminal('portfolio')}
              className="bg-[#151821] hover:bg-[#1E2330] text-slate-300 border border-white/[0.08] px-4 py-3 rounded-lg transition-colors cursor-pointer"
            >
              View Full Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08. INSTITUTIONAL TRUST & GOVERNANCE */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-[#0B0C10] border border-white/[0.08] p-6 rounded-2xl space-y-3">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h4 className="font-display font-bold text-sm text-white">Role-Based Access Control</h4>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              Granular access segmentation separating Analyst, Investor, and Compliance personas with encrypted session tokens.
            </p>
          </div>

          <div className="bg-[#0B0C10] border border-white/[0.08] p-6 rounded-2xl space-y-3">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h4 className="font-display font-bold text-sm text-white">Deterministic Risk Modeling</h4>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              Continuous 1-day Value at Risk (95% confidence interval) coupled with multi-asset Sharpe and Beta benchmark decomposition.
            </p>
          </div>

          <div className="bg-[#0B0C10] border border-white/[0.08] p-6 rounded-2xl space-y-3">
            <Globe className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-bold text-sm text-white">Non-Custodial Sandbox</h4>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              Zero execution counterparty risk. Test complex algorithmic orders and options volatility smiles in an authentic virtual sandbox.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 09. FINAL TERMINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight" style={{ textWrap: 'balance' }}>
            Ready to Deploy Institutional Market Intelligence?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
            Access the high-density terminal workspace with real-time watchlists, interactive technical screeners, and Gemini AI deep research.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onLaunchTerminal('dashboard')}
            className="flex items-center gap-2 bg-white hover:bg-slate-200 text-black font-mono font-bold text-sm px-7 py-3.5 rounded-lg transition-colors cursor-pointer shadow-xl shadow-white/10"
          >
            <Terminal className="w-4 h-4 text-black" />
            <span>Launch High-Density Terminal</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. EDITORIAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/[0.08] pt-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-white tracking-tight">DEEPDATA</span>
            <span>·</span>
            <span>© 2026 DEEPDATA Financial Systems Ltd.</span>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => onLaunchTerminal('dashboard')} className="hover:text-white transition-colors cursor-pointer">Terminal</button>
            <button onClick={() => onLaunchTerminal('trading')} className="hover:text-white transition-colors cursor-pointer">Paper Trade</button>
            <button onClick={() => onLaunchTerminal('portfolio')} className="hover:text-white transition-colors cursor-pointer">Portfolio CSV</button>
            <button onClick={() => onLaunchTerminal('alerts')} className="hover:text-white transition-colors cursor-pointer">Signals</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
