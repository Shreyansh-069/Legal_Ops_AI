import React, { useState } from 'react';
import LanguageSelector from './components/LanguageSelector';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const localizedWelcomes = {
  en: "Welcome to LegalOps AI Engine Terminal. I have localized my stream to English. How can I assist you with your legal query today?",
  hi: "लीगलऑप्स एआई इंजन टर्मिनल में आपका स्वागत है। मैंने अपना स्थानीयकरण स्ट्रीम हिंदी में सेट कर लिया है। आज मैं आपकी कानूनी समस्या में क्या सहायता कर सकता हूँ?",
  ta: "LegalOps AI இன்ஜின் டெர்மினலுக்கு உங்களை வரவேற்கிறோம். எனது ஸ்ட்ரீம் தமிழில் உள்ளூர்மயமாக்கப்பட்டுள்ளது. இன்று உங்கள் சட்ட வினவலுக்கு நான் எவ்வாறு உதவ முடியும்?",
  te: "LegalOps AI ఇంజిన్ టెర్మినల్‌కు స్వాగతం. నేను నా ஸ்ட்ரீమ్‌ను తెలుగులోకి మార్చాను. ఈరోజు మీ న్యాయపరమైన సందేహానికి నేను ఏ విధంగా సహాయం చేయగలను?",
  kn: "LegalOps AI ಇಂಜಿನ್ ಟರ್ಮಿನಲ್‌ಗೆ ಸುಸ್ವಾಗತ. ನಾನು ಕನ್ನಡ ಸ್ಥಳೀಕರಣ ಸ್ಟ್ರೀಮ್ ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿದ್ದೇನೆ. ಇಂದು ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
  ml: "LegalOps AI എഞ്ചിൻ ടെർമിനലിലേക്ക് സ്വാഗതം. ഞാൻ മലയാളം പ്രാദേശികവൽക്കരണം സജീവമാക്കിയിരിക്കുന്നു. നിങ്ങളുടെ നിയമപരമായ ചോദ്യങ്ങളിൽ ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കണം?"
};

export default function App() {
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setSearchQuery('');
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
          text: "ERROR: Connection link with local LegalOps AI Core Engine is currently offline. Please ensure your Python backend server is active at http://localhost:8000."
        },
        {
          id: `ai-err-fallback-${Date.now()}`,
          sender: 'ai',
          text: "### LegalOps Core Connection Warning\n\nI was unable to establish connection with the central agent orchestrator. The Python FastAPI backend seems to be down or unreachable.\n\n**To boot up the core engine manually:**\n1. Open your terminal at the root workspace.\n2. Navigate to the backend directory: `cd backend`\n3. Activate the environment: `.\\venv\\Scripts\\activate` (Windows)\n4. Boot the server: `python main.py`\n\nOnce the connection is established, I will be ready to process live search queries and case analyses."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Select mock consultation from Sidebar and submit it
  const handleSelectMockQuery = (queryText) => {
    setInput(queryText);
  };

  if (!language) {
    return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
  }

  return (
    <div className="flex w-screen h-screen bg-cyber-dark overflow-hidden font-sans">
      {/* Desktop view sidebar */}
      <Sidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetLanguage={handleResetLanguage}
        onSelectMockQuery={handleSelectMockQuery}
      />

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
