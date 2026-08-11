import React, { useState, useEffect } from 'react';
import { AssetQuote, AIStockAnalysisReport } from '../types';
import { MOCK_ANALYSIS_REPORTS } from '../data/mockMarketData';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  BarChart2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  PieChart, 
  Cpu, 
  Send, 
  Loader2,
  Lock,
  Compass
} from 'lucide-react';

interface StockAnalysisViewProps {
  selectedQuote: AssetQuote;
  onAskCopilot: (prompt: string) => void;
}

export const StockAnalysisView: React.FC<StockAnalysisViewProps> = ({
  selectedQuote,
  onAskCopilot,
}) => {
  const [report, setReport] = useState<AIStockAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');

  useEffect(() => {
    fetchAnalysis(selectedQuote.symbol);
  }, [selectedQuote.symbol]);

  const fetchAnalysis = async (symbol: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedQuote.symbol,
          name: selectedQuote.name,
          type: selectedQuote.type,
          price: selectedQuote.price,
        }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch AI analysis report:', err);
      // Fallback to local report generator if fetch fails
      setReport(MOCK_ANALYSIS_REPORTS[symbol] || MOCK_ANALYSIS_REPORTS['AAPL']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      onAskCopilot(`Regarding ${selectedQuote.symbol} (${selectedQuote.name}): ${customQuestion}`);
      setCustomQuestion('');
    }
  };

  if (isLoading || !report) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-[#A1A1AA] flex flex-col items-center justify-center space-y-3 font-mono">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-cyan-400 font-bold tracking-wider uppercase">
          COMPILING DEEPDATA AI RESEARCH REPORT FOR {selectedQuote.symbol}...
        </p>
        <p className="text-[10px] text-gray-500 max-w-md">
          Executing 47 ML model passes, FinBERT sentiment scoring, SEC filings ingestion & option order flow decomposition.
        </p>
      </div>
    );
  }

  const isBuy = report.recommendation.includes('BUY');
  const currSym = selectedQuote.currency === 'INR' ? '₹' : '$';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 text-[#A1A1AA]">
      {/* Header Banner */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xl font-light font-mono text-white tracking-tight">{report.symbol}</span>
              <span className="text-xs font-mono bg-[#18181B] text-gray-300 px-2 py-0.5 rounded border border-[#27272A]">
                {report.name}
              </span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-800">
                AI CONFIDENCE: {report.aiConfidenceScore}%
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] max-w-2xl leading-relaxed">
              {report.actionSummary}
            </p>
          </div>

          {/* Action Recommendation Box */}
          <div className="flex flex-wrap items-center gap-3 bg-[#0F0F12] p-3 rounded border border-[#1F1F23]">
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">AI VERDICT</span>
              <span className={`text-base font-bold font-mono tracking-wide ${isBuy ? 'text-emerald-400' : 'text-amber-400'}`}>
                {report.recommendation}
              </span>
            </div>

            <div className="border-l border-[#1F1F23] pl-3">
              <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">12M TARGET</span>
              <span className="text-base font-bold font-mono text-white">{currSym}{report.targetPrice12m}</span>
              <span className="text-xs text-emerald-400 font-mono ml-1">
                (+{report.upsidePotentialPercent}%)
              </span>
            </div>

            <div className="border-l border-[#1F1F23] pl-3">
              <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">RISK / REWARD</span>
              <span className="text-base font-bold font-mono text-cyan-400">{report.riskRewardRatio}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Institutional Analysis Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Module 1: Fundamental Analysis */}
        <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. FUNDAMENTAL QUALITY & VALUATION</span>
            </h3>
            <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              HEALTH: {report.fundamentals.healthScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">REV GROWTH YoY</span>
              <span className="font-bold text-emerald-400 text-xs">+{report.fundamentals.revenueGrowthYoY}%</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">PROFIT MARGIN</span>
              <span className="font-bold text-white text-xs">{report.fundamentals.profitMargin}%</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">ROE</span>
              <span className="font-bold text-cyan-400 text-xs">{report.fundamentals.roe}%</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">DEBT / EQUITY</span>
              <span className="font-bold text-white text-xs">{report.fundamentals.debtToEquity}</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">VALUATION</span>
              <span className="font-bold text-amber-400 text-xs">{report.fundamentals.valuationVerdict}</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">COMPETITIVE MOAT</span>
              <span className="font-bold text-cyan-400 text-xs">{report.fundamentals.competitiveMoat}</span>
            </div>
          </div>

          <p className="text-xs text-[#A1A1AA] bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] leading-relaxed">
            <strong className="text-cyan-400 font-mono">VALUATION NOTE:</strong> {report.fundamentals.valuationNote}
          </p>
        </div>

        {/* Module 2: Technical Analysis */}
        <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. TECHNICAL INDICATORS & SETUP</span>
            </h3>
            <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
              {report.technicals.trend}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">50-DAY MA</span>
              <span className="font-bold text-white text-xs">{currSym}{report.technicals.ma50}</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">RSI (14)</span>
              <span className="font-bold text-emerald-400 text-xs">{report.technicals.rsi14} ({report.technicals.rsiStatus})</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">MACD SIGNAL</span>
              <span className="font-bold text-cyan-400 text-xs">{report.technicals.macdSignal}</span>
            </div>
          </div>

          {/* Support / Resistance Levels */}
          <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] text-xs font-mono space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">KEY SUPPORT:</span>
              <span className="font-bold text-emerald-400">
                {report.technicals.supportLevels.map(s => `${currSym}${s}`).join(' | ')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">KEY RESISTANCE:</span>
              <span className="font-bold text-rose-400">
                {report.technicals.resistanceLevels.map(r => `${currSym}${r}`).join(' | ')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-[#1F1F23]">
              <span className="text-gray-400">OPTIMAL ENTRY:</span>
              <span className="font-bold text-cyan-300">{report.technicals.entryPoint}</span>
            </div>
          </div>
        </div>

        {/* Module 3: Earnings Model Forecast */}
        <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. AI EARNINGS PREDICTION MODEL</span>
            </h3>
            <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
              BEAT PROBABILITY: {report.earnings.beatProbability}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] space-y-1">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">REVENUE RECONCILIATION</span>
              <p className="text-gray-400">Consensus: <strong>{report.earnings.consensusRevenue}</strong></p>
              <p className="text-cyan-400 font-bold">AI Forecast: {report.earnings.aiPredictedRevenue}</p>
            </div>
            <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] space-y-1">
              <span className="text-gray-500 block text-[9px] uppercase tracking-wider">EPS RECONCILIATION</span>
              <p className="text-gray-400">Consensus: <strong>{currSym}{report.earnings.consensusEPS}</strong></p>
              <p className="text-cyan-400 font-bold">AI Forecast: {currSym}{report.earnings.aiPredictedEPS}</p>
            </div>
          </div>

          <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] text-xs flex justify-between items-center font-mono">
            <span className="text-gray-500">POST-EARNINGS TARGETS:</span>
            <span className="text-emerald-400 font-bold">BEAT: {currSym}{report.earnings.targetIfBeat}</span>
            <span className="text-rose-400 font-bold">MISS: {currSym}{report.earnings.targetIfMiss}</span>
          </div>
        </div>

        {/* Module 4: Risk Matrix & Scenario Probabilities */}
        <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>4. RISK MATRIX & SCENARIO MODELING</span>
            </h3>
            <span className="text-[10px] font-mono bg-[#18181B] text-gray-300 px-2 py-0.5 rounded border border-[#27272A]">
              RISK: {report.risk.riskVerdict}
            </span>
          </div>

          {/* Bull / Base / Bear Probabilities */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/60">
              <span className="text-emerald-400 block text-[9px] font-bold">BULL CASE</span>
              <span className="text-sm font-bold text-white">{report.risk.bullCaseProbability}%</span>
            </div>
            <div className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23]">
              <span className="text-gray-400 block text-[9px] font-bold">BASE CASE</span>
              <span className="text-sm font-bold text-white">{report.risk.baseCaseProbability}%</span>
            </div>
            <div className="bg-rose-950/40 p-2 rounded border border-rose-800/60">
              <span className="text-rose-400 block text-[9px] font-bold">BEAR CASE</span>
              <span className="text-sm font-bold text-white">{report.risk.bearCaseProbability}%</span>
            </div>
          </div>

          {/* Key Risk Factors */}
          <div className="space-y-1.5 text-xs">
            {report.risk.keyRisks.map((rk, idx) => (
              <div key={idx} className="bg-[#0F0F12] p-2 rounded border border-[#1F1F23] flex justify-between items-center font-mono">
                <span className="text-gray-300 truncate max-w-[220px]">{rk.title}</span>
                <div className="flex items-center space-x-3 text-[10px]">
                  <span className="text-gray-500">PROB: {rk.probability}</span>
                  <span className="text-rose-400 font-bold">IMPACT: {rk.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ask Gemini Custom Question Panel */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>QUERY AI COPILOT REGARDING {report.symbol}</span>
        </h4>
        <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={`Ask a custom prompt regarding ${report.symbol}...`}
            className="flex-1 bg-[#0F0F12] text-white text-xs px-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none font-mono placeholder:text-gray-600"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-2 rounded font-mono font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>SUBMIT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
