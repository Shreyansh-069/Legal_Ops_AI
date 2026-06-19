import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

const promptTemplates = [
  "Encroachment on ancestral land in Karnataka",
  "Breach of NDA by freelance designer",
  "Employer delayed final settlement payment",
  "Product refund refusal by e-commerce app"
];

export default function ChatInput({ input, setInput, onSubmit, isLoading }) {
  const textareaRef = useRef(null);

  // Auto-resize input textarea to fit text length height
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
    <div className="p-4 md:p-6 border-t border-electric-indigo/15 bg-cyber-panel/40 backdrop-blur-md font-sans">
      
      {/* Suggestions template list */}
      <div className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-3.5">
        {promptTemplates.map((template, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => setInput(template)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-cyber-dark/60 border border-slate-800 text-slate-400 hover:border-electric-indigo/30 hover:text-electric-indigo hover:bg-cyber-dark transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {template}
          </button>
        ))}
      </div>

      {/* Main input form block */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
        <div className="flex-1 relative bg-cyber-dark/80 rounded-2xl border border-slate-800 focus-within:border-electric-indigo/40 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={isLoading ? "Please wait for core agent completion..." : "State your legal grievance or upload a consultation request here..."}
            className="w-full bg-transparent border-0 resize-none py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-0 max-h-40 min-h-[46px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ overflowY: 'auto' }}
          />
          {isLoading && (
            <div className="absolute right-4 bottom-3 text-slate-500">
              <div className="w-5 h-5 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Sleek Primary gradient Analyze Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-[46px] px-6 rounded-2xl bg-gradient-to-r from-electric-indigo to-tech-purple text-white text-xs font-mono font-bold tracking-wider hover:opacity-95 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 glow-indigo"
        >
          {isLoading ? (
            <>
              <span>PROCESSING</span>
              <Sparkles size={14} className="animate-spin text-white" />
            </>
          ) : (
            <>
              <span>ANALYZE CASE</span>
              <Send size={14} className="text-white" />
            </>
          )}
        </button>
      </form>
      
      {/* Disclaimer details */}
      <div className="max-w-4xl mx-auto flex items-center gap-1.5 mt-2.5 px-1 text-[10px] text-slate-600 font-mono">
        <AlertCircle size={10} className="shrink-0" />
        <span>NOTICE: LegalOps AI outputs are synthesized references. Confirm critical litigation with qualified legal practitioners.</span>
      </div>
    </div>
  );
}
