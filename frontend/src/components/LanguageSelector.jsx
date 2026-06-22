import React from 'react';

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
      <div className="w-full max-w-lg bg-surface border border-border-light rounded-xl p-8 md:p-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-text mb-2">
          Legal Ops AI
        </h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          This tool helps you look up legal questions .
          Pick the language you want to use , you can change it later.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className="flex flex-col items-start p-4 rounded-lg bg-surface-muted border border-border-light hover:border-accent hover:bg-accent-subtle text-left transition-colors cursor-pointer"
            >
              <div className="flex justify-between w-full items-center mb-1">
                <span className="font-medium text-text text-sm">
                  {lang.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border-light text-text-muted">
                  {lang.code.toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-accent-dark font-medium mb-1">
                {lang.native}
              </span>
              <span className="text-xs text-text-muted">
                {lang.desc}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-text-faint">
          Answers are for reference only. Talk to a lawyer before making any legal decisions.
        </p>
      </div>
    </div>
  );
}
