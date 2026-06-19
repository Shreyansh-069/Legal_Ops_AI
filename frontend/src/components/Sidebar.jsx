import React from 'react';
import { Search, MessageSquare, RefreshCw, Landmark, FileText, Scale, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

const mockConsultations = [
  { id: '1', title: 'Karnataka Land Encroachment', date: '10m ago', category: 'property', icon: Landmark, preview: 'Section 67 Revenue Act dispute...' },
  { id: '2', title: 'NDA Intellectual Property Breach', date: '2h ago', category: 'corporate', icon: FileText, preview: 'Unlawful source disclosure findings...' },
  { id: '3', title: 'IT Employee Terminal Compensation', date: 'Yesterday', category: 'labor', icon: UserCheck, preview: 'Severance clause assessment under IT policy...' },
  { id: '4', title: 'E-Commerce Consumer Grievance', date: '3 days ago', category: 'consumer', icon: ShieldAlert, preview: 'Deficient service refund under Consumer Act...' },
  { id: '5', title: 'Apartment Bylaw Enforcement', date: '1 week ago', category: 'civil', icon: Scale, preview: 'RWA maintenance arbitration assessment...' }
];

export default function Sidebar({ searchQuery, setSearchQuery, onResetLanguage, onSelectMockQuery }) {
  // Filter mock consultations based on search query
  const filteredConsultations = mockConsultations.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 h-full bg-cyber-panel flex flex-col border-r border-electric-indigo/15 select-none font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-electric-indigo/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electric-indigo to-tech-purple flex items-center justify-center glow-indigo">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-widest bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LEGALOPS AI
            </h2>
            <span className="text-[10px] font-mono text-electric-indigo/80 block -mt-0.5">
              VERSION 4.0 // ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Search Area */}
      <div className="p-4 border-b border-electric-indigo/15">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-electric-indigo transition-colors" />
          <input
            type="text"
            placeholder="Search consultations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-dark border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-indigo/50 focus:ring-1 focus:ring-electric-indigo/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Recents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-[10px] font-mono text-slate-500 tracking-wider mb-2 uppercase px-2">
          Recent Audit Consultation Streams
        </div>
        
        {filteredConsultations.length > 0 ? (
          filteredConsultations.map((consult) => {
            const Icon = consult.icon;
            return (
              <button
                key={consult.id}
                onClick={() => onSelectMockQuery(consult.title)}
                className="w-full relative flex items-start gap-3 p-3.5 rounded-xl bg-cyber-dark/30 border border-slate-900/60 hover:border-electric-indigo/25 hover:bg-cyber-dark/60 text-left transition-all duration-300 group cursor-pointer"
              >
                {/* Visual left indicator glow line */}
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-electric-indigo to-tech-purple rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-electric-indigo group-hover:border-electric-indigo/20 transition-colors duration-300">
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-xs text-slate-300 group-hover:text-white transition-colors duration-300 truncate">
                      {consult.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 shrink-0">
                      {consult.date}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1 group-hover:text-slate-400 transition-colors">
                    {consult.preview}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-slate-600">
            No consultations match your query
          </div>
        )}
      </div>

      {/* Bottom Panel Actions */}
      <div className="p-4 border-t border-electric-indigo/15 bg-cyber-dark/20">
        <button
          onClick={onResetLanguage}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyber-dark border border-slate-800 hover:border-tech-purple/50 text-xs font-mono text-slate-400 hover:text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
        >
          <RefreshCw size={13} className="text-tech-purple animate-pulse" />
          <span>RESET LOCALIZATION LANGUAGE</span>
        </button>
      </div>
    </aside>
  );
}
