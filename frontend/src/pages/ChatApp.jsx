import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import { useAuth } from '../context/AuthContext';
import * as chatApi from '../api/chat';
import { ApiError } from '../api/client';

const localizedWelcomes = {
  en: "Hi — I'm set to answer in English. Ask me anything about a legal situation and I'll do my best to help.",
  hi: "नमस्ते — मैं हिंदी में जवाब दूंगा। कोई भी कानूनी सवाल पूछिए, मैं जितना हो सके मदद करूंगा।",
  ta: "வணக்கம் — நான் தமிழில் பதிலளிக்க தயாராக இருக்கிறேன். உங்கள் சட்டக் கேள்வியைக் கேளுங்கள்.",
  te: "హలో — నేను తెలుగులో సమాధానం ఇస్తాను. మీ న్యాయ సంబంధిత ప్రశ్న అడగండి.",
  kn: "ನಮಸ್ಕಾರ — ನಾನು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತೇನೆ. ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.",
  ml: "ഹലോ — ഞാൻ മലയാളത്തിൽ ഉത്തരം നൽകും. നിങ്ങളുടെ നിയമപരമായ ചോദ്യം ചോദിക്കൂ."
};

function welcomeMessages(lang) {
  return [{
    id: 'welcome',
    sender: 'ai',
    text: localizedWelcomes[lang] || localizedWelcomes.en,
  }];
}

function mapApiMessages(messages) {
  return messages.map((msg) => ({
    id: msg.id,
    sender: msg.role === 'user' ? 'user' : 'ai',
    text: msg.content,
  }));
}

export default function ChatApp() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      if (err instanceof ApiError && err.status === 401) {
        await logout();
        navigate('/login', { replace: true });
      }
    } finally {
      setLoadingConversations(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    setConversationId(null);
    setMessages(welcomeMessages(lang));
  };

  const handleResetLanguage = () => {
    setLanguage(null);
    setMessages([]);
    setInput('');
    setConversationId(null);
  };

  const handleNewChat = () => {
    setConversationId(null);
    setInput('');
    if (language) {
      setMessages(welcomeMessages(language));
    }
  };

  const handleClearHistory = async () => {
    setClearingHistory(true);
    try {
      await chatApi.clearAllConversations();
      setConversations([]);
      setConversationId(null);
      if (language) {
        setMessages(welcomeMessages(language));
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `clear-err-${Date.now()}`,
          sender: 'system',
          text: err instanceof ApiError
            ? err.message
            : 'Could not clear history. Try again.',
        },
      ]);
    } finally {
      setClearingHistory(false);
    }
  };

  const handleSelectConversation = async (id) => {
    if (id === conversationId) return;

    setConversationId(id);
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatApi.getConversation(id);
      const mapped = mapApiMessages(data.messages);
      setMessages(mapped.length > 0 ? mapped : welcomeMessages(data.language || language));
      if (data.language) {
        setLanguage(data.language);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setMessages([{
        id: 'load-error',
        sender: 'system',
        text: 'Could not load this chat. Try again or start a new one.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await chatApi.sendMessage(textToSend, language, conversationId);
      setConversationId(data.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: data.message_id,
          sender: 'ai',
          text: data.response,
        },
      ]);

      await loadConversations();
    } catch (err) {
      console.error('Chat request failed:', err);

      if (err instanceof ApiError && err.status === 401) {
        await logout();
        navigate('/login', { replace: true });
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `system-err-${Date.now()}`,
          sender: 'system',
          text: err instanceof ApiError
            ? err.message
            : "Can't reach the server. Make sure the backend is running and MongoDB is up.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLanguage(null);
    setMessages([]);
    setConversationId(null);
    setConversations([]);
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-bg flex items-center justify-center font-sans">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!language) {
    return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
  }

  return (
    <div className="flex w-screen h-screen bg-bg overflow-hidden font-sans">
      <Sidebar
        conversations={conversations}
        activeConversationId={conversationId}
        loadingConversations={loadingConversations}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onResetLanguage={handleResetLanguage}
        onClearHistory={handleClearHistory}
        clearingHistory={clearingHistory}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar language={language} user={user} onLogout={handleLogout} />

        <ChatWindow messages={messages} isLoading={isLoading} />

        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
