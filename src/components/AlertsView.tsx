import React, { useState, useMemo } from 'react';
import { AlertTrigger } from '../types';
import { MOCK_ALERTS } from '../data/mockMarketData';
import { 
  ShieldAlert, 
  Bell, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sliders, 
  Mail, 
  Smartphone, 
  Send 
} from 'lucide-react';

interface AlertsViewProps {
  onSearchSymbol: (symbol: string) => void;
  onNavigateToAnalysis: () => void;
  alerts?: AlertTrigger[];
  onAddAlert?: (alert: AlertTrigger) => void;
  onMarkAllAsRead?: () => void;
  volatilityThreshold?: number;
  onUpdateVolatilityThreshold?: (threshold: number) => void;
  onSimulateVolatilitySpike?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  onSearchSymbol,
  onNavigateToAnalysis,
  alerts: externalAlerts,
  onAddAlert,
  onMarkAllAsRead,
  volatilityThreshold = 2.0,
  onUpdateVolatilityThreshold,
  onSimulateVolatilitySpike,
}) => {
  const [internalAlerts, setInternalAlerts] = useState<AlertTrigger[]>(() => [...MOCK_ALERTS]);
  const rawAlerts = externalAlerts ?? internalAlerts;

  // Deduplicate alerts by unique id
  const alerts = useMemo(() => {
    const seen = new Set<string>();
    return rawAlerts.filter((alt) => {
      if (!alt.id || seen.has(alt.id)) return false;
      seen.add(alt.id);
      return true;
    });
  }, [rawAlerts]);

  const [newSymbol, setNewSymbol] = useState('');
  const [newPriceTarget, setNewPriceTarget] = useState('');

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const created: AlertTrigger = {
        id: `alt-${Date.now()}-${randomSuffix}`,
        symbol: newSymbol.trim().toUpperCase(),
        title: 'CUSTOM PRICE TARGET ALERT',
        type: 'PRICE_BREAKOUT',
        severity: 'HIGH',
        timestamp: 'Just now',
        message: `Alert configured for ${newSymbol.toUpperCase()} target $${newPriceTarget || '200.00'}. AI monitoring order flow 24/7.`,
        currentPrice: Number(newPriceTarget) || 200,
        recommendation: 'Monitor breakout level on high volume.',
        isRead: false,
      };
      if (onAddAlert) {
        onAddAlert(created);
      } else {
        setInternalAlerts((prev) => [created, ...prev]);
      }
      setNewSymbol('');
      setNewPriceTarget('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 text-[#A1A1AA]">
      {/* Header Banner */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-light font-mono text-white tracking-tight uppercase">AI INTELLIGENT ALERT & SIGNAL CENTER</h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Real-time pattern recognition, volume anomaly detection, Federal Reserve policy shifts, and custom price breakout triggers.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0F0F12] p-2 rounded border border-[#1F1F23] text-xs font-mono">
            <span className="text-gray-500 uppercase">STATUS:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>ACTIVE ORDER FLOW WATCH</span>
            </span>
          </div>
        </div>
      </div>

      {/* Automated Sparkline Volatility Monitor Control Panel */}
      <div className="bg-[#121214] border border-cyan-900/40 rounded p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  AUTOMATED SPARKLINE VOLATILITY MONITOR
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                  MONITORING LIVE QUOTES
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                Engine continuously calculates % deviation of live tick prices against sparkline historical baselines and dispatches alerts via MOCK_ALERTS.
              </p>
            </div>
          </div>

          {onSimulateVolatilitySpike && (
            <button
              onClick={onSimulateVolatilitySpike}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs px-3 py-1.5 rounded font-mono font-bold cursor-pointer transition-colors flex items-center space-x-1.5 shrink-0 self-start sm:self-center"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Simulate Volatility Spike</span>
            </button>
          )}
        </div>

        {onUpdateVolatilityThreshold && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1F1F23] font-mono text-xs">
            <span className="text-gray-400 text-[11px] flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-gray-500" />
              <span>TRIGGER THRESHOLD:</span>
            </span>
            {[1.0, 1.5, 2.0, 3.0, 5.0].map((val) => (
              <button
                key={val}
                onClick={() => onUpdateVolatilityThreshold(val)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  volatilityThreshold === val
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#18181B] text-gray-300 hover:bg-[#27272A] border border-[#27272A]'
                }`}
              >
                ±{val.toFixed(1)}%
              </button>
            ))}
            <span className="text-gray-500 text-[10px] ml-auto">
              Current Setting: <strong className="text-cyan-400">±{volatilityThreshold.toFixed(1)}%</strong> vs Sparkline Baseline
            </span>
          </div>
        )}
      </div>

      {/* Configure New Alert Form */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-3.5 shadow-sm space-y-2.5">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>SET UP AI TRIGGER RULE</span>
        </h3>

        <form onSubmit={handleAddAlert} className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="ASSET SYMBOL (e.g. AAPL, TSLA)"
            className="bg-[#0F0F12] text-white text-xs px-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none uppercase"
          />
          <input
            type="number"
            value={newPriceTarget}
            onChange={(e) => setNewPriceTarget(e.target.value)}
            placeholder="TARGET PRICE LEVEL"
            className="bg-[#0F0F12] text-white text-xs px-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs px-3 py-2 rounded font-bold cursor-pointer transition-colors"
          >
            CREATE AI TRIGGER
          </button>
        </form>
      </div>

      {/* Alert Triggers List */}
      <div className="space-y-3">
        {alerts.map((alt, idx) => {
          const isCrit = alt.severity === 'CRITICAL';
          return (
            <div
              key={alt.id || `alert-${alt.symbol}-${idx}`}
              className={`bg-[#121214] border rounded p-4 shadow-sm transition-all space-y-2 ${
                isCrit ? 'border-rose-900/80' : 'border-[#1F1F23]'
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-sm text-white">{alt.symbol}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    isCrit ? 'bg-rose-950/60 text-rose-400 border-rose-800' : 'bg-amber-950/60 text-amber-400 border-amber-800'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="text-xs font-semibold text-gray-200">{alt.title}</span>
                </div>
                <span className="text-[11px] text-gray-500">{alt.timestamp}</span>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {alt.message}
              </p>

              <div className="bg-[#0F0F12] p-2.5 rounded border border-[#1F1F23] text-xs font-mono flex justify-between items-center">
                <span className="text-emerald-400">
                  <strong className="text-white">AI ACTION:</strong> {alt.recommendation}
                </span>
                {alt.symbol !== 'FED' && (
                  <button
                    onClick={() => {
                      onSearchSymbol(alt.symbol);
                      onNavigateToAnalysis();
                    }}
                    className="bg-[#18181B] hover:bg-[#27272A] text-cyan-400 border border-[#27272A] px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                  >
                    INSPECT
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
