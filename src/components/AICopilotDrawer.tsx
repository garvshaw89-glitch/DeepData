import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Loader2, 
  Zap,
  HelpCircle
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const quickPrompts = [
    'Analyze AAPL Q4 earnings beat probability',
    'How will Fed rate cuts affect sovereign bond yields?',
    'Build a $50k conservative income portfolio',
    'Evaluate Tesla valuation vs EV peers',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-[#121214] border-l border-[#1F1F23] h-full flex flex-col justify-between shadow-2xl text-[#A1A1AA]">
        
        {/* Header */}
        <div className="p-3.5 border-b border-[#1F1F23] flex items-center justify-between bg-[#0F0F12]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#1F1F23] border border-[#27272A] rounded text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>DEEPDATA AI CO-PILOT</span>
                <span className="text-[9px] bg-[#1F1F23] text-cyan-400 px-1.5 py-0.5 rounded border border-[#27272A]">
                  GEMINI 3.6
                </span>
              </h3>
              <p className="text-[10px] text-gray-500 font-mono">INSTITUTIONAL CAPITAL RESEARCH</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1F1F23] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-500 text-black font-semibold rounded-br-none'
                      : 'bg-[#0F0F12] border border-[#1F1F23] text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

                  {/* Grounding Sources */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#1F1F23] text-[10px] font-mono space-y-1">
                      <span className="text-gray-500 uppercase font-bold block">GROUNDING SOURCES:</span>
                      {msg.groundingSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center space-x-1 truncate"
                        >
                          <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-600 mt-1 font-mono uppercase">{msg.timestamp}</span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-cyan-400 p-2 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing real-time market data...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips & Input Form */}
        <div className="p-3.5 border-t border-[#1F1F23] bg-[#0F0F12] space-y-2.5">
          <div className="flex flex-wrap gap-1">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(qp)}
                className="text-[10px] font-mono bg-[#18181B] hover:bg-[#27272A] text-gray-400 hover:text-cyan-400 px-2 py-1 rounded border border-[#27272A] transition-colors text-left cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Query DEEPDATA AI Analyst..."
              className="flex-1 bg-[#121214] text-white text-xs px-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black px-3 py-2 rounded font-bold cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
