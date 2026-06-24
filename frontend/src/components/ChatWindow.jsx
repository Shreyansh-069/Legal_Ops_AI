import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, AlertTriangle } from 'lucide-react';

function FormatMessageContent({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-text-secondary text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="font-serif text-text font-semibold text-base mt-3 mb-1 border-b border-border-light pb-1">
              {headerText}
            </h4>
          );
        }

        if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('** ')) {
          const content = trimmed.replace(/\*/g, '');
          return <p key={idx} className="font-medium text-text">{content}</p>;
        }

        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          let content = trimmed.substring(1).trim();
          const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)$/);
          if (boldMatch) {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-brass font-medium">{boldMatch[1]}</strong>
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

        if (/^\d+\./.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)$/);
          if (boldMatch) {
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-1">
                <li>
                  <strong className="text-brass font-medium">{boldMatch[1]}</strong>
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

        if (trimmed.includes('**')) {
          const parts = trimmed.split('**');
          return (
            <p key={idx}>
              {parts.map((part, pIdx) => {
                if (pIdx % 2 === 1) {
                  return <strong key={pIdx} className="text-text font-medium">{part}</strong>;
                }
                return part;
              })}
            </p>
          );
        }

        return trimmed ? <p key={idx}>{trimmed}</p> : <div key={idx} className="h-1.5" />;
      })}
    </div>
  );
}

const loadingSteps = [
  'Searching relevant statutes and case law...',
  'Reviewing retrieved sources...',
  'Drafting response...',
  'Finalising output...'
];

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-bg font-sans">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        const isSystem = msg.sender === 'system';

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-950/20 border border-red-800/30 text-xs text-red-400 max-w-lg">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{msg.text}</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center border shrink-0 ${
              isUser
                ? 'bg-accent border-accent text-white'
                : 'bg-surface-muted border-border-light text-brass'
            }`}>
              {isUser ? <User size={15} /> : <Bot size={15} />}
            </div>

            <div className="flex flex-col space-y-1">
              <span className={`text-[10px] uppercase tracking-wider text-text-faint ${isUser ? 'text-right' : 'text-left'}`}>
                {isUser ? 'Counsel request' : 'Legal Ops AI'}
              </span>
              <div className={`p-4 rounded-md ${
                isUser
                  ? 'bg-accent text-white rounded-tr-none'
                  : 'bg-surface-raised border border-border-light text-text-secondary rounded-tl-none'
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

      {isLoading && (
        <div className="flex gap-3 max-w-2xl mr-auto">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-muted border border-border-light text-brass shrink-0">
            <Bot size={15} />
          </div>

          <div className="flex flex-col space-y-1 flex-1">
            <span className="text-[10px] uppercase tracking-wider text-text-faint">
              Legal Ops AI
            </span>
            <div className="p-4 rounded-md rounded-tl-none bg-surface-raised border border-border-light">
              <p className="text-sm text-text-secondary mb-3">
                Researching your question...
              </p>
              <div className="space-y-2 text-xs text-text-muted">
                {loadingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${activeStep >= idx ? 'bg-brass' : 'bg-border-light'}`}></div>
                    <span className={activeStep === idx ? 'text-text-secondary' : ''}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
