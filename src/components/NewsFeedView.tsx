import React, { useState } from 'react';
import { MarketNewsItem, MarketRegion } from '../types';
import { MOCK_NEWS } from '../data/mockMarketData';
import { 
  Newspaper, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Zap,
  Globe,
  Building2
} from 'lucide-react';

interface NewsFeedViewProps {
  onSearchSymbol: (symbol: string) => void;
  onNavigateToAnalysis: () => void;
}

export const NewsFeedView: React.FC<NewsFeedViewProps> = ({
  onSearchSymbol,
  onNavigateToAnalysis,
}) => {
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');

  const filteredNews = MOCK_NEWS.filter((n) => {
    if (regionFilter !== 'ALL' && n.region !== regionFilter) return false;
    if (sourceFilter !== 'ALL' && !n.source.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    if (sentimentFilter !== 'ALL' && n.sentiment !== sentimentFilter) return false;
    return true;
  });

  const newsSourcesList = [
    { id: 'ALL', label: 'All Media Sources' },
    { id: 'Moneycontrol', label: 'Moneycontrol' },
    { id: 'Economic Times', label: 'Economic Times' },
    { id: 'LiveMint', label: 'LiveMint' },
    { id: 'Financial Express', label: 'Financial Express' },
    { id: 'Bloomberg', label: 'Bloomberg' },
    { id: 'Reuters', label: 'Reuters' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 text-[#A1A1AA]">
      {/* Header Banner */}
      <div className="bg-[#121214] border border-[#1F1F23] rounded p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-light font-mono text-white tracking-tight uppercase">REAL-TIME INDIAN & WORLDWIDE CAPITAL MARKET NEWS</h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Aggregating live news streams from <strong className="text-white">Moneycontrol</strong>, <strong className="text-white">Economic Times</strong>, <strong className="text-white">LiveMint</strong>, <strong className="text-white">Bloomberg</strong>, and <strong className="text-white">Reuters</strong> processed through DEEPDATA FinBERT NLP models.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0F0F12] p-2 rounded border border-[#1F1F23] text-xs font-mono">
            <span className="text-gray-500 uppercase">STREAM SYNC:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LIVE 100% VERIFIED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Region & Source Filter Controls */}
      <div className="bg-[#121214] border border-[#1F1F23] p-3 rounded space-y-3 font-mono text-xs">
        
        {/* Region Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F23] pb-2.5">
          <div className="flex items-center space-x-2 text-gray-400">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-wider font-bold text-white">MARKET REGION:</span>
          </div>

          <div className="flex space-x-1.5">
            {[
              { id: 'ALL', label: 'ALL GLOBAL MARKETS' },
              { id: 'INDIA', label: '🇮🇳 INDIAN MARKETS' },
              { id: 'GLOBAL', label: '🌐 WORLDWIDE MARKETS' },
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => setRegionFilter(reg.id)}
                className={`text-[10px] px-3 py-1 rounded transition-colors cursor-pointer font-bold ${
                  regionFilter === reg.id
                    ? 'bg-cyan-500 text-black'
                    : 'text-gray-400 hover:text-white bg-[#1F1F23]'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source & Sentiment Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          {/* Source Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider shrink-0">NEWS OUTLET:</span>
            {newsSourcesList.map((src) => (
              <button
                key={src.id}
                onClick={() => setSourceFilter(src.id)}
                className={`text-[10px] px-2.5 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  sourceFilter === src.id
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-[#09090B] border-[#1F1F23] text-gray-400 hover:text-gray-200'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>

          {/* Sentiment Buttons */}
          <div className="flex items-center space-x-1 shrink-0">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider mr-1">SENTIMENT:</span>
            {['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'].map((st) => (
              <button
                key={st}
                onClick={() => setSentimentFilter(st)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  sentimentFilter === st
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white bg-[#1F1F23]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* News Cards List */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="bg-[#121214] border border-[#1F1F23] rounded p-8 text-center text-gray-500 font-mono text-xs">
            No news headlines found matching selected region or news outlet filters.
          </div>
        ) : (
          filteredNews.map((item) => {
            const isBull = item.sentiment === 'BULLISH';
            const isBear = item.sentiment === 'BEARISH';
            return (
              <div
                key={item.id}
                className="bg-[#121214] border border-[#1F1F23] hover:border-[#27272A] rounded p-4 shadow-sm transition-all space-y-2.5"
              >
                {/* News Header Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-400 text-xs bg-[#09090B] px-2 py-0.5 rounded border border-[#1F1F23]">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase bg-[#1F1F23] px-1.5 py-0.2 rounded font-bold">
                      {item.region === 'INDIA' ? '🇮🇳 INDIA' : '🌐 WORLDWIDE'}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 text-[11px]">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      isBull ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : isBear ? 'bg-rose-950/60 text-rose-400 border-rose-800' : 'bg-[#1F1F23] text-gray-300 border-[#27272A]'
                    }`}>
                      {item.sentiment}
                    </span>
                    <span className="text-[9px] bg-[#0F0F12] text-gray-400 px-2 py-0.5 rounded border border-[#1F1F23]">
                      CREDIBILITY: {item.credibilityScore}%
                    </span>
                  </div>
                </div>

                {/* Headline & Summary */}
                <h3 className="text-sm font-semibold text-white tracking-tight hover:text-cyan-300 transition-colors">
                  {item.headline}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {item.summary}
                </p>

                {/* Affected Tickers & Sectors */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                  <span className="text-gray-500 text-[10px] uppercase tracking-wider">AFFECTED TICKERS:</span>
                  {item.affectedStocks.map((stk) => (
                    <button
                      key={stk}
                      onClick={() => {
                        onSearchSymbol(stk);
                        onNavigateToAnalysis();
                      }}
                      className="bg-[#18181B] hover:bg-[#27272A] text-cyan-400 px-1.5 py-0.5 rounded border border-[#27272A] text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {stk}
                    </button>
                  ))}
                </div>

                {/* AI Impact & Action Recommendation Box */}
                <div className="bg-[#0F0F12] p-3 rounded border border-[#1F1F23] space-y-1 text-xs font-mono">
                  <p className="text-gray-300">
                    <strong className="text-cyan-400">DEEPDATA NLP IMPACT:</strong> {item.aiImpactAnalysis}
                  </p>
                  <p className="text-emerald-400 font-bold">
                    <strong>RECOMMENDED ACTION:</strong> {item.recommendedAction}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

