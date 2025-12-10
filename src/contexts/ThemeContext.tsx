import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  systemTheme: string;
  isDarkMode: boolean;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook to use the theme context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Force dark mode on initialization
  useEffect(() => {
    // Always set dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    setIsThemeLoaded(true);
  }, []);

  // Stub setTheme - theme is locked to dark mode
  const setTheme = () => {
    // Theme is locked to dark mode, no-op
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: 'dark',
        setTheme,
        systemTheme: 'dark',
        isDarkMode: true,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
