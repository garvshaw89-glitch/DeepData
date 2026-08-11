import React, { useState } from 'react';
import { AssetQuote } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Sparkles, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Filter, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

interface MarketDashboardProps {
  quotes: AssetQuote[];
  selectedQuote: AssetQuote;
  onSelectQuote: (quote: AssetQuote) => void;
  onAnalyzeQuote: (quote: AssetQuote) => void;
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({
  quotes,
  selectedQuote,
  onSelectQuote,
  onAnalyzeQuote,
}) => {
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [chartTimeframe, setChartTimeframe] = useState<string>('1D');

  const filteredQuotes = quotes.filter((q) => {
    if (assetFilter === 'all') return true;
    return q.type === assetFilter;
  });

  const isPositive = selectedQuote.change >= 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-[#A1A1AA]">
      {/* Top Banner: Market Sentiment Gauge & AI Flash Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Market Sentiment Card */}
        <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">REAL-TIME MARKET SENTIMENT</h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
              BULLISH (68%)
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] mb-3 leading-relaxed">
            FinBERT NLP engines analyzing 15,000+ sources & institutional order flows signal strong tech and sovereign bond momentum.
          </p>

          {/* Sentiment Gauge Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span className="text-emerald-400">BULLISH 68%</span>
              <span>NEUTRAL 22%</span>
              <span className="text-rose-400">BEARISH 10%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1F1F23] flex overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '68%' }} />
              <div className="bg-gray-600 h-full" style={{ width: '22%' }} />
              <div className="bg-rose-500 h-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>

        {/* AI Highlight Banner */}
        <div className="lg:col-span-2 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">MACRO RESEARCH CATALYST</h3>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              FED_POLICY_SHIFT_PROB_78%
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white tracking-tight">
              Federal Reserve Rate Cut Expectation Rises to 78% for Q4
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              <strong className="text-cyan-400">AI Recommendation:</strong> Reallocate 10-15% of cash reserves into 5-10Y sovereign AAA bonds (yielding 6.15% YTM) and high cash-flow technology leaders (AAPL, MSFT).
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-[#1F1F23] flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>SYNC_LATENCY: 3m ago</span>
            </span>
            <button 
              onClick={() => onAnalyzeQuote(selectedQuote)}
              className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer uppercase tracking-wider"
            >
              <span>INSPECT ({selectedQuote.symbol})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Watchlist & Right Interactive Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Watchlist Table / Cards Column */}
        <div className="lg:col-span-5 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>WATCHLIST STREAM</span>
            </h3>
            <div className="flex items-center space-x-1">
              {['all', 'stock', 'etf', 'bond', 'crypto'].map((type) => (
                <button
                  key={type}
                  onClick={() => setAssetFilter(type)}
                  className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase transition-colors cursor-pointer ${
                    assetFilter === type
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-gray-400 hover:text-white bg-[#1F1F23]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredQuotes.map((q) => {
              const isSelected = selectedQuote.symbol === q.symbol;
              const pos = q.change >= 0;
              return (
                <div
                  key={q.symbol}
                  onClick={() => onSelectQuote(q)}
                  className={`p-2.5 rounded transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 text-white'
                      : 'bg-[#0F0F12] border-[#1F1F23] hover:bg-[#1F1F23]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white">{q.symbol}</span>
                      <span className="text-[9px] text-gray-500 uppercase font-mono px-1 bg-[#18181B] border border-[#27272A] rounded">
                        {q.type}
                      </span>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-white">
                      {q.currency === 'USD' ? '$' : q.currency === 'INR' ? '₹' : ''}
                      {q.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span className="truncate max-w-[180px] text-[10px]">{q.name}</span>
                    <span className={`font-mono text-[10px] font-bold flex items-center space-x-0.5 ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                      <span>{pos ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Quote Detail & Interactive Chart */}
        <div className="lg:col-span-7 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm flex flex-col justify-between space-y-4">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1F1F23] gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-light font-mono text-white tracking-tight">{selectedQuote.symbol}</h2>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-800">
                  {selectedQuote.name}
                </span>
                <span className="text-[10px] bg-[#1F1F23] text-gray-400 font-mono px-1.5 py-0.5 rounded uppercase">
                  {selectedQuote.sector || selectedQuote.type}
                </span>
              </div>
              <p className="text-[10px] font-mono text-gray-500 mt-1">
                VOL: <strong className="text-gray-300">{selectedQuote.volume}</strong> | 52W RANGE: <strong className="text-gray-300">{selectedQuote.currency === 'INR' ? '₹' : '$'}{selectedQuote.low52w} - {selectedQuote.currency === 'INR' ? '₹' : '$'}{selectedQuote.high52w}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-light font-mono text-white tracking-tight">
                  {selectedQuote.currency === 'USD' ? '$' : selectedQuote.currency === 'INR' ? '₹' : ''}
                  {selectedQuote.price.toFixed(2)}
                </div>
                <div className={`text-[10px] font-mono font-bold flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{selectedQuote.change.toFixed(2)} ({isPositive ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%)
                </div>
              </div>

              <button
                onClick={() => onAnalyzeQuote(selectedQuote)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI_RESEARCH</span>
              </button>
            </div>
          </div>

          {/* Timeframe Selector & Chart Controls */}
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-gray-500 uppercase tracking-widest font-bold">REAL-TIME INTRADAY ANALYSIS</span>
            <div className="flex space-x-1 bg-[#18181B] p-0.5 rounded border border-[#27272A]">
              {['1D', '1W', '1M', '1Y', '5Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                    chartTimeframe === tf ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-[260px] pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedQuote.chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#1F1F23" vertical={false} />
                <XAxis dataKey="time" stroke="#52525B" fontSize={10} tickLine={false} fontFamily="monospace" />
                <YAxis domain={['auto', 'auto']} stroke="#52525B" fontSize={10} tickLine={false} orientation="right" fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F12',
                    borderColor: '#27272A',
                    borderRadius: '0.25rem',
                    color: '#F4F4F5',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Fundamentals Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1F1F23] text-xs font-mono">
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">MARKET CAP</span>
              <span className="font-bold text-white text-xs">{selectedQuote.marketCap || selectedQuote.volume}</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">P/E RATIO</span>
              <span className="font-bold text-white text-xs">{selectedQuote.peRatio ? `${selectedQuote.peRatio}x` : 'N/A'}</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">DIV YIELD</span>
              <span className="font-bold text-emerald-400 text-xs">{selectedQuote.dividendYield ? `${selectedQuote.dividendYield}%` : '0.00%'}</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">AI RATING</span>
              <span className="font-bold text-cyan-400 text-xs">82/100 BULLISH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
