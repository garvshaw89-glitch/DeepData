import React, { useState } from 'react';
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
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  onSearchSymbol,
  onNavigateToAnalysis,
}) => {
  const [alerts, setAlerts] = useState<AlertTrigger[]>(MOCK_ALERTS);
  const [newSymbol, setNewSymbol] = useState('');
  const [newPriceTarget, setNewPriceTarget] = useState('');

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      const created: AlertTrigger = {
        id: `alt-${Date.now()}`,
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
      setAlerts([created, ...alerts]);
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
        {alerts.map((alt) => {
          const isCrit = alt.severity === 'CRITICAL';
          return (
            <div
              key={alt.id}
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
