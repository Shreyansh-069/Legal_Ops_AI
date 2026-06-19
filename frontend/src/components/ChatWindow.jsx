import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, HelpCircle, Search, Compass, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

// A simple text formatter to convert markdown-like syntax into clean React elements
function FormatMessageContent({ text }) {
  if (!text) return null;
  
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-slate-200 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Handle headers/sections starting with ### or ## or #
        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="text-white font-bold text-base mt-4 mb-2 tracking-wide border-b border-electric-indigo/20 pb-1 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-gradient-to-b from-electric-indigo to-tech-purple rounded-full"></span>
              {headerText}
            </h4>
          );
        }
        
        // Handle bold phrases within a line
        // E.g., **Text**
        if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('** ')) {
          const content = trimmed.replace(/\*/g, '');
          return <p key={idx} className="font-semibold text-slate-300">{content}</p>;
        }
        
        // Handle bullet points
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          let content = trimmed.substring(1).trim();
          // Check for sub-bold parts like **Title:** Text
          const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)$/);
          if (boldMatch) {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-electric-indigo font-bold">{boldMatch[1]}</strong>
                  <span>{boldMatch[2]}</span>
                </li>
              </ul>
            );
          }
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              <li>{content}</li>
            </ul>
          );
        }

        // Handle numbered lists
        if (/^\d+\./.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)$/);
          if (boldMatch) {
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-1">
                <li>
                  <strong className="text-tech-purple font-bold">{boldMatch[1]}</strong>
                  <span>{boldMatch[2]}</span>
                </li>
              </ol>
            );
          }
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1">
              <li>{content}</li>
            </ol>
          );
        }

        // Handle lines with standard bold text inline
        if (trimmed.includes('**')) {
          const parts = trimmed.split('**');
          return (
            <p key={idx}>
              {parts.map((part, pIdx) => {
                if (pIdx % 2 === 1) {
                  return <strong key={pIdx} className="text-white font-semibold">{part}</strong>;
                }
                return part;
              })}
            </p>
          );
        }
        
        // Return plain paragraph if nothing else matches
        return trimmed ? <p key={idx}>{trimmed}</p> : <div key={idx} className="h-1.5" />;
      })}
    </div>
  );
}

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom of chats on new message additions or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Loading Steps simulator for the agent validation node notification
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-cyber-dark to-cyber-dark/95 relative font-sans">
      {/* Absolute faint cyber backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        const isSystem = msg.sender === 'system';

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-4 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/30 border border-red-500/20 text-xs text-red-300 max-w-lg">
                <AlertTriangle size={14} className="text-red-400 animate-pulse shrink-0" />
                <span>{msg.text}</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'} animate-fade-in`}
          >
            {/* Avatar block */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
              isUser
                ? 'bg-gradient-to-tr from-electric-indigo to-tech-purple border-electric-indigo/30 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'bg-cyber-panel border-electric-indigo/20 text-electric-indigo'
            }`}>
              {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble wrapper */}
            <div className="flex flex-col space-y-1">
              <span className={`text-[10px] font-mono text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                {isUser ? 'AUTHORIZED CLIENT' : 'LEGALOPS AI AGENT CORE'}
              </span>
              <div className={`p-4 md:p-5 rounded-2xl ${
                isUser
                  ? 'bg-gradient-to-br from-electric-indigo/90 to-tech-purple/90 text-white rounded-tr-none border border-electric-indigo/20 shadow-[0_4px_16px_rgba(99,102,241,0.15)]'
                  : 'cyber-glass rounded-tl-none border border-electric-indigo/15 text-slate-200'
              }`}>
                {isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <FormatMessageContent text={msg.text} />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Multi-Agent Loading State */}
      {isLoading && (
        <div className="flex gap-4 max-w-2xl mr-auto animate-pulse">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyber-panel border border-electric-indigo/20 text-electric-indigo shrink-0">
            <Bot size={16} className="animate-spin" />
          </div>

          <div className="flex flex-col space-y-1 flex-1">
            <span className="text-[10px] font-mono text-slate-500">
              ORCHESTRATOR NODE LOGS
            </span>
            <div className="p-5 rounded-2xl rounded-tl-none cyber-glass border border-electric-indigo/15 space-y-4">
              
              {/* Mandatory explicit Tavily notification bar */}
              <div className="flex items-center gap-3 bg-electric-indigo/10 border border-electric-indigo/20 p-3 rounded-lg text-xs text-electric-indigo">
                <Search size={14} className="animate-bounce shrink-0" />
                <span className="font-medium">
                  Agent nodes running Tavily API search validation checks...
                </span>
              </div>

              {/* Simulated active agent sub-pipelines */}
              <div className="space-y-2.5 font-mono text-[11px] border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeStep >= 0 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                  <span className={activeStep === 0 ? 'text-white' : 'text-slate-500'}>
                    [1/4] Spawning Tavily crawler to retrieve federal case laws...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeStep >= 1 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                  <span className={activeStep === 1 ? 'text-white' : 'text-slate-500'}>
                    [2/4] Parsing constitutional indices for jurisdictional precedents...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeStep >= 2 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                  <span className={activeStep === 2 ? 'text-white' : 'text-slate-500'}>
                    [3/4] Synthesizing localized output text formatting streams...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeStep >= 3 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                  <span className={activeStep === 3 ? 'text-white' : 'text-slate-500'}>
                    [4/4] Aligning translation matrices with target region encoding...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll target node */}
      <div ref={bottomRef} />
    </div>
  );
}
