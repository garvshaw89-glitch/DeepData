import React, { useState, useMemo } from 'react';
import { PortfolioSummary, PaperOrder, PaperPosition, AssetQuote } from '../types';
import { MOCK_PORTFOLIO } from '../data/mockMarketData';
import { 
  PieChart as PieIcon, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Wallet,
  Briefcase,
  History,
  Check,
  RotateCcw
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
  virtualPositions?: PaperPosition[];
  virtualOrders?: PaperOrder[];
  virtualCash?: number;
  quotes?: AssetQuote[];
  onNavigateToTrading?: () => void;
}

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

/**
 * Escapes values for standard RFC-4180 CSV compliance
 */
const escapeCSV = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Triggers a client-side file download of raw text / CSV data
 */
const downloadCSVFile = (content: string, filename: string) => {
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

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  onSearchSymbol,
  onNavigateToAnalysis,
  virtualPositions = [],
  virtualOrders = [],
  virtualCash = 100000,
  quotes = [],
  onNavigateToTrading,
}) => {
  const [portfolio] = useState<PortfolioSummary>(MOCK_PORTFOLIO);
  const [activeTab, setActiveTab] = useState<'virtual' | 'institutional'>('virtual');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [lastExportedNotice, setLastExportedNotice] = useState<string | null>(null);

  // Quote lookup map for real-time prices
  const quotePriceMap = useMemo(() => {
    const map = new Map<string, AssetQuote>();
    quotes.forEach((q) => map.set(q.symbol, q));
    return map;
  }, [quotes]);

  // Real-time valuation calculations for virtual paper positions
  const { 
    positionsValuation, 
    totalInvestedMarketValue, 
    totalCostBasis, 
    totalUnrealizedPL, 
    totalUnrealizedPLPercent, 
    totalNetLiquidity 
  } = useMemo(() => {
    let investedMtm = 0;
    let costTotal = 0;

    const enriched = virtualPositions.map((pos) => {
      const liveQuote = quotePriceMap.get(pos.symbol);
      const currentPrice = liveQuote ? liveQuote.price : pos.avgCost;
      const costBasis = pos.shares * pos.avgCost;
      const marketValue = pos.shares * currentPrice;
      const unrealizedPL = marketValue - costBasis;
      const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0;

      investedMtm += marketValue;
      costTotal += costBasis;

      return {
        ...pos,
        currentPrice,
        costBasis,
        marketValue,
        unrealizedPL,
        unrealizedPLPercent,
        quote: liveQuote,
      };
    });

    const netLiquidity = virtualCash + investedMtm;
    const plTotal = investedMtm - costTotal;
    const plPercentTotal = costTotal > 0 ? (plTotal / costTotal) * 100 : 0;

    return {
      positionsValuation: enriched,
      totalInvestedMarketValue: investedMtm,
      totalCostBasis: costTotal,
      totalUnrealizedPL: plTotal,
      totalUnrealizedPLPercent: plPercentTotal,
      totalNetLiquidity: netLiquidity,
    };
  }, [virtualPositions, virtualCash, quotePriceMap]);

  // Show notice briefly after download
  const triggerExportNotice = (filename: string) => {
    setLastExportedNotice(filename);
    setTimeout(() => {
      setLastExportedNotice((curr) => (curr === filename ? null : curr));
    }, 4500);
  };

  /**
   * Generates and downloads the Virtual Positions CSV
   */
  const handleDownloadPositionsCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleString();

    const headers = [
      'Symbol',
      'Asset Name',
      'Shares Owned',
      'Average Cost Basis',
      'Current Market Price',
      'Total Cost Basis',
      'Current Market Value',
      'Unrealized P&L ($)',
      'Unrealized P&L (%)',
      'Currency',
      'Region',
      'Portfolio Allocation (%)'
    ];

    const rows: string[] = [
      `# DEEPDATA FINANCIAL SYSTEMS - VIRTUAL OPEN POSITIONS REPORT`,
      `# Export Timestamp: ${timestampStr}`,
      `# Total Positions: ${positionsValuation.length}`,
      `# Available Cash: $${virtualCash.toFixed(2)}`,
      `# Total Invested Equity: $${totalInvestedMarketValue.toFixed(2)}`,
      `# Total Net Liquidity: $${totalNetLiquidity.toFixed(2)}`,
      headers.map(escapeCSV).join(',')
    ];

    positionsValuation.forEach((pos) => {
      const allocation = totalNetLiquidity > 0 ? ((pos.marketValue / totalNetLiquidity) * 100).toFixed(2) : '0.00';
      const row = [
        escapeCSV(pos.symbol),
        escapeCSV(pos.name),
        escapeCSV(pos.shares),
        escapeCSV(pos.avgCost.toFixed(2)),
        escapeCSV(pos.currentPrice.toFixed(2)),
        escapeCSV(pos.costBasis.toFixed(2)),
        escapeCSV(pos.marketValue.toFixed(2)),
        escapeCSV(pos.unrealizedPL.toFixed(2)),
        escapeCSV(`${pos.unrealizedPLPercent.toFixed(2)}%`),
        escapeCSV(pos.currency),
        escapeCSV(pos.region),
        escapeCSV(`${allocation}%`)
      ];
      rows.push(row.join(','));
    });

    // Summary row
    rows.push('');
    rows.push([
      escapeCSV('PORTFOLIO TOTALS'),
      escapeCSV('All Active Holdings'),
      escapeCSV(positionsValuation.reduce((acc, p) => acc + p.shares, 0)),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(totalCostBasis.toFixed(2)),
      escapeCSV(totalInvestedMarketValue.toFixed(2)),
      escapeCSV(totalUnrealizedPL.toFixed(2)),
      escapeCSV(`${totalUnrealizedPLPercent.toFixed(2)}%`),
      escapeCSV('USD'),
      escapeCSV('MULTI-MARKET'),
      escapeCSV(totalNetLiquidity > 0 ? `${((totalInvestedMarketValue / totalNetLiquidity) * 100).toFixed(2)}%` : '0%')
    ].join(','));

    rows.push([
      escapeCSV('CASH BALANCE'),
      escapeCSV('Uninvested Virtual Purchasing Power'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(virtualCash.toFixed(2)),
      escapeCSV('0.00'),
      escapeCSV('0.00%'),
      escapeCSV('USD'),
      escapeCSV('GLOBAL'),
      escapeCSV(totalNetLiquidity > 0 ? `${((virtualCash / totalNetLiquidity) * 100).toFixed(2)}%` : '0%')
    ].join(','));

    rows.push([
      escapeCSV('TOTAL NET LIQUIDITY'),
      escapeCSV('Combined Cash + Real-Time Equity'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(totalNetLiquidity.toFixed(2)),
      escapeCSV(totalUnrealizedPL.toFixed(2)),
      escapeCSV(`${totalUnrealizedPLPercent.toFixed(2)}%`),
      escapeCSV('USD'),
      escapeCSV('GLOBAL'),
      escapeCSV('100.00%')
    ].join(','));

    const csvContent = rows.join('\r\n');
    const filename = `deepdata_virtual_positions_${todayStr}.csv`;
    downloadCSVFile(csvContent, filename);
    triggerExportNotice(filename);
    setIsExportDropdownOpen(false);
  };

  /**
   * Generates and downloads the Executed Order History CSV
   */
  const handleDownloadOrdersCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleString();

    const headers = [
      'Order ID',
      'Execution Timestamp',
      'Symbol',
      'Asset Name',
      'Action (Side)',
      'Order Type',
      'Quantity (Shares)',
      'Submitted Price',
      'Executed Price',
      'Total Value',
      'Currency',
      'Execution Status'
    ];

    const rows: string[] = [
      `# DEEPDATA FINANCIAL SYSTEMS - TRADE AUDIT & ORDER HISTORY REPORT`,
      `# Export Timestamp: ${timestampStr}`,
      `# Total Executed Orders: ${virtualOrders.length}`,
      headers.map(escapeCSV).join(',')
    ];

    virtualOrders.forEach((ord) => {
      const row = [
        escapeCSV(ord.id),
        escapeCSV(ord.timestamp),
        escapeCSV(ord.symbol),
        escapeCSV(ord.name),
        escapeCSV(ord.side),
        escapeCSV(ord.type),
        escapeCSV(ord.shares),
        escapeCSV(ord.orderPrice.toFixed(2)),
        escapeCSV(ord.executionPrice.toFixed(2)),
        escapeCSV(ord.totalCost.toFixed(2)),
        escapeCSV(ord.currency),
        escapeCSV(ord.status)
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const filename = `deepdata_order_history_${todayStr}.csv`;
    downloadCSVFile(csvContent, filename);
    triggerExportNotice(filename);
    setIsExportDropdownOpen(false);
  };

  /**
   * Generates and downloads a Combined Full Portfolio CSV (Positions + Order Audit Trail)
   */
  const handleDownloadComprehensiveCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleString();

    const rows: string[] = [
      `# ====================================================================`,
      `# DEEPDATA FINANCIAL PLATFORM - COMPREHENSIVE VIRTUAL PORTFOLIO WORKBOOK`,
      `# ====================================================================`,
      `# Export Generated: ${timestampStr}`,
      `# Account Type: Paper Trading Virtual Simulation (Real-Time Mark-to-Market)`,
      `# Net Liquidation Value: $${totalNetLiquidity.toFixed(2)}`,
      `# Available Purchasing Power: $${virtualCash.toFixed(2)}`,
      `# Invested Holdings Market Value: $${totalInvestedMarketValue.toFixed(2)}`,
      `# Total Unrealized Gain/Loss: $${totalUnrealizedPL.toFixed(2)} (${totalUnrealizedPLPercent.toFixed(2)}%)`,
      `# Total Active Positions: ${positionsValuation.length}`,
      `# Total Orders Executed: ${virtualOrders.length}`,
      ``,
      `# --------------------------------------------------------------------`,
      `# SECTION 1: CURRENT OPEN VIRTUAL POSITIONS`,
      `# --------------------------------------------------------------------`,
      [
        'Symbol',
        'Asset Name',
        'Shares Owned',
        'Average Cost Basis',
        'Current Market Price',
        'Total Cost Basis',
        'Current Market Value',
        'Unrealized P&L ($)',
        'Unrealized P&L (%)',
        'Currency',
        'Region',
        'Portfolio Allocation (%)'
      ].map(escapeCSV).join(',')
    ];

    positionsValuation.forEach((pos) => {
      const allocation = totalNetLiquidity > 0 ? ((pos.marketValue / totalNetLiquidity) * 100).toFixed(2) : '0.00';
      rows.push([
        escapeCSV(pos.symbol),
        escapeCSV(pos.name),
        escapeCSV(pos.shares),
        escapeCSV(pos.avgCost.toFixed(2)),
        escapeCSV(pos.currentPrice.toFixed(2)),
        escapeCSV(pos.costBasis.toFixed(2)),
        escapeCSV(pos.marketValue.toFixed(2)),
        escapeCSV(pos.unrealizedPL.toFixed(2)),
        escapeCSV(`${pos.unrealizedPLPercent.toFixed(2)}%`),
        escapeCSV(pos.currency),
        escapeCSV(pos.region),
        escapeCSV(`${allocation}%`)
      ].join(','));
    });

    // Positions subtotal
    rows.push([
      escapeCSV('TOTAL OPEN POSITIONS'),
      escapeCSV(''),
      escapeCSV(positionsValuation.reduce((a, b) => a + b.shares, 0)),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(totalCostBasis.toFixed(2)),
      escapeCSV(totalInvestedMarketValue.toFixed(2)),
      escapeCSV(totalUnrealizedPL.toFixed(2)),
      escapeCSV(`${totalUnrealizedPLPercent.toFixed(2)}%`),
      escapeCSV('USD'),
      escapeCSV(''),
      escapeCSV(totalNetLiquidity > 0 ? `${((totalInvestedMarketValue / totalNetLiquidity) * 100).toFixed(2)}%` : '0%')
    ].join(','));

    rows.push('');
    rows.push(`# --------------------------------------------------------------------`);
    rows.push(`# SECTION 2: EXECUTED ORDER AUDIT HISTORY`);
    rows.push(`# --------------------------------------------------------------------`);
    rows.push([
      'Order ID',
      'Execution Timestamp',
      'Symbol',
      'Asset Name',
      'Side',
      'Order Type',
      'Shares',
      'Order Price',
      'Execution Price',
      'Total Value',
      'Currency',
      'Status'
    ].map(escapeCSV).join(','));

    virtualOrders.forEach((ord) => {
      rows.push([
        escapeCSV(ord.id),
        escapeCSV(ord.timestamp),
        escapeCSV(ord.symbol),
        escapeCSV(ord.name),
        escapeCSV(ord.side),
        escapeCSV(ord.type),
        escapeCSV(ord.shares),
        escapeCSV(ord.orderPrice.toFixed(2)),
        escapeCSV(ord.executionPrice.toFixed(2)),
        escapeCSV(ord.totalCost.toFixed(2)),
        escapeCSV(ord.currency),
        escapeCSV(ord.status)
      ].join(','));
    });

    const csvContent = rows.join('\r\n');
    const filename = `deepdata_virtual_portfolio_full_${todayStr}.csv`;
    downloadCSVFile(csvContent, filename);
    triggerExportNotice(filename);
    setIsExportDropdownOpen(false);
  };

  /**
   * Generates and downloads the Institutional Portfolio Model CSV
   */
  const handleDownloadInstitutionalCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toLocaleString();

    const rows: string[] = [
      `# DEEPDATA FINANCIAL SYSTEMS - INSTITUTIONAL MODEL PORTFOLIO REPORT`,
      `# Generated: ${timestampStr}`,
      `# Model Name: ${portfolio.name}`,
      `# Total Value: $${portfolio.totalValue.toFixed(2)}`,
      `# 1-Day VaR (95%): ${portfolio.var951d}%`,
      `# Sharpe Ratio: ${portfolio.sharpeRatio}`,
      `# Portfolio Beta: ${portfolio.beta}`,
      `# Diversification Score: ${portfolio.diversificationScore}/100`,
      ``,
      `# HOLDINGS`,
      ['Symbol', 'Asset Name', 'Shares', 'Current Price', 'Unrealized P&L ($)', 'Unrealized P&L (%)', 'Allocation (%)', 'Region'].map(escapeCSV).join(',')
    ];

    portfolio.holdings.forEach((h) => {
      rows.push([
        escapeCSV(h.symbol),
        escapeCSV(h.name),
        escapeCSV(h.shares),
        escapeCSV(h.currentPrice.toFixed(2)),
        escapeCSV(h.unrealizedGainLoss.toFixed(2)),
        escapeCSV(`${h.unrealizedGainLossPercent.toFixed(2)}%`),
        escapeCSV(`${h.allocationPercent}%`),
        escapeCSV(h.region)
      ].join(','));
    });

    const csvContent = rows.join('\r\n');
    const filename = `deepdata_institutional_model_${todayStr}.csv`;
    downloadCSVFile(csvContent, filename);
    triggerExportNotice(filename);
    setIsExportDropdownOpen(false);
  };

  // Pie chart data for virtual holdings
  const virtualSectorData = useMemo(() => {
    if (positionsValuation.length === 0) {
      return [{ name: 'Cash', value: 100, color: '#10b981' }];
    }
    const total = totalNetLiquidity > 0 ? totalNetLiquidity : 1;
    const slices = positionsValuation.map((p, idx) => ({
      name: p.symbol,
      value: Number(((p.marketValue / total) * 100).toFixed(1)),
      color: COLORS[idx % COLORS.length]
    }));

    if (virtualCash > 0) {
      slices.push({
        name: 'Cash Balance',
        value: Number(((virtualCash / total) * 100).toFixed(1)),
        color: '#10b981'
      });
    }

    return slices;
  }, [positionsValuation, virtualCash, totalNetLiquidity]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 text-[#A1A1AA]">
      {/* Portfolio Value Summary Header */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-light font-mono text-white tracking-tight uppercase">
                {activeTab === 'virtual' ? 'VIRTUAL PAPER TRADING PORTFOLIO' : portfolio.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold">
                {activeTab === 'virtual' ? 'LIVE SIMULATION' : 'QUANT BENCHMARK'}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              {activeTab === 'virtual' 
                ? 'Real-time mark-to-market positions, virtual cash balances, simulated trade audit logs, and downloadable financial reports.'
                : 'Multi-asset portfolio analytics with real-time mark-to-market pricing, Value at Risk (VaR 95%), and automated tax optimization.'}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => setActiveTab('virtual')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'virtual'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-[#18181B] border border-[#27272A]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Virtual Paper Portfolio ({positionsValuation.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('institutional')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'institutional'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-[#18181B] border border-[#27272A]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Institutional Model</span>
              </button>
            </div>
          </div>

          {/* Metric Summary & Download CSV Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">
                  {activeTab === 'virtual' ? 'NET LIQUIDATION VALUE' : 'TOTAL PORTFOLIO VALUE'}
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  ${(activeTab === 'virtual' ? totalNetLiquidity : portfolio.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-l border-[#1F1F23] pl-3">
                <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">
                  {activeTab === 'virtual' ? 'CASH BALANCE' : 'DAILY P/L'}
                </span>
                {activeTab === 'virtual' ? (
                  <span className="text-sm font-bold font-mono text-white">
                    ${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="text-sm font-bold font-mono text-emerald-400 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +${portfolio.dailyChange.toLocaleString()} (+{portfolio.dailyChangePercent}%)
                  </span>
                )}
              </div>

              <div className="border-l border-[#1F1F23] pl-3">
                <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">
                  UNREALIZED P/L
                </span>
                {activeTab === 'virtual' ? (
                  <span className={`text-sm font-bold font-mono ${totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalUnrealizedPL >= 0 ? '+' : ''}${totalUnrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalUnrealizedPL >= 0 ? '+' : ''}{totalUnrealizedPLPercent.toFixed(2)}%)
                  </span>
                ) : (
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    +${portfolio.totalGainLoss.toLocaleString()} (+{portfolio.totalGainLossPercent}%)
                  </span>
                )}
              </div>
            </div>

            {/* DOWNLOAD CSV DROPDOWN MENU */}
            <div className="relative">
              <div className="inline-flex rounded shadow-sm">
                {/* Primary Button */}
                <button
                  onClick={activeTab === 'virtual' ? handleDownloadComprehensiveCSV : handleDownloadInstitutionalCSV}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-mono font-bold text-xs px-3.5 py-2.5 rounded-l transition-all cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
                  title="Download complete structured CSV report for Excel or Sheets"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>DOWNLOAD CSV</span>
                </button>
                {/* Split Dropdown Trigger */}
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-black font-mono px-2 py-2.5 rounded-r border-l border-cyan-700/60 cursor-pointer transition-colors"
                  aria-label="Export options"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dropdown Options */}
              {isExportDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsExportDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#121214] border border-[#27272A] rounded-lg shadow-2xl py-2 z-50 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-[#1F1F23]">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">CSV EXPORT FORMATS</span>
                    </div>

                    <button
                      onClick={handleDownloadComprehensiveCSV}
                      className="w-full text-left px-3 py-2.5 hover:bg-[#18181B] text-white flex items-start space-x-2.5 transition-colors cursor-pointer group"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-cyan-300">Complete Virtual Workbook (CSV)</div>
                        <div className="text-[10px] text-gray-400">Positions + Order History in one master workbook</div>
                      </div>
                    </button>

                    <button
                      onClick={handleDownloadPositionsCSV}
                      className="w-full text-left px-3 py-2.5 hover:bg-[#18181B] text-white flex items-start space-x-2.5 transition-colors cursor-pointer group"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-200">Virtual Positions Only (CSV)</div>
                        <div className="text-[10px] text-gray-400">Current holdings, costs, market prices & weights</div>
                      </div>
                    </button>

                    <button
                      onClick={handleDownloadOrdersCSV}
                      className="w-full text-left px-3 py-2.5 hover:bg-[#18181B] text-white flex items-start space-x-2.5 transition-colors cursor-pointer group"
                    >
                      <History className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-200">Order Audit History Only (CSV)</div>
                        <div className="text-[10px] text-gray-400">Full log of mock buys, sells, fills & timestamps</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-[#1F1F23]" />

                    <button
                      onClick={handleDownloadInstitutionalCSV}
                      className="w-full text-left px-3 py-2 hover:bg-[#18181B] text-white flex items-start space-x-2.5 transition-colors cursor-pointer group"
                    >
                      <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-slate-300">Institutional Benchmark Model (CSV)</div>
                        <div className="text-[10px] text-gray-400">Quant model with VaR 95% & Sharpe ratios</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Download Success Notice Banner */}
        {lastExportedNotice && (
          <div className="mt-3 bg-cyan-950/50 border border-cyan-500/40 rounded p-2.5 flex items-center justify-between text-xs font-mono text-cyan-200 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Exported CSV successfully: <strong className="text-white font-bold">{lastExportedNotice}</strong></span>
            </div>
            <span className="text-[10px] text-cyan-400 font-sans">Ready for Excel & Google Sheets</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIRTUAL PAPER TRADING PORTFOLIO TAB */}
      {/* ========================================================================= */}
      {activeTab === 'virtual' && (
        <div className="space-y-4">
          {/* Virtual Portfolio Vital Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
              <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">PURCHASING POWER</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                ${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-gray-600 block">Available Virtual Cash</span>
            </div>

            <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
              <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">INVESTED EQUITY</span>
              <span className="text-base font-bold text-cyan-400 mt-0.5 block">
                ${totalInvestedMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-gray-600 block">Mark-to-Market Value</span>
            </div>

            <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
              <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">UNREALIZED P/L</span>
              <span className={`text-base font-bold mt-0.5 block ${totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalUnrealizedPL >= 0 ? '+' : ''}${totalUnrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-gray-600 block">
                {totalUnrealizedPLPercent >= 0 ? '+' : ''}{totalUnrealizedPLPercent.toFixed(2)}% return
              </span>
            </div>

            <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded shadow-sm">
              <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider block">TOTAL TRADES</span>
              <span className="text-base font-bold text-white mt-0.5 block">{virtualOrders.length}</span>
              <span className="text-[9px] text-gray-600 block">Executed Orders</span>
            </div>
          </div>

          {/* Positions Table & Allocation Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Virtual Positions Table */}
            <div className="lg:col-span-8 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#1F1F23] pb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-300">
                    CURRENT VIRTUAL HOLDINGS ({positionsValuation.length})
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadPositionsCSV}
                    className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] px-2.5 py-1 rounded transition-colors cursor-pointer"
                    title="Export Virtual Positions CSV"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Positions CSV</span>
                  </button>

                  {onNavigateToTrading && (
                    <button
                      onClick={onNavigateToTrading}
                      className="text-[11px] font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-2.5 py-1 rounded transition-colors cursor-pointer"
                    >
                      + Trade
                    </button>
                  )}
                </div>
              </div>

              {positionsValuation.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Briefcase className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs font-mono text-gray-400">No active virtual positions held.</p>
                  <p className="text-[11px] text-gray-500">Place simulated orders in the Paper Trade tab to build your virtual portfolio.</p>
                  {onNavigateToTrading && (
                    <button
                      onClick={onNavigateToTrading}
                      className="mt-2 text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      Open Paper Trading Terminal
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#1F1F23] text-gray-500 uppercase text-[9px] tracking-wider">
                        <th className="py-2 px-3">SYMBOL</th>
                        <th className="py-2 px-3">AVG COST</th>
                        <th className="py-2 px-3">LIVE PRICE</th>
                        <th className="py-2 px-3">SHARES</th>
                        <th className="py-2 px-3">MARKET VALUE</th>
                        <th className="py-2 px-3">UNREALIZED P/L</th>
                        <th className="py-2 px-3">WEIGHT</th>
                        <th className="py-2 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F23]">
                      {positionsValuation.map((pos) => {
                        const isProfit = pos.unrealizedPL >= 0;
                        const isIndia = pos.currency === 'INR' || pos.region === 'INDIA';
                        const currSymbol = isIndia ? '₹' : '$';
                        const weight = totalNetLiquidity > 0 ? ((pos.marketValue / totalNetLiquidity) * 100).toFixed(1) : '0.0';

                        return (
                          <tr key={pos.symbol} className="hover:bg-[#18181B] transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-white text-xs">{pos.symbol}</div>
                              <div className="text-[10px] text-gray-500 font-sans truncate max-w-[120px]">{pos.name}</div>
                            </td>
                            <td className="py-2.5 px-3 text-gray-300">
                              {currSymbol}{pos.avgCost.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white">
                              {currSymbol}{pos.currentPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-gray-300 font-bold">{pos.shares}</td>
                            <td className="py-2.5 px-3 font-bold text-white">
                              {currSymbol}{pos.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`py-2.5 px-3 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              <span className="flex items-center">
                                {isProfit ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                {isProfit ? '+' : ''}{currSymbol}{pos.unrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isProfit ? '+' : ''}{pos.unrealizedPLPercent.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-cyan-400 font-bold">{weight}%</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  onSearchSymbol(pos.symbol);
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
              )}
            </div>

            {/* Virtual Allocation Chart */}
            <div className="lg:col-span-4 bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm flex flex-col justify-between space-y-3">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-[#1F1F23] pb-2">
                CAPITAL ALLOCATION BREAKDOWN
              </h3>

              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={virtualSectorData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {virtualSectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                      formatter={(val: number) => [`${val}%`, 'Allocation']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs font-mono max-h-[140px] overflow-y-auto pr-1">
                {virtualSectorData.map((s) => (
                  <div key={s.name} className="flex justify-between items-center text-gray-400">
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                      <span className="text-gray-300 text-[11px] truncate max-w-[130px]">{s.name}</span>
                    </span>
                    <span className="font-bold text-white">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Virtual Order History Audit Table */}
          <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#1F1F23] pb-2">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-300">
                  SIMULATED TRADE EXECUTION HISTORY ({virtualOrders.length})
                </h3>
              </div>

              <button
                onClick={handleDownloadOrdersCSV}
                className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] px-2.5 py-1 rounded transition-colors cursor-pointer"
                title="Export Order History CSV"
              >
                <Download className="w-3 h-3" />
                <span>Export Orders CSV</span>
              </button>
            </div>

            {virtualOrders.length === 0 ? (
              <div className="text-center py-6 text-xs font-mono text-gray-500">
                No orders executed yet in this simulation.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1F1F23] text-gray-500 uppercase text-[9px] tracking-wider">
                      <th className="py-2 px-3">ORDER ID</th>
                      <th className="py-2 px-3">TIMESTAMP</th>
                      <th className="py-2 px-3">SYMBOL</th>
                      <th className="py-2 px-3">ACTION</th>
                      <th className="py-2 px-3">TYPE</th>
                      <th className="py-2 px-3">QUANTITY</th>
                      <th className="py-2 px-3">FILL PRICE</th>
                      <th className="py-2 px-3">TOTAL VALUE</th>
                      <th className="py-2 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F23]">
                    {virtualOrders.map((ord) => {
                      const isBuy = ord.side === 'BUY';
                      const isINR = ord.currency === 'INR';
                      const symbolPrefix = isINR ? '₹' : '$';

                      return (
                        <tr key={ord.id} className="hover:bg-[#18181B] transition-colors">
                          <td className="py-2 px-3 text-gray-500 text-[10px]">{ord.id}</td>
                          <td className="py-2 px-3 text-gray-400 text-[11px]">{ord.timestamp}</td>
                          <td className="py-2 px-3 font-bold text-white">{ord.symbol}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBuy ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                            }`}>
                              {ord.side}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-400 text-[10px]">{ord.type}</td>
                          <td className="py-2 px-3 text-white font-bold">{ord.shares}</td>
                          <td className="py-2 px-3 text-gray-300">
                            {symbolPrefix}{ord.executionPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 font-bold text-white">
                            {symbolPrefix}{ord.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CSV Export & Audit Banner */}
          <div className="bg-[#121214] border border-cyan-900/40 rounded p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold font-mono text-white tracking-wide uppercase">
                  FINANCIAL AUDIT & SPREADSHEET EXPORT
                </h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
                Exports formatted, RFC-4180 standard CSV files compatible with Microsoft Excel, Apple Numbers, Google Sheets, Python/Pandas dataframes, and quantitative trading backtesters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadPositionsCSV}
                className="flex items-center space-x-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-gray-200 px-3 py-2 rounded text-xs font-mono transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Positions CSV</span>
              </button>

              <button
                onClick={handleDownloadOrdersCSV}
                className="flex items-center space-x-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-gray-200 px-3 py-2 rounded text-xs font-mono transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Order History CSV</span>
              </button>

              <button
                onClick={handleDownloadComprehensiveCSV}
                className="flex items-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3.5 py-2 rounded text-xs font-mono transition-colors cursor-pointer shadow-md shadow-cyan-500/10"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>Master Workbook CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTITUTIONAL BENCHMARK MODEL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'institutional' && (
        <div className="space-y-4">
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
              <div className="flex items-center justify-between border-b border-[#1F1F23] pb-2">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  CURRENT HOLDINGS & ALLOCATIONS
                </h3>

                <button
                  onClick={handleDownloadInstitutionalCSV}
                  className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Model CSV</span>
                </button>
              </div>

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
      )}
    </div>
  );
};
