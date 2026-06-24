import { createContext, useContext, useEffect, useState } from 'react';

const THEMES = ['classic', 'dark'];
const STORAGE_KEY = 'legalops-theme';

const ThemeContext = createContext(null);

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(saved) ? saved : 'classic';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (next) => {
    if (THEMES.includes(next)) {
      setThemeState(next);
    }
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === 'classic' ? 'dark' : 'classic'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
