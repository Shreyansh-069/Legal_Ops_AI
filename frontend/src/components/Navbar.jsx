import React from 'react';

const langLabels = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam'
};

export default function Navbar({ language }) {
  const currentLanguageLabel = langLabels[language] || 'Not set';

  return (
    <header className="h-14 w-full bg-surface border-b border-border-light flex items-center justify-between px-6 font-sans">
      <h1 className="text-sm font-semibold text-text">
        Legal Ops AI
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-muted border border-border-light rounded-md px-3 py-1.5">
          <span className="text-xs text-text-muted">Language:</span>
          <span className="text-xs font-medium text-text-secondary">
            {currentLanguageLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-accent-subtle border border-accent-muted rounded-md px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-light"></div>
          <span className="text-xs font-medium text-accent-dark">
            Connected
          </span>
        </div>
      </div>
    </header>
  );
}
