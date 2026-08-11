import React, { useState } from 'react';
import { AssetQuote } from '../types';
import { 
  Filter, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Sliders, 
  ArrowUpDown, 
  ChevronRight, 
  CheckCircle2, 
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface ScreenerViewProps {
  quotes: AssetQuote[];
  onSelectQuote: (quote: AssetQuote) => void;
  onAnalyzeQuote: (quote: AssetQuote) => void;
}

const BACKTEST_STRATEGY_DATA = [
  { year: '2016', strategy: 100, benchmark: 100 },
  { year: '2018', strategy: 134, benchmark: 118 },
  { year: '2020', strategy: 182, benchmark: 142 },
  { year: '2022', strategy: 228, benchmark: 168 },
  { year: '2024', strategy: 310, benchmark: 215 },
  { year: '2026', strategy: 412, benchmark: 265 },
];

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  quotes,
  onSelectQuote,
  onAnalyzeQuote,
}) => {
  const [activeStrategy, setActiveStrategy] = useState<string>('QUALITY_GROWTH');
  const [maxPe, setMaxPe] = useState<number>(35);
  const [minDivYield, setMinDivYield] = useState<number>(0.0);
  const [minAiScore, setMinAiScore] = useState<number>(75);
  const [selectedSector, setSelectedSector] = useState<string>('All');

  // Filter stocks based on state
  const screenedQuotes = quotes.filter((q) => {
    if (selectedSector !== 'All' && q.sector !== selectedSector) return false;
    if (q.peRatio && q.peRatio > maxPe) return false;
    if (minDivYield > 0 && (q.dividendYield || 0) < minDivYield) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 text-[#A1A1AA]">
      {/* Header */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-light font-mono text-white tracking-tight uppercase">QUANTITATIVE SCREENER & BACKTESTER</h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Screen global equity universes using 50+ quantitative factors, machine learning confidence ratings, and 10-year backtested strategy models.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0F0F12] p-2 rounded border border-[#1F1F23] text-xs font-mono">
            <span className="text-gray-500 uppercase">UNIVERSE:</span>
            <span className="text-emerald-400 font-bold">15,000 SECURITIES</span>
          </div>
        </div>
      </div>

      {/* Preset Quantitative Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setActiveStrategy('VALUE_MOMENTUM');
            setMaxPe(20);
            setMinDivYield(0.5);
            setMinAiScore(70);
          }}
          className={`p-3.5 rounded border text-left transition-all cursor-pointer ${
            activeStrategy === 'VALUE_MOMENTUM'
              ? 'bg-cyan-500/10 border-cyan-500 text-white'
              : 'bg-[#121214] border-[#1F1F23] hover:bg-[#1F1F23]/60'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono font-bold text-xs text-cyan-400 uppercase tracking-wider">Value + Momentum</span>
            <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60">
              +14.2% CAGR
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">P/E &lt; 20, 52-week price strength, Debt/Equity &lt; 1.0. High margin of safety.</p>
        </button>

        <button
          onClick={() => {
            setActiveStrategy('QUALITY_GROWTH');
            setMaxPe(35);
            setMinDivYield(0.0);
            setMinAiScore(80);
          }}
          className={`p-3.5 rounded border text-left transition-all cursor-pointer ${
            activeStrategy === 'QUALITY_GROWTH'
              ? 'bg-cyan-500/10 border-cyan-500 text-white'
              : 'bg-[#121214] border-[#1F1F23] hover:bg-[#1F1F23]/60'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono font-bold text-xs text-cyan-400 uppercase tracking-wider">Quality Growth</span>
            <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60">
              +18.5% CAGR
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">Revenue growth &gt; 15%, ROE &gt; 20%, Wide Moat AI score &gt; 80.</p>
        </button>

        <button
          onClick={() => {
            setActiveStrategy('DIVIDEND_ARISTOCRATS');
            setMaxPe(25);
            setMinDivYield(1.2);
            setMinAiScore(75);
          }}
          className={`p-3.5 rounded border text-left transition-all cursor-pointer ${
            activeStrategy === 'DIVIDEND_ARISTOCRATS'
              ? 'bg-cyan-500/10 border-cyan-500 text-white'
              : 'bg-[#121214] border-[#1F1F23] hover:bg-[#1F1F23]/60'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono font-bold text-xs text-cyan-400 uppercase tracking-wider">Dividend Aristocrats</span>
            <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60">
              +11.3% CAGR
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">Yield &gt; 1.2%, consistent 10-year payout expansion, sustainable cash coverage.</p>
        </button>
      </div>

      {/* Interactive Quantitative Filter Controls */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>CUSTOM FACTOR PARAMETERS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23]">
            <label className="block text-gray-400 mb-1 text-[10px] uppercase">MAX P/E RATIO: <strong className="text-cyan-400">{maxPe}x</strong></label>
            <input
              type="range"
              min="10"
              max="60"
              value={maxPe}
              onChange={(e) => setMaxPe(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23]">
            <label className="block text-gray-400 mb-1 text-[10px] uppercase">MIN DIV YIELD: <strong className="text-cyan-400">{minDivYield}%</strong></label>
            <input
              type="range"
              min="0"
              max="4"
              step="0.2"
              value={minDivYield}
              onChange={(e) => setMinDivYield(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23]">
            <label className="block text-gray-400 mb-1 text-[10px] uppercase">MIN AI RATING: <strong className="text-cyan-400">{minAiScore}/100</strong></label>
            <input
              type="range"
              min="50"
              max="95"
              value={minAiScore}
              onChange={(e) => setMinAiScore(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23]">
            <label className="block text-gray-400 mb-1 text-[10px] uppercase">SECTOR FILTER</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-[#18181B] text-white border border-[#27272A] rounded p-1 outline-none text-xs"
            >
              <option value="All">ALL SECTORS</option>
              <option value="Technology">TECHNOLOGY</option>
              <option value="Semiconductors">SEMICONDUCTORS</option>
              <option value="Automotive">AUTOMOTIVE</option>
              <option value="Diversified Index">DIVERSIFIED INDEX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screened Stock Results Table */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#1F1F23]">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">
            SCREENED MATCHES ({screenedQuotes.length} ASSETS)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1F1F23] text-gray-500 uppercase text-[9px] tracking-wider">
                <th className="py-2 px-3">ASSET</th>
                <th className="py-2 px-3">PRICE</th>
                <th className="py-2 px-3">CHANGE</th>
                <th className="py-2 px-3">P/E</th>
                <th className="py-2 px-3">DIV YIELD</th>
                <th className="py-2 px-3">AI SCORE</th>
                <th className="py-2 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {screenedQuotes.map((q) => {
                const pos = q.change >= 0;
                return (
                  <tr key={q.symbol} className="hover:bg-[#18181B] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white text-xs">{q.symbol}</div>
                      <div className="text-[10px] text-gray-500 font-sans">{q.name}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {q.currency === 'INR' ? '₹' : '$'}{q.price.toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-3 font-bold ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {q.peRatio ? `${q.peRatio}x` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">
                      {q.dividendYield ? `${q.dividendYield}%` : '0.00%'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-cyan-950/80 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800 font-bold text-[10px]">
                        85/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectQuote(q);
                          onAnalyzeQuote(q);
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>INSPECT</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10-Year Strategy Backtest Performance Chart */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>STRATEGY BACKTEST VS BENCHMARK (10-YEAR GROWTH OF $100K)</span>
        </h3>

        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={BACKTEST_STRATEGY_DATA}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1F1F23" vertical={false} />
              <XAxis dataKey="year" stroke="#52525B" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#52525B" fontSize={10} orientation="right" fontFamily="monospace" />
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
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="strategy" name="AI Strategy ($k)" stroke="#06b6d4" strokeWidth={2} />
              <Line type="monotone" dataKey="benchmark" name="S&P 500 Index ($k)" stroke="#52525B" strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
