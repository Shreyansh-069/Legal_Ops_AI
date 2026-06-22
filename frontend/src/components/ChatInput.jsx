import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ input, setInput, onSubmit, isLoading }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 md:p-5 border-t border-border-light bg-surface-raised font-sans">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2 items-end">
        <div className="flex-1 relative bg-surface rounded-lg border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-muted transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={isLoading ? "Waiting for a response..." : "Type your legal question here..."}
            className="w-full bg-transparent border-0 resize-none py-3 pl-4 pr-12 text-sm text-text placeholder-text-faint focus:outline-none focus:ring-0 max-h-40 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ overflowY: 'auto' }}
          />
          {isLoading && (
            <div className="absolute right-4 bottom-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-[44px] px-5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span>Sending...</span>
          ) : (
            <>
              <span>Send</span>
              <Send size={14} />
            </>
          )}
        </button>
      </form>

      <p className="max-w-4xl mx-auto mt-2.5 px-1 text-[11px] text-text-faint">
        These answers are for general reference. Check anything important with a qualified lawyer.
      </p>
    </div>
  );
}
