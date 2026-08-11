import React, { useState } from 'react';
import { PortfolioSummary } from '../types';
import { MOCK_PORTFOLIO } from '../data/mockMarketData';
import { 
  PieChart as PieIcon, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

interface PortfolioViewProps {
  onSearchSymbol: (symbol: string) => void;
  onNavigateToAnalysis: () => void;
}

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  onSearchSymbol,
  onNavigateToAnalysis,
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(MOCK_PORTFOLIO);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 text-[#A1A1AA]">
      {/* Portfolio Value Summary Header */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-light font-mono text-white tracking-tight uppercase">{portfolio.name}</h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Multi-asset portfolio analytics with real-time mark-to-market pricing, Value at Risk (VaR 95%), and automated tax optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">TOTAL PORTFOLIO VALUE</span>
              <span className="text-lg font-bold font-mono text-white">
                ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-l border-[#1F1F23] pl-3">
              <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">DAILY P/L</span>
              <span className="text-sm font-bold font-mono text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +${portfolio.dailyChange.toLocaleString()} (+{portfolio.dailyChangePercent}%)
              </span>
            </div>

            <div className="border-l border-[#1F1F23] pl-3">
              <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">UNREALIZED GAIN</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                +${portfolio.totalGainLoss.toLocaleString()} (+{portfolio.totalGainLossPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Risk Decomposition Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
          <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">1-DAY VaR (95%)</span>
          <span className="text-base font-bold text-rose-400 mt-0.5 block">{portfolio.var951d}%</span>
          <span className="text-[9px] text-gray-600 block">Max daily loss</span>
        </div>

        <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
          <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">SHARPE RATIO</span>
          <span className="text-base font-bold text-emerald-400 mt-0.5 block">{portfolio.sharpeRatio}</span>
          <span className="text-[9px] text-gray-600 block">Risk-adjusted return</span>
        </div>

        <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
          <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">PORTFOLIO BETA</span>
          <span className="text-base font-bold text-cyan-400 mt-0.5 block">{portfolio.beta}</span>
          <span className="text-[9px] text-gray-600 block">Vs S&P 500</span>
        </div>

        <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
          <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">DIVERSIFICATION</span>
          <span className="text-base font-bold text-cyan-300 mt-0.5 block">{portfolio.diversificationScore}/100</span>
          <span className="text-[9px] text-gray-600 block">Multi-asset spread</span>
        </div>
      </div>

      {/* Holdings & Sector Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Holdings Table */}
        <div className="lg:col-span-8 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-[#1F1F23] pb-2">
            CURRENT HOLDINGS & ALLOCATIONS
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F1F23] text-gray-500 uppercase text-[9px] tracking-wider">
                  <th className="py-2 px-3">SYMBOL</th>
                  <th className="py-2 px-3">PRICE</th>
                  <th className="py-2 px-3">SHARES</th>
                  <th className="py-2 px-3">UNREALIZED P/L</th>
                  <th className="py-2 px-3">ALLOC %</th>
                  <th className="py-2 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {portfolio.holdings.map((h) => {
                  const pos = h.unrealizedGainLoss >= 0;
                  return (
                    <tr key={h.symbol} className="hover:bg-[#18181B] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white text-xs">{h.symbol}</div>
                        <div className="text-[10px] text-gray-500 font-sans">{h.name}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {h.region === 'INDIA' ? '₹' : '$'}{h.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300">{h.shares}</td>
                      <td className={`py-2.5 px-3 font-bold ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos ? '+' : ''}${h.unrealizedGainLoss.toLocaleString()} ({pos ? '+' : ''}{h.unrealizedGainLossPercent.toFixed(2)}%)
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400 font-bold">{h.allocationPercent}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            onSearchSymbol(h.symbol);
                            onNavigateToAnalysis();
                          }}
                          className="bg-[#18181B] hover:bg-[#27272A] text-cyan-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors border border-[#27272A]"
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Allocation Pie Chart */}
        <div className="lg:col-span-4 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm flex flex-col justify-between space-y-3">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-[#1F1F23] pb-2">
            SECTOR EXPOSURE HEATMAP
          </h3>

          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolio.sectorExposures}
                  dataKey="percent"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {portfolio.sectorExposures.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs font-mono">
            {portfolio.sectorExposures.map((s, idx) => (
              <div key={s.sector} className="flex justify-between items-center text-gray-400">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-300 text-[11px]">{s.sector}</span>
                </span>
                <span className="font-bold text-white">{s.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Optimization & Rebalancing Advice Box */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">
            DEEPDATA AI REBALANCING INTELLIGENCE
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23] space-y-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider block text-[10px]">1. TECH CONCENTRATION RISK</span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Technology & Semiconductors represent 74.14% of equity weight. Reallocating 10% into Healthcare or Sovereign Debt reduces portfolio 1-day VaR from -2.15% to -1.65%.
            </p>
          </div>

          <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23] space-y-1">
            <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px]">2. CASH YIELD STRATEGY</span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Deploying $18,500 uninvested cash into AAA Sovereign Bonds (GoI 6.87% 2033 / Treasury) captures $1,137 annual risk-free income plus rate-cut capital appreciation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
