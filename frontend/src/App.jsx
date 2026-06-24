import React, { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import AuthForm from './components/AuthForm';
import LandingPage from './components/LandingPage';
import Logo from './components/Logo';

const localizedWelcomes = {
  en: "Hello. I've set our conversation language to English. What legal questions or documents can I help you sort through today?",
  hi: "नमस्ते। मैंने बातचीत की भाषा हिंदी चुन ली है। आज मैं आपकी कानूनी समस्याओं या दस्तावेज़ों को समझने में क्या मदद कर सकता हूँ?",
  ta: "வணக்கம். நான் உரையாடல் மொழியை தமிழாக அமைத்துள்ளேன். இன்று உங்களுக்கு என்ன உதவிகள் தேவை?",
  te: "నమస్తే. నేను సంభాషణ భాషను తెలుగుగా మార్చాను. ఈరోజు నేను మీకు ఏ విధంగా సహాయం చేయగలలను?",
  kn: "ನಮಸ್ತೆ. ನಾನು ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
  ml: "നമസ്കാരം. ഞാൻ भाषा മലയാളത്തിലേക്ക് മാറ്റിയിരിക്കുന്നു. ഇന്ന് ഞാൻ നിങ്ങൾക്ക് എങ്ങനെയാണ് സഹായിക്കേണ്ടത്?"
};

export default function App() {
  const [view, setView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rawHistory, setRawHistory] = useState([]); // Keeps track of unique queries for the sidebar

  const loadChatHistory = async (activeLanguage) => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch("http://localhost:8000/api/history", {
        method: "GET",
        credentials: "include"
      });
      
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        const historicalData = await res.json();
        if (Array.isArray(historicalData) && historicalData.length > 0) {
          // Save raw array for sidebar mapping
          setRawHistory(historicalData);

          const formatted = historicalData.map((item, index) => [
            { id: `hist-q-${index}-${Date.now()}`, sender: 'user', text: item.query || "" },
            { id: `hist-a-${index}-${Date.now()}`, sender: 'ai', text: item.response || "" }
          ]).flat();
          setMessages(formatted);
          return;
        }
      }
      
      setRawHistory([]);
      const targetLang = activeLanguage || language || 'en';
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: localizedWelcomes[targetLang] || localizedWelcomes.en
        }
      ]);

    } catch (err) {
      console.error("Could not fetch user history stream", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory(language);
    }
  }, [isAuthenticated, language]);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to permanently clear your chat history?")) return;
    
    try {
      const res = await fetch("http://localhost:8000/api/history/clear", {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: localizedWelcomes[language || 'en'] || localizedWelcomes.en
          }
        ]);
        setRawHistory([]);
      } else {
        alert("Failed to wipe server-side logs.");
      }
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
  };

  const handleResetLanguage = () => {
    setLanguage(null);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setLanguage(null);
    setMessages([]);
    setRawHistory([]);
  };

  const handleSendMessage = async (textToSend, fileAttached) => {
    if (!textToSend && !fileAttached) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: fileAttached ? `[Document: ${fileAttached.name}] ${textToSend}` : textToSend
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let response;
      if (fileAttached) {
        const formDataPayload = new FormData();
        formDataPayload.append("query", textToSend);
        formDataPayload.append("language", language || "en");
        formDataPayload.append("file", fileAttached);

        response = await fetch("http://localhost:8000/api/chat/upload", {
          method: "POST",
          credentials: "include", 
          body: formDataPayload
        });
      } else {
        response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
          body: JSON.stringify({ query: textToSend, language: language || "en" })
        });
      }

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (response.ok) {
        await loadChatHistory(language); // Reload completely to align timeline data arrays
      } else {
        throw new Error('Pipeline exception thrown.');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: `sys-err-${Date.now()}`, sender: 'system', text: "Something went wrong sending your message." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'landing') {
    return <LandingPage onEnterWorkspace={() => setView('app')} />;
  }

  if (!isAuthenticated) return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  if (!language) return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;

  return (
    <div className="w-screen h-screen bg-[#f5f2eb] text-[#4a3728] font-sans flex overflow-hidden">
      <main className="flex-1 h-full flex flex-col justify-between p-6 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto flex flex-col justify-between h-full overflow-hidden bg-white border border-[#dcd6c5] rounded-lg p-6">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput input={input} setInput={setInput} onSubmit={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>

      {/* --- RIGHT SIDEBAR SHOWING LIVE HISTORY LOGS --- */}
      <aside className="w-80 h-full bg-[#faf9f6] border-l border-[#dcd6c5] p-6 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div>
            <Logo className="mb-4" />
            <h3 className="text-xs font-mono tracking-wider text-[#8a7c6e] uppercase font-bold">
              Your chats
            </h3>
          </div>
          
          {/* Scrollable Container mapping raw database history items */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 border-t border-[#dcd6c5] pt-4">
            {rawHistory.length === 0 ? (
              <p className="text-xs text-[#8a7c6e] italic mt-2">Your chat history is empty.</p>
            ) : (
              rawHistory.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#dcd6c5] rounded-lg hover:border-[#4a3728] transition-colors text-left group cursor-pointer">
                  <div className="text-xs font-semibold text-[#4a3728] truncate">
                    {item.query || "Document Upload"}
                  </div>
                  <div className="text-[10px] text-[#8a7c6e] truncate mt-1">
                    {item.response}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-[#dcd6c5] pt-4 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-[#8a7c6e] font-semibold mb-2">
            <span>LANGUAGE:</span>
            <span className="bg-[#f5f2eb] text-[#4a3728] px-2.5 py-0.5 rounded border border-[#dcd6c5] font-bold text-[10px]">
              {language.toUpperCase()}
            </span>
          </div>
          
          <button
            onClick={handleClearHistory}
            className="w-full py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-semibold font-mono tracking-wider transition-colors cursor-pointer text-center uppercase"
          >
            Clear history
          </button>
          <button
            onClick={handleResetLanguage}
            className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#faf9f6] border border-[#dcd6c5] text-[#4a3728] text-xs font-semibold font-mono tracking-wider transition-colors cursor-pointer text-center uppercase"
          >
            Change language
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#faf9f6] border border-[#dcd6c5] text-[#4a3728] text-xs font-semibold font-mono tracking-wider transition-colors cursor-pointer text-center uppercase"
          >
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}