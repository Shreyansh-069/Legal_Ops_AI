import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Scale, Sun, Moon, ArrowRight, X, Code2, Database, Sparkles, Cpu, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showAbout, setShowAbout] = useState(false);
  const [showMakers, setShowMakers] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex flex-col font-sans select-none overflow-y-auto">
      {/* Navigation Top Bar */}
      <header className="h-16 w-full bg-surface-raised/80 backdrop-blur-md border-b border-border-light flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center transition-all duration-300 hover:rotate-12">
            <Gavel size={16} className="text-brass" />
          </div>
          <span className="font-serif font-bold text-base tracking-wide text-text">
            LegalOpsAI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-surface-muted hover:bg-bg border border-border-light text-text-secondary hover:text-text transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'classic' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 bg-brass hover:opacity-90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all cursor-pointer shadow-sm hover:shadow"
          >
            {user ? 'Go to Console' : 'Sign In'}
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        {/* Large Decorative Logo */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brass/30 to-accent/30 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-24 h-24 rounded-full bg-surface-raised border-2 border-border flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105">
            <Gavel size={48} className="text-brass animate-pulse" />
          </div>
        </div>

        {/* Branding & Description */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
            Legal <span className="text-brass font-serif">Ops</span> AI
          </h1>
          <p className="text-lg md:text-xl font-medium text-text-secondary font-serif">
            Intelligent Legal Operations Assistant
          </p>
          <div className="w-16 h-1 bg-brass rounded-full mx-auto my-6"></div>
          <p className="text-sm md:text-base text-text-muted leading-relaxed max-w-xl mx-auto">
            A secure, localized artificial intelligence workspace designed to streamline case research, structure complex legal frameworks, and support queries in multiple regional languages.
          </p>
        </div>

        {/* Primary Interaction Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <button
            onClick={() => navigate('/chat')}
            className="flex-1 py-3 px-6 rounded-md bg-brass hover:opacity-90 text-white text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {user ? 'Open Workspace' : 'Get Started'}
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className="flex-1 py-3 px-6 rounded-md bg-surface-raised hover:bg-surface-muted border border-border text-text text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            See About
          </button>

          <button
            onClick={() => setShowMakers(true)}
            className="flex-1 py-3 px-6 rounded-md bg-surface-raised hover:bg-surface-muted border border-border text-text text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Developers
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border-light text-center text-xs text-text-faint transition-colors duration-300">
        <p>© {new Date().getFullYear()} LegalOpsAI. Built for optimized legal workspaces.</p>
      </footer>

      {/* "See About" (Framework) Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in">
          <div className="bg-surface-raised border border-border rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-light flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Gavel size={18} className="text-brass" />
                <h3 className="font-serif font-bold text-lg text-text">Structured Framework</h3>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="p-1 rounded-md hover:bg-surface-muted text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-text-secondary leading-relaxed">
                LegalOpsAI operates on a multi-tiered architecture that integrates local retrieval-augmented generation (RAG) with a secure database layer.
              </p>

              {/* Grid representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frontend */}
                <div className="p-4 rounded-lg bg-surface border border-border-light space-y-2">
                  <div className="flex items-center gap-2 text-brass">
                    <Code2 size={16} />
                    <h4 className="font-semibold text-xs uppercase tracking-wider">Frontend Interface</h4>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Built with React 19, Vite, and Tailwind CSS (v4). Responsive design optimized for reading legal text in dark/light modes.
                  </p>
                </div>

                {/* Backend API */}
                <div className="p-4 rounded-lg bg-surface border border-border-light space-y-2">
                  <div className="flex items-center gap-2 text-brass">
                    <Cpu size={16} />
                    <h4 className="font-semibold text-xs uppercase tracking-wider">FastAPI Backend</h4>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Asynchronous Python API server serving modular routers for secure authentication and chat pipelines.
                  </p>
                </div>

                {/* RAG Agent */}
                <div className="p-4 rounded-lg bg-surface border border-border-light space-y-2">
                  <div className="flex items-center gap-2 text-brass">
                    <Sparkles size={16} />
                    <h4 className="font-semibold text-xs uppercase tracking-wider">Cognitive Agents</h4>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Custom Legal Finder agent using a local Vector Database to look up statutory acts, sections, and case summaries.
                  </p>
                </div>

                {/* Database */}
                <div className="p-4 rounded-lg bg-surface border border-border-light space-y-2">
                  <div className="flex items-center gap-2 text-brass">
                    <Database size={16} />
                    <h4 className="font-semibold text-xs uppercase tracking-wider">Persistence Layer</h4>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    MongoDB stores user credentials securely, indexes conversations, and supports state preservation across sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-light flex justify-end bg-surface-muted/30">
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 rounded bg-brass text-white text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Know About the Makers" Modal */}
      {showMakers && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in">
          <div className="bg-surface-raised border border-border rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-light flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-brass" />
                <h3 className="font-serif font-bold text-lg text-text">Developers</h3>
              </div>
              <button
                onClick={() => setShowMakers(false)}
                className="p-1 rounded-md hover:bg-surface-muted text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                We are the who built LegalOpsAI to simplify complex legal procedures through intelligent agentic support.
              </p>

              {/* Creators grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Creator 1 */}
                <div className="p-5 rounded-lg bg-surface border border-border-light flex flex-col items-center text-center space-y-3">
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-text">Shreyansh Nechaniya</h4>
                    <p className="text-[10px] text-text-faint uppercase tracking-wider mt-0.5">Developer</p>
                  </div>
                  <div className="flex gap-4">
                    <a
                      href="https://www.linkedin.com/in/shreyansh-nechaniya-4b5771375/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-brass transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                    <a
                      href="https://github.com/Shreyansh-069"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-brass transition-colors duration-200"
                      aria-label="GitHub"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Creator 2 */}
                <div className="p-5 rounded-lg bg-surface border border-border-light flex flex-col items-center text-center space-y-3">
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-text">Ekansh Shandilya</h4>
                    <p className="text-[10px] text-text-faint uppercase tracking-wider mt-0.5">Developer</p>
                  </div>
                  <div className="flex gap-4">
                    <a
                      href="https://www.linkedin.com/in/ekansh-shandilya-971884348/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-brass transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                    <a
                      href="https://github.com/2101ekansh-lab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-brass transition-colors duration-200"
                      aria-label="GitHub"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>


            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-light flex justify-end bg-surface-muted/30">
              <button
                onClick={() => setShowMakers(false)}
                className="px-4 py-2 rounded bg-brass text-white text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
