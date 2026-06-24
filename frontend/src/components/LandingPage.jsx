import React, { useState } from 'react';
import Logo from './Logo';

export default function LandingPage({ onEnterWorkspace }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'developers'

  return (
    <div className="w-screen h-screen bg-[#f5f2eb] text-[#4a3728] font-sans flex flex-col overflow-y-auto">
      
      {/* Navbar Container */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between shrink-0">
        <Logo onClick={() => setActiveTab('home')} className="cursor-pointer" />
        
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#4a3728]' : 'text-[#8a7c6e] hover:text-[#4a3728]'
            }`}
          >
            Home
          </button>
          
          <button
            onClick={() => setActiveTab('developers')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'developers' ? 'text-[#4a3728]' : 'text-[#8a7c6e] hover:text-[#4a3728]'
            }`}
          >
            Developers
          </button>

          <button
            onClick={onEnterWorkspace}
            className="bg-[#4a3728] hover:bg-[#604a39] text-white px-4 py-2 text-xs font-semibold font-mono tracking-wider uppercase rounded transition-colors cursor-pointer"
          >
            Enter Workspace
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      {activeTab === 'home' ? (
        <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
          <div className="space-y-4">
            <span className="inline-block text-[11px] font-mono tracking-wider text-[#8a7c6e] uppercase">
              Advisory Operations Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#4a3728] max-w-2xl mx-auto leading-tight">
              Simple legal analysis and recommendations.
            </h1>
            <p className="text-sm text-[#8a7c6e] max-w-md mx-auto leading-relaxed font-medium">
              Upload files, reference Indian laws, and plan your next steps. A direct, clear tool designed for legal operators.
            </p>
          </div>

          <div>
            <button
              onClick={onEnterWorkspace}
              className="bg-[#4a3728] hover:bg-[#604a39] text-white px-6 py-3 font-bold rounded-lg transition-colors text-sm cursor-pointer"
            >
              Open Workspace
            </button>
          </div>

          {/* Core Feature Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-white border border-[#dcd6c5] p-6 rounded-lg text-left space-y-2">
              <h3 className="text-xs font-mono font-bold text-[#8a7c6e] uppercase">
                1. Constitutional Rights
              </h3>
              <p className="text-xs text-[#4a3728] leading-relaxed">
                Find out which fundamental protections under the Constitution apply to your query, mapped to specific article numbers.
              </p>
            </div>

            <div className="bg-white border border-[#dcd6c5] p-6 rounded-lg text-left space-y-2">
              <h3 className="text-xs font-mono font-bold text-[#8a7c6e] uppercase">
                2. Statutory Compliance
              </h3>
              <p className="text-xs text-[#4a3728] leading-relaxed">
                Examine the statutory clauses or penal sections (IPC/BNS) you need to comply with for specific cases.
              </p>
            </div>

            <div className="bg-white border border-[#dcd6c5] p-6 rounded-lg text-left space-y-2">
              <h3 className="text-xs font-mono font-bold text-[#8a7c6e] uppercase">
                3. Recommended Strategy
              </h3>
              <p className="text-xs text-[#4a3728] leading-relaxed">
                Get an actionable list of next steps, including notice drafting suggestions and filing timelines.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto px-6 py-12 text-center space-y-8">
          <div className="space-y-3">
            <span className="inline-block text-[11px] font-mono tracking-wider text-[#8a7c6e] uppercase">
              Developer Overview
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#4a3728]">
              Developers
            </h1>
            <p className="text-xs text-[#8a7c6e] leading-relaxed max-w-sm mx-auto font-medium">
              We are working to simplify legal guidelines and procedures for operators in India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto w-full pt-4">
            {/* Founder 1 Card */}
            <div className="bg-white border border-[#dcd6c5] p-6 rounded-lg space-y-4 text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#4a3728]">
                  Ekansh Shandilya
                </h3>
                <p className="text-[10px] font-mono text-[#8a7c6e] uppercase tracking-wide">
                  Developer
                </p>
              </div>
              <div className="flex justify-center gap-5 pt-2">
                <a
                  href="https://www.linkedin.com/in/ekansh-shandilya-971884348/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="text-[#4a3728] hover:text-[#8a7c6e] transition-colors"
                >
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/2101ekansh-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="text-[#4a3728] hover:text-[#8a7c6e] transition-colors"
                >
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Founder 2 Card */}
            <div className="bg-white border border-[#dcd6c5] p-6 rounded-lg space-y-4 text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#4a3728]">
                  Shreyansh Nechaniya
                </h3>
                <p className="text-[10px] font-mono text-[#8a7c6e] uppercase tracking-wide">
                  Developer
                </p>
              </div>
              <div className="flex justify-center gap-5 pt-2">
                <a
                  href="https://www.linkedin.com/in/shreyansh-nechaniya-4b5771375/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="text-[#4a3728] hover:text-[#8a7c6e] transition-colors"
                >
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/Shreyansh-069"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="text-[#4a3728] hover:text-[#8a7c6e] transition-colors"
                >
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer Container */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-[#dcd6c5]/60 text-center shrink-0">
        <span className="text-[10px] font-mono text-[#8a7c6e] tracking-wider uppercase font-semibold">
          Copyright © 2026 legal.ops. All rights reserved. Professional advisory tools.
        </span>
      </footer>

    </div>
  );
}
