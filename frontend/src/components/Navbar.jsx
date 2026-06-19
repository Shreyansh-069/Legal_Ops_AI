import React from 'react';
import { Cpu, Terminal, ShieldCheck } from 'lucide-react';

const langLabels = {
  en: 'ENGLISH (EN-US)',
  hi: 'HINDI (HI-IN)',
  ta: 'TAMIL (TA-IN)',
  te: 'TELUGU (TE-IN)',
  kn: 'KANNADA (KN-IN)',
  ml: 'MALAYALAM (ML-IN)'
};

export default function Navbar({ language }) {
  const currentLanguageLabel = langLabels[language] || 'UNCONFIGURED';

  return (
    <header className="h-16 w-full cyber-glass border-b border-electric-indigo/15 flex items-center justify-between px-6 z-20 font-sans">
      {/* Console details */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping relative">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        </div>
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-slate-400" />
          <h1 className="text-xs font-mono font-bold tracking-widest text-slate-300">
            SYSTEM ENGINE TERMINAL
          </h1>
        </div>
      </div>

      {/* Center metadata metrics - visible on larger screens */}
      <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5 border-r border-slate-800 pr-6">
          <Cpu size={12} className="text-slate-600" />
          <span>VECTODB SEARCH: <span className="text-slate-300">CHROMA</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-slate-600" />
          <span>CYBERNETIC FIREWALL: <span className="text-emerald-500">SECURE</span></span>
        </div>
      </div>

      {/* Language system stats & pulse */}
      <div className="flex items-center gap-4">
        {/* Selected language telemetry info */}
        <div className="flex items-center gap-2 bg-cyber-dark/60 border border-slate-800 rounded-lg px-3 py-1.5">
          <span className="text-[9px] font-mono text-slate-500 tracking-wider">LOC STREAM:</span>
          <span className="text-[10px] font-mono text-electric-indigo font-bold">
            {currentLanguageLabel}
          </span>
        </div>

        {/* Pulsating system light */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider">
            CORE ACTIVE
          </span>
        </div>
      </div>
    </header>
  );
}
