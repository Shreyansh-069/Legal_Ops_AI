import React from 'react';
import { LogOut } from 'lucide-react';

const langLabels = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam'
};

export default function Navbar({ language, user, onLogout }) {
  const currentLanguageLabel = langLabels[language] || 'Not set';

  return (
    <header className="h-14 w-full bg-surface-raised border-b border-border-light flex items-center justify-between px-6 font-sans">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-brass rounded-full hidden sm:block"></div>
        <h1 className="font-serif text-sm font-semibold text-text tracking-wide">
          Legal Ops AI
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 bg-surface-muted border border-border-light rounded-md px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-text-faint">Lang</span>
          <span className="text-xs font-medium text-text-secondary">
            {currentLanguageLabel}
          </span>
        </div>

        {user && (
          <div className="hidden sm:flex items-center bg-surface-muted border border-border-light rounded-md px-3 py-1.5">
            <span className="text-xs text-text-muted truncate max-w-[160px]">
              {user.username}
            </span>
          </div>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-surface-muted border border-border-light rounded-md px-3 py-1.5 text-xs text-text-secondary hover:border-brass hover:text-text transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
