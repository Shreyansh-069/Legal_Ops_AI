import React from 'react';
import { Globe, Shield, Activity } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', native: 'English', desc: 'System default query execution' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', desc: 'हिंदी अनुवाद तथा विश्लेषण' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', desc: 'தமிழ் மொழிபெயர்ப்பு மற்றும் பகுப்பாய்வு' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', desc: 'తెలుగు అనువాదం మరియు విశ్లేషణ' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', desc: 'ಕನ್ನಡ ಅನುವಾದ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', desc: 'മലയാള വിവർത്തനവും വിശകലനവും' }
];

export default function LanguageSelector({ onSelectLanguage }) {
  return (
    <div className="relative w-full h-screen bg-cyber-dark flex items-center justify-center overflow-hidden font-sans">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-electric-indigo/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-tech-purple/10 blur-[120px] pointer-events-none animate-pulse"></div>
      
      {/* Futuristic Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Central Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-2xl px-6 py-12 md:p-12 mx-4 cyber-glass rounded-2xl glow-indigo border border-electric-indigo/20 flex flex-col items-center text-center">
        {/* Core Engine status top display */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-indigo/10 border border-electric-indigo/30 text-xs font-mono text-electric-indigo tracking-wider mb-8 animate-pulse">
          <Activity size={12} className="text-electric-indigo animate-spin" />
          <span>CORE INTERCONNECT SYSTEM INITIALIZED</span>
        </div>

        {/* Brand & Heading */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-indigo to-tech-purple mb-6 glow-purple">
          <Globe size={32} className="text-white animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">
          LEGALOPS <span className="bg-gradient-to-r from-electric-indigo to-tech-purple bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-md mb-10 leading-relaxed">
          Access local legal counsel and real-time Tavily search validation nodes. Please configure your localization stream to continue.
        </p>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className="group relative flex flex-col items-start p-5 rounded-xl bg-cyber-panel/50 border border-slate-800 hover:border-electric-indigo/50 text-left transition-all duration-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] cursor-pointer overflow-hidden"
            >
              {/* Button gradient hover reveal */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-indigo/0 to-tech-purple/0 group-hover:from-electric-indigo/5 group-hover:to-tech-purple/5 transition-all duration-500"></div>
              
              <div className="flex justify-between w-full items-center mb-1">
                <span className="font-bold text-white text-base group-hover:text-electric-indigo transition-colors duration-300">
                  {lang.label}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-electric-indigo/20 group-hover:text-electric-indigo transition-colors duration-300">
                  {lang.code.toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-tech-purple font-medium mb-2 opacity-90">
                {lang.native}
              </span>
              <span className="text-xs text-slate-500 leading-normal line-clamp-1">
                {lang.desc}
              </span>
            </button>
          ))}
        </div>
        
        {/* Footnote */}
        <div className="flex items-center gap-1.5 mt-8 text-xs text-slate-500 font-mono">
          <Shield size={12} className="text-slate-500" />
          <span>SECURE END-TO-END CRYPTOGRAPHIC PIPELINE</span>
        </div>
      </div>
    </div>
  );
}
