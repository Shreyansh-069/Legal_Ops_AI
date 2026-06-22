import React, { useState } from 'react';
import LanguageSelector from './components/LanguageSelector';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const localizedWelcomes = {
  en: "Hi — I'm set to answer in English. Ask me anything about a legal situation and I'll do my best to help.",
  hi: "नमस्ते — मैं हिंदी में जवाब दूंगा। कोई भी कानूनी सवाल पूछिए, मैं जितना हो सके मदद करूंगा।",
  ta: "வணக்கம் — நான் தமிழில் பதிலளிக்க தயாராக இருக்கிறேன். உங்கள் சட்டக் கேள்வியைக் கேளுங்கள்.",
  te: "హలో — నేను తెలుగులో సమాధానం ఇస్తాను. మీ న్యాయ సంబంధిత ప్రశ్న అడగండి.",
  kn: "ನಮಸ್ಕಾರ — ನಾನು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತೇನೆ. ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.",
  ml: "ഹലോ — ഞാൻ മലയാളത്തിൽ ഉത്തരം നൽകും. നിങ്ങളുടെ നിയമപരമായ ചോദ്യം ചോദിക്കൂ."
};

export default function App() {
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Triggers when language selection is confirmed on the landing dashboard card
  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: localizedWelcomes[lang] || localizedWelcomes.en
      }
    ]);
  };

  // Change or reset current configured language session
  const handleResetLanguage = () => {
    setLanguage(null);
    setMessages([]);
    setInput('');
  };

  // Main Async payload fetch process
  const handleSendMessage = async (textToSend) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let responseText = '';
      
      // Step 1: Hit http://localhost:8000/api/chat as specified
      try {
        const primaryRes = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: textToSend,
            language: language
          })
        });

        if (primaryRes.ok) {
          const data = await primaryRes.json();
          responseText = data.response || data.text || JSON.stringify(data);
        } else {
          throw new Error(`Primary endpoint returned code: ${primaryRes.status}`);
        }
      } catch (primaryError) {
        console.warn("Primary endpoint /api/chat failed. Retrying with backend integration fallback /api/query-legal-ops...", primaryError);
        
        // Step 2: Fallback to the actual running backend endpoint in main.py
        const fallbackRes = await fetch("http://localhost:8000/api/query-legal-ops", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: textToSend
          })
        });

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          responseText = data.response;
        } else {
          throw new Error(`Fallback endpoint returned code: ${fallbackRes.status}`);
        }
      }

      // Append successful agent response
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: responseText
        }
      ]);

    } catch (err) {
      console.error("LegalOps Engine Fetch Process Interrupted:", err);
      
      // Friendly fallback alert for connection errors
      setMessages(prev => [
        ...prev,
        {
          id: `system-err-${Date.now()}`,
          sender: 'system',
          text: "Can't reach the server. Make sure the backend is running at http://localhost:8000."
        },
        {
          id: `ai-err-fallback-${Date.now()}`,
          sender: 'ai',
          text: "### Server isn't running\n\nI couldn't connect to the backend. It might not be started yet.\n\n**To start it:**\n1. Open a terminal in the project folder.\n2. Go to the backend: `cd backend`\n3. Activate the virtual environment: `.\\venv\\Scripts\\activate` (Windows)\n4. Start the server: `python main.py`\n\nOnce it's running, try your question again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!language) {
    return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
  }

  return (
    <div className="flex w-screen h-screen bg-bg overflow-hidden font-sans">
      {/* Desktop view sidebar */}
      <Sidebar onResetLanguage={handleResetLanguage} />

      {/* Main dashboard viewport area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar language={language} />
        
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
        />
        
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
