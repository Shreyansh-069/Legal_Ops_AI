import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="w-full min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-surface-raised border border-border-light rounded-lg p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
            <Scale size={18} className="text-brass-muted" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-faint">Legal Ops AI</p>
            <h1 className="font-serif text-xl font-semibold text-text tracking-wide">{title}</h1>
          </div>
        </div>
        {subtitle && (
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">{subtitle}</p>
        )}
        {children}
        {footer && (
          <div className="mt-6 text-sm text-text-muted text-center">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="text-brass hover:text-accent-dark font-medium">
      {children}
    </Link>
  );
}
