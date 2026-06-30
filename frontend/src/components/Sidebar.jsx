import React, { useState } from 'react';
import { MessageSquarePlus, Trash2, Sun, Moon, Scale, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Sidebar({
  conversations,
  activeConversationId,
  loadingConversations,
  onSelectConversation,
  onNewChat,
  onResetLanguage,
  onClearHistory,
  clearingHistory,
  onClose,
}) {
  const { theme, toggleTheme } = useTheme();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearClick = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearHistory();
    setConfirmClear(false);
  };

  return (
    <aside className="w-72 h-full bg-surface-sidebar flex flex-col border-r border-sidebar-border select-none font-sans">
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-sidebar-active border border-sidebar-border flex items-center justify-center">
            <Scale size={16} className="text-brass-muted" />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-sm text-sidebar-text tracking-wide">
              Legal Ops AI
            </h2>
            <p className="text-[10px] text-sidebar-text-muted uppercase tracking-widest mt-0.5">
              Case research
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md text-sidebar-text-muted hover:text-sidebar-text hover:bg-sidebar-hover transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="p-3 border-b border-sidebar-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-brass text-white text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
        >
          <MessageSquarePlus size={14} />
          New consultation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 sidebar-scroll">
        <p className="text-[10px] text-sidebar-text-muted uppercase tracking-widest px-2 mb-2">
          Past consultations
        </p>

        {loadingConversations ? (
          <p className="text-xs text-sidebar-text-muted px-2 py-4">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-sidebar-text-muted px-2 py-4 leading-relaxed">
            No saved consultations yet.
          </p>
        ) : (
          conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectConversation(chat.id)}
              className={`w-full text-left p-3 rounded-md border transition-colors cursor-pointer ${
                activeConversationId === chat.id
                  ? 'bg-sidebar-active border-brass/40 text-sidebar-text'
                  : 'bg-transparent border-transparent text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
              }`}
            >
              <p className="text-xs font-medium truncate">{chat.title}</p>
              <p className="text-[10px] text-sidebar-text-muted mt-0.5 opacity-80">
                {formatDate(chat.updated_at)}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-sidebar-hover border border-sidebar-border text-xs text-sidebar-text-muted hover:text-sidebar-text transition-colors cursor-pointer"
        >
          {theme === 'classic' ? <Moon size={13} /> : <Sun size={13} />}
          {theme === 'classic' ? 'Dark chambers' : 'Classic parchment'}
        </button>

        <button
          onClick={onResetLanguage}
          className="w-full py-2 rounded-md bg-transparent border border-sidebar-border text-xs text-sidebar-text-muted hover:text-sidebar-text hover:border-brass/40 transition-colors cursor-pointer"
        >
          Change language
        </button>

        {conversations.length > 0 && (
          <button
            onClick={handleClearClick}
            onBlur={() => setTimeout(() => setConfirmClear(false), 150)}
            disabled={clearingHistory}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-md border text-xs transition-colors cursor-pointer disabled:opacity-50 ${
              confirmClear
                ? 'bg-red-900/40 border-red-700/50 text-red-300'
                : 'bg-transparent border-sidebar-border text-sidebar-text-muted hover:text-red-300 hover:border-red-800/40'
            }`}
          >
            <Trash2 size={13} />
            {clearingHistory
              ? 'Clearing...'
              : confirmClear
                ? 'Confirm clear all'
                : 'Clear history'}
          </button>
        )}

        <p className="text-[10px] text-sidebar-text-muted leading-relaxed px-1 pt-1">
          For reference only. Consult a qualified attorney for legal advice.
        </p>
      </div>
    </aside>
  );
}
