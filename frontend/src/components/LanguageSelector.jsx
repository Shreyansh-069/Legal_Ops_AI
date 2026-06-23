import React from 'react';
import { Scale } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', native: 'English', desc: 'Default language' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', desc: 'हिंदी में जवाब' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', desc: 'தமிழில் பதில்கள்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', desc: 'తెలుగులో సమాధానాలు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', desc: 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಗಳು' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', desc: 'മലയാളത്തിൽ ഉത്തരങ്ങൾ' }
];

export default function LanguageSelector({ onSelectLanguage }) {
  return (
    <div className="w-full h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-surface-raised border border-border-light rounded-lg p-8 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center">
            <Scale size={20} className="text-brass-muted" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-text tracking-wide">
              Legal Ops AI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-text-faint mt-0.5">
              Language preference
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          Choose the language for your consultations. You can change this later from the sidebar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className="flex flex-col items-start p-4 rounded-md bg-surface border border-border-light hover:border-brass text-left transition-colors cursor-pointer"
            >
              <div className="flex justify-between w-full items-center mb-1">
                <span className="font-medium text-text text-sm">
                  {lang.label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-muted border border-border-light text-text-muted uppercase tracking-wider">
                  {lang.code}
                </span>
              </div>
              <span className="text-xs text-brass font-medium mb-1">
                {lang.native}
              </span>
              <span className="text-xs text-text-muted">
                {lang.desc}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-[10px] text-text-faint uppercase tracking-wide">
          For reference only. Consult a qualified attorney before acting on any information.
        </p>
      </div>
    </div>
  );
}
