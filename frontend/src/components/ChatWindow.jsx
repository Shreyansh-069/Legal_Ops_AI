import React, { useEffect, useRef } from 'react';

function FormatMessageContent({ text }) {
  if (!text) return null;
  
  const lines = text.split('\n');
  return (
    <div className="space-y-3 text-[#4a3728] text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Render headings starting with '#'
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="text-[#4a3728] font-bold text-xs tracking-wider mt-4 mb-1.5 uppercase font-sans border-b border-[#dcd6c5] pb-1">
              {headerText}
            </h4>
          );
        }
        
        // Render bullet points starting with '-' or '*'
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          let content = trimmed.substring(1).trim().replace(/\*\*/g, '');
          return (
            <ul key={idx} className="list-disc pl-5 space-y-0.5 text-[#4a3728]">
              <li>{content}</li>
            </ul>
          );
        }

        // Render main index numbers (e.g. 1. Constitutional Rights, etc.)
        if (/^\d+\./.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\./);
          const startNum = match ? parseInt(match[1], 10) : 1;
          const content = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
          return (
            <div key={idx} className="text-[#4a3728] font-bold text-xs tracking-wide uppercase mt-4 mb-2 border-l-2 border-[#4a3728] pl-3 py-1 bg-[#f5f2eb]">
              {startNum}. {content}
            </div>
          );
        }

        // Render bold markers
        if (trimmed.includes('**')) {
          const parts = trimmed.split('**');
          return (
            <p key={idx}>
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? (
                <strong key={pIdx} className="text-[#35251a] font-bold">{part}</strong>
              ) : part)}
            </p>
          );
        }
        
        return trimmed ? (
          <p key={idx} className="text-[#4a3728]">{trimmed}</p>
        ) : (
          <div key={idx} className="h-1" />
        );
      })}
    </div>
  );
}

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 bg-transparent">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        const isSystem = msg.sender === 'system';

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-3">
              <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-850 max-w-md">
                Error: {msg.text}
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id} className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
            <span className={`text-[9px] font-mono uppercase tracking-wider mb-1 ${isUser ? 'text-[#8a7c6e]' : 'text-[#8a7c6e]'}`}>
              {isUser ? 'You' : 'Assistant'}
            </span>
            <div className={`p-4 rounded-lg text-sm transition-all ${
              isUser 
                ? 'bg-[#4a3728] text-white rounded-tr-none' 
                : 'bg-[#faf9f6] border border-[#dcd6c5] text-[#4a3728] rounded-tl-none'
            }`}>
              {isUser ? (
                <p className="whitespace-pre-wrap text-white font-medium">{msg.text}</p>
              ) : (
                <FormatMessageContent text={msg.text} />
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex flex-col max-w-[85%] mr-auto items-start">
          <span className="text-[9px] font-mono text-[#8a7c6e] uppercase tracking-wider mb-1">
            Assistant
          </span>
          <div className="p-4 rounded-lg bg-[#faf9f6] border border-[#dcd6c5] text-[#8a7c6e] text-xs font-mono tracking-wide rounded-tl-none">
            Analyzing sources and thinking...
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}