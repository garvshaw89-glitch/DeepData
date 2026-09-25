import React, { useState, useMemo } from 'react';
import { AssetQuote, PaperOrder, PaperPosition } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Briefcase, 
  Percent, 
  ShieldCheck, 
  Sliders,
  History,
  Layers,
  Sparkles
} from 'lucide-react';

interface PaperTradingProps {
  selectedQuote: AssetQuote;
  quotes: AssetQuote[];
  onSelectQuote: (quote: AssetQuote) => void;
  virtualCash: number;
  positions: PaperPosition[];
  orderHistory: PaperOrder[];
  onPlaceOrder: (order: Omit<PaperOrder, 'id' | 'timestamp' | 'status'>) => { success: boolean; message: string };
  onResetPortfolio: () => void;
  onNavigateToAnalysis: () => void;
  onNavigateToPortfolio?: () => void;
}

export const PaperTrading: React.FC<PaperTradingProps> = ({
  selectedQuote,
  quotes,
  onSelectQuote,
  virtualCash,
  positions,
  orderHistory,
  onPlaceOrder,
  onResetPortfolio,
  onNavigateToAnalysis,
  onNavigateToPortfolio,
}) => {
  // Order Form State
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [sharesInput, setSharesInput] = useState<string>('10');
  const [limitPriceInput, setLimitPriceInput] = useState<string>(selectedQuote.price.toString());
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState<boolean>(false);

  // Synchronize limit price when selected quote changes
  React.useEffect(() => {
    setLimitPriceInput(selectedQuote.price.toString());
  }, [selectedQuote.symbol, selectedQuote.price]);

  const isIndianAsset = selectedQuote.currency === 'INR' || selectedQuote.region === 'INDIA';
  const currSym = isIndianAsset ? '₹' : '$';

  // Find user's currently held shares of selected stock
  const currentPosition = positions.find((p) => p.symbol === selectedQuote.symbol);
  const ownedShares = currentPosition ? currentPosition.shares : 0;

  const sharesNum = Math.max(0, parseInt(sharesInput, 10) || 0);
  const activePrice = orderType === 'LIMIT' ? (parseFloat(limitPriceInput) || selectedQuote.price) : selectedQuote.price;
  const estimatedTotalCost = sharesNum * activePrice;

  // Real-time mark-to-market calculations across all positions
  const quotePriceMap = useMemo(() => {
    const map = new Map<string, number>();
    quotes.forEach((q) => map.set(q.symbol, q.price));
    return map;
  }, [quotes]);

  // Compute total portfolio value in real-time
  const { totalInvestedValue, totalCurrentValue, totalUnrealizedPL, totalUnrealizedPLPercent } = useMemo(() => {
    let invested = 0;
    let current = 0;

    positions.forEach((pos) => {
      const currentPrice = quotePriceMap.get(pos.symbol) || pos.avgCost;
      const costBasis = pos.shares * pos.avgCost;
      const mtmValue = pos.shares * currentPrice;
      invested += costBasis;
      current += mtmValue;
    });

    const pl = current - invested;
    const plPct = invested > 0 ? (pl / invested) * 100 : 0;

    return {
      totalInvestedValue: current,
      totalCurrentValue: virtualCash + current,
      totalUnrealizedPL: pl,
      totalUnrealizedPLPercent: plPct,
    };
  }, [positions, virtualCash, quotePriceMap]);

  // Handle Max Shares calculation
  const handleSetMax = () => {
    if (orderSide === 'BUY') {
      if (activePrice <= 0) return;
      const maxAffordable = Math.floor(virtualCash / activePrice);
      setSharesInput(maxAffordable.toString());
    } else {
      setSharesInput(ownedShares.toString());
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (sharesNum <= 0) {
      setFeedbackMessage({ type: 'error', text: 'Please enter a valid quantity of shares (minimum 1).' });
      return;
    }

    if (orderSide === 'BUY' && estimatedTotalCost > virtualCash) {
      setFeedbackMessage({
        type: 'error',
        text: `Insufficient virtual cash. Required ${currSym}${estimatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}, but only ${currSym}${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2 })} available.`,
      });
      return;
    }

    if (orderSide === 'SELL' && sharesNum > ownedShares) {
      setFeedbackMessage({
        type: 'error',
        text: `Cannot sell ${sharesNum} shares. You currently own ${ownedShares} shares of ${selectedQuote.symbol}.`,
      });
      return;
    }

    const result = onPlaceOrder({
      symbol: selectedQuote.symbol,
      name: selectedQuote.name,
      type: orderType,
      side: orderSide,
      shares: sharesNum,
      orderPrice: activePrice,
      executionPrice: activePrice,
      totalCost: estimatedTotalCost,
      currency: selectedQuote.currency || (isIndianAsset ? 'INR' : 'USD'),
    });

    if (result.success) {
      setFeedbackMessage({ type: 'success', text: result.message });
      // Reset shares to a reasonable default after successful fill
      setSharesInput('10');
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 text-[#A1A1AA]">
      {/* Real-time Virtual Balance Header */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-light font-mono text-white tracking-tight uppercase">
                    INSTITUTIONAL PAPER TRADING TERMINAL
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-bold">
                    LIVE TICK SIMULATION
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-0.5 font-mono">
                  Test quantitative strategies with real-time mark-to-market valuations and instant liquidity simulation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToPortfolio && (
              <button
                onClick={onNavigateToPortfolio}
                className="bg-[#18181B] hover:bg-[#27272A] text-cyan-400 border border-cyan-800/40 hover:border-cyan-600 px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="View full portfolio analytics and download CSV reports"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Portfolio & Export CSV</span>
              </button>
            )}

            {isResetConfirming ? (
              <div className="flex items-center space-x-1.5 bg-[#18181B] border border-rose-800/60 p-1 rounded">
                <span className="text-[10px] text-rose-300 font-mono pl-1.5">Reset to $100k?</span>
                <button
                  onClick={() => {
                    onResetPortfolio();
                    setIsResetConfirming(false);
                    setFeedbackMessage({ type: 'success', text: 'Virtual portfolio reset to $100,000.00 cash balance.' });
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setIsResetConfirming(false)}
                  className="bg-[#27272A] hover:bg-[#3F3F46] text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirming(true)}
                className="bg-[#18181B] hover:bg-[#27272A] text-gray-300 border border-[#27272A] hover:border-gray-600 px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                <span>Reset Portfolio</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1F1F23]">
          <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              TOTAL PORTFOLIO NET WORTH
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
              Cash + Real-Time MTM Positions
            </span>
          </div>

          <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              AVAILABLE VIRTUAL CASH
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
              ${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
              Settled Purchasing Power
            </span>
          </div>

          <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              POSITIONS MARKET VALUE
            </span>
            <span className="text-xl font-bold font-mono text-gray-200 mt-1 block">
              ${totalInvestedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
              {positions.length} Active Position{positions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              UNREALIZED RETURN (P&L)
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              {totalUnrealizedPL >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className={`text-xl font-bold font-mono ${totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalUnrealizedPL >= 0 ? '+' : ''}${totalUnrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className={`text-[10px] font-mono mt-0.5 block ${totalUnrealizedPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalUnrealizedPL >= 0 ? '+' : ''}{totalUnrealizedPLPercent.toFixed(2)}% ROI
            </span>
          </div>
        </div>
      </div>

      {/* Main Trading Floor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Selected Stock Overview & Quick Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Stock Highlight Card */}
          <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold font-mono text-white">{selectedQuote.symbol}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F1F23] text-gray-300">
                    {selectedQuote.exchange}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F1F23] text-cyan-400">
                    {selectedQuote.region}
                  </span>
                </div>
                <h4 className="text-xs text-gray-400 mt-0.5">{selectedQuote.name}</h4>
              </div>

              <div className="text-right">
                <span className="text-xl font-mono font-bold text-white block">
                  {currSym}{selectedQuote.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-mono font-semibold flex items-center justify-end space-x-1 ${
                  selectedQuote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedQuote.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{selectedQuote.change >= 0 ? '+' : ''}{currSym}{selectedQuote.change.toFixed(2)} ({selectedQuote.changePercent >= 0 ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%)</span>
                </span>
              </div>
            </div>

            {/* Quick Position Ownership Badge */}
            <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Current Holding:</span>
              {ownedShares > 0 ? (
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{ownedShares} shares</span>
                  <span className="text-gray-500 text-[10px] ml-2">
                    (Valued at {currSym}{(ownedShares * selectedQuote.price).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">0 shares (No open position)</span>
              )}
            </div>

            {/* Key Telemetry Stats */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-2 border-t border-[#1F1F23]">
              <div>
                <span className="text-gray-500 block">52W HIGH</span>
                <span className="text-white font-semibold">{currSym}{selectedQuote.high52w.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">52W LOW</span>
                <span className="text-white font-semibold">{currSym}{selectedQuote.low52w.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">VOLUME</span>
                <span className="text-white font-semibold">{selectedQuote.volume}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onNavigateToAnalysis}
                className="w-full bg-[#18181B] hover:bg-[#27272A] text-cyan-400 border border-[#27272A] py-1.5 px-3 rounded text-xs font-mono font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Full AI Research for {selectedQuote.symbol}</span>
              </button>
            </div>
          </div>

          {/* Quick Asset Selector */}
          <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-3.5 shadow-sm space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span>SELECT ASSET TO TRADE</span>
            </h4>
            <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {quotes.map((q) => {
                const isSelected = q.symbol === selectedQuote.symbol;
                const isInd = q.currency === 'INR' || q.region === 'INDIA';
                const sym = isInd ? '₹' : '$';
                return (
                  <button
                    key={q.symbol}
                    onClick={() => onSelectQuote(q)}
                    className={`p-2 rounded text-left transition-all border font-mono cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                        : 'bg-[#0F0F12] border-[#1F1F23] text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{q.symbol}</span>
                      <span className={`text-[9px] ${q.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {sym}{q.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Placement Ticket (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
              <div>
                <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                  ORDER PLACEMENT TICKET
                </h3>
                <span className="text-[11px] font-mono text-gray-400">
                  Target Asset: <strong className="text-white">{selectedQuote.symbol}</strong> ({selectedQuote.name})
                </span>
              </div>

              {/* Order Type Selector */}
              <div className="flex items-center space-x-1 bg-[#0F0F12] p-1 rounded border border-[#1F1F23] font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    orderType === 'MARKET' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  MARKET
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    orderType === 'LIMIT' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  LIMIT
                </button>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Buy / Sell Action Switcher */}
              <div className="grid grid-cols-2 gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2.5 rounded font-bold text-xs uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                    orderSide === 'BUY'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                      : 'bg-[#0F0F12] border-[#1F1F23] text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>BUY / LONG {selectedQuote.symbol}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2.5 rounded font-bold text-xs uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                    orderSide === 'SELL'
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/40'
                      : 'bg-[#0F0F12] border-[#1F1F23] text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>SELL / SHORT {selectedQuote.symbol}</span>
                </button>
              </div>

              {/* Price Row (for LIMIT order) */}
              {orderType === 'LIMIT' ? (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <label className="text-gray-300">LIMIT PRICE ({currSym})</label>
                    <span className="text-gray-500 text-[11px]">Current Market: {currSym}{selectedQuote.price.toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={limitPriceInput}
                    onChange={(e) => setLimitPriceInput(e.target.value)}
                    className="w-full bg-[#0F0F12] text-white font-mono px-3.5 py-2.5 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-sm"
                  />
                </div>
              ) : (
                <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23] flex items-center justify-between font-mono text-xs">
                  <span className="text-gray-400">EXECUTION TYPE:</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">BEST MARKET EXECUTION</span>
                    <span className="text-gray-400 block text-[11px]">Instant Fill @ {currSym}{selectedQuote.price.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Shares Quantity Input with Quick Chips */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <label className="text-gray-300">QUANTITY (SHARES)</label>
                  <span className="text-gray-500 text-[11px]">
                    {orderSide === 'BUY' ? (
                      <>Available Cash: <strong className="text-cyan-400">${virtualCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></>
                    ) : (
                      <>You Own: <strong className="text-white">{ownedShares} Shares</strong></>
                    )}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={sharesInput}
                  onChange={(e) => setSharesInput(e.target.value)}
                  placeholder="Enter number of shares"
                  className="w-full bg-[#0F0F12] text-white font-mono px-3.5 py-2.5 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-sm"
                />

                {/* Quick Share Quantity Buttons */}
                <div className="flex items-center space-x-1.5 mt-2 font-mono text-[11px]">
                  {[5, 10, 25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSharesInput(qty.toString())}
                      className="bg-[#18181B] hover:bg-[#27272A] text-gray-300 border border-[#27272A] px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      +{qty}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSetMax}
                    className="bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-700/60 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ml-auto"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Order Cost Breakdown Box */}
              <div className="bg-[#0F0F12] p-3.5 rounded border border-[#1F1F23] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Unit Price:</span>
                  <span className="text-white">{currSym}{activePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shares:</span>
                  <span className="text-white">{sharesNum}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Simulated Commission:</span>
                  <span className="text-emerald-400 font-bold">$0.00 (Zero Fee)</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#1F1F23]">
                  <span className="text-gray-200">ESTIMATED {orderSide === 'BUY' ? 'DEBIT' : 'CREDIT'}:</span>
                  <span className="text-cyan-400 font-mono">
                    {currSym}{estimatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Error or Success Feedback Banner */}
              {feedbackMessage && (
                <div className={`p-3 rounded border text-xs font-mono flex items-center space-x-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}>
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              {/* Submit Execution Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-950/40'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40'
                }`}
              >
                EXECUTE PAPER {orderSide} ORDER ({selectedQuote.symbol})
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Virtual Portfolio Holdings Section */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F1F23]">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE PAPER POSITIONS ({positions.length})</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Live mark-to-market valuations refreshed as real-time tick streaming progresses.
            </p>
          </div>
        </div>

        {positions.length === 0 ? (
          <div className="bg-[#0F0F12] border border-dashed border-[#1F1F23] rounded-lg p-8 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs font-mono text-gray-400">
              No active paper trading positions. Place a buy order above to start building your simulated portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1F1F23] text-gray-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">ASSET</th>
                  <th className="py-2.5 px-3 text-right">SHARES</th>
                  <th className="py-2.5 px-3 text-right">AVG COST</th>
                  <th className="py-2.5 px-3 text-right">CURRENT PRICE</th>
                  <th className="py-2.5 px-3 text-right">MARKET VALUE</th>
                  <th className="py-2.5 px-3 text-right">UNREALIZED P&L</th>
                  <th className="py-2.5 px-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {positions.map((pos) => {
                  const currentPrice = quotePriceMap.get(pos.symbol) || pos.avgCost;
                  const marketVal = pos.shares * currentPrice;
                  const costBasis = pos.shares * pos.avgCost;
                  const pl = marketVal - costBasis;
                  const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
                  const isPositive = pl >= 0;
                  const sym = pos.currency === 'INR' ? '₹' : '$';

                  return (
                    <tr key={pos.symbol} className="hover:bg-[#18181B]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{pos.symbol}</span>
                          <span className="text-[10px] text-gray-400 font-sans truncate max-w-[140px] hidden sm:inline">
                            {pos.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-200 font-semibold">
                        {pos.shares.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-400">
                        {sym}{pos.avgCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-white font-bold">
                        {sym}{currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-cyan-400 font-bold">
                        {sym}{marketVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? '+' : ''}{sym}{pl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}{plPct.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => {
                              const match = quotes.find((q) => q.symbol === pos.symbol);
                              if (match) onSelectQuote(match);
                              setOrderSide('BUY');
                            }}
                            className="bg-[#18181B] hover:bg-[#27272A] text-emerald-400 px-2 py-0.5 rounded text-[10px] border border-[#27272A] cursor-pointer"
                          >
                            + Buy
                          </button>
                          <button
                            onClick={() => {
                              const match = quotes.find((q) => q.symbol === pos.symbol);
                              if (match) onSelectQuote(match);
                              setOrderSide('SELL');
                              setSharesInput(pos.shares.toString());
                            }}
                            className="bg-[#18181B] hover:bg-[#27272A] text-rose-400 px-2 py-0.5 rounded text-[10px] border border-[#27272A] cursor-pointer"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulated Order Execution Ledger */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>TRADE EXECUTION HISTORY ({orderHistory.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-gray-500">
            Real-time simulated clearing logs
          </span>
        </div>

        {orderHistory.length === 0 ? (
          <p className="text-xs font-mono text-gray-500 py-3 text-center">
            No executed trades logged yet. Place an order to see execution receipts.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1F1F23] text-gray-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">SIDE</th>
                  <th className="py-2 px-3">SYMBOL</th>
                  <th className="py-2 px-3 text-right">SHARES</th>
                  <th className="py-2 px-3 text-right">FILLED PRICE</th>
                  <th className="py-2 px-3 text-right">TOTAL AMOUNT</th>
                  <th className="py-2 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {orderHistory.map((ord) => {
                  const sym = ord.currency === 'INR' ? '₹' : '$';
                  return (
                    <tr key={ord.id} className="hover:bg-[#18181B]/40">
                      <td className="py-2 px-3 text-gray-400 text-[11px]">{ord.timestamp}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          ord.side === 'BUY'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-rose-950/60 text-rose-400 border-rose-800'
                        }`}>
                          {ord.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-white">{ord.symbol}</td>
                      <td className="py-2 px-3 text-right text-gray-200">{ord.shares}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{sym}{ord.executionPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-cyan-400 font-bold">{sym}{ord.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FILLED</span>
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
    </div>
  );
};
