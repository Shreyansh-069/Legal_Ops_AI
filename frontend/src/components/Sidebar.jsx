import React from 'react';

export default function Sidebar({ onResetLanguage }) {
  return (
    <aside className="w-64 h-full bg-surface-sidebar flex flex-col border-r border-border-light select-none font-sans">
      <div className="p-5 border-b border-border-light bg-surface-raised">
        <h2 className="font-semibold text-sm text-text">
          Legal Ops AI
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Legal question lookup
        </p>
      </div>

      <div className="flex-1 p-5">
        <p className="text-sm text-text-secondary leading-relaxed">
          Ask a question about a legal situation — property disputes, contracts,
          employment, consumer rights, and similar topics. I'll search for relevant
          information and explain it in plain language.
        </p>
        <p className="text-xs text-text-muted mt-4 leading-relaxed">
          This isn't legal advice. For anything serious, talk to a qualified lawyer.
        </p>
      </div>

      <div className="p-4 border-t border-border-light bg-surface-muted">
        <button
          onClick={onResetLanguage}
          className="w-full py-2.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:border-accent hover:text-accent-dark transition-colors cursor-pointer"
        >
          Change language
        </button>
      </div>
    </aside>
  );
}
