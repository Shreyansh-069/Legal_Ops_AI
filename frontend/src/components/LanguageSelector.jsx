import React from 'react';

const languages = [
  { code: 'en', label: 'English', subLabel: 'English', note: 'Standard chat' },
  { code: 'hi', label: 'Hindi', subLabel: 'हिन्दी', note: 'Hindi translation' },
  { code: 'ta', label: 'Tamil', subLabel: 'தமிழ்', note: 'Tamil translation' },
  { code: 'te', label: 'Telugu', subLabel: 'తెలుగు', note: 'Telugu translation' },
  { code: 'kn', label: 'Kannada', subLabel: 'ಕನ್ನಡ', note: 'Kannada translation' },
  { code: 'ml', label: 'Malayalam', subLabel: 'മലയാളം', note: 'Malayalam translation' }
];

export default function LanguageSelector({ onSelectLanguage }) {
  return (
    <div className="w-screen h-screen bg-[#f5f2eb] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-[#dcd6c5] rounded-lg p-8">
        
        {/* Header Block */}
        <div className="text-center max-w-md mx-auto mb-8 space-y-2">
          <span className="inline-block text-[11px] font-mono tracking-wider text-[#8a7c6e] uppercase">
            Language Settings
          </span>
          <h1 className="text-2xl font-bold text-[#4a3728]">
            Select your language
          </h1>
          <p className="text-xs text-[#8a7c6e] leading-relaxed">
            Please choose the language you prefer for this session. We will translate all legal guidelines and summaries into this language.
          </p>
        </div>

        {/* Language Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className="group text-left p-5 rounded-lg bg-[#faf9f6] border border-[#dcd6c5] hover:border-[#4a3728] hover:bg-white transition-all duration-200 cursor-pointer flex flex-col justify-between h-28"
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <span className="text-sm font-bold text-[#4a3728] block">
                    {lang.label}
                  </span>
                  <span className="text-xs text-[#8a7c6e] block mt-0.5 font-medium">
                    {lang.subLabel}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#4a3728] border border-[#dcd6c5] bg-[#f5f2eb] px-2 py-0.5 rounded font-bold uppercase">
                  {lang.code}
                </span>
              </div>
              
              <span className="text-[10px] text-[#8a7c6e] mt-2 line-clamp-1 italic font-medium">
                {lang.note}
              </span>
            </button>
          ))}
        </div>

        {/* Bottom Status Note */}
        <div className="mt-8 border-t border-[#f5f2eb] pt-4 text-center">
          <span className="text-[10px] font-mono text-[#8a7c6e] tracking-wider uppercase font-semibold">
            Your preferences will be saved for the duration of this chat session
          </span>
        </div>

      </div>
    </div>
  );
}