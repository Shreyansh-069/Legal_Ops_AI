import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, Home } from 'lucide-react';

const langLabels = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam'
};

export default function Navbar({ language, user, onLogout, onToggleSidebar }) {
  const currentLanguageLabel = langLabels[language] || 'Not set';

  return (
    <header className="h-14 w-full bg-surface-raised border-b border-border-light flex items-center justify-between px-6 font-sans">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-surface-muted border border-transparent hover:border-border-light text-text-secondary hover:text-text transition-colors cursor-pointer mr-1"
          aria-label="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>
        <div className="w-1 h-6 bg-brass rounded-full hidden sm:block"></div>
        <h1 className="font-serif text-sm font-semibold text-text tracking-wide">
          Legal Ops AI
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-surface-muted border border-border-light rounded-md px-3 py-1.5 text-xs text-text-secondary hover:border-brass hover:text-text transition-colors cursor-pointer"
        >
          <Home size={13} />
          <span className="hidden sm:inline">Home</span>
        </Link>
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
