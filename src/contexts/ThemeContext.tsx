import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

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
  const { theme, setTheme: setNextTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setNextTheme(savedTheme);
    } else {
      // Detect system preference on first visit
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setNextTheme(prefersDark ? 'dark' : 'light');
    }
    // Defer to avoid synchronous setState in effect
    Promise.resolve().then(() => setIsThemeLoaded(true));
  }, [setNextTheme]);

  // Update localStorage when theme changes
  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const prefersDark = mediaQuery.matches;
        setNextTheme(prefersDark ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setNextTheme]);

  const isDarkMode = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');

  return (
    <ThemeContext.Provider
      value={{
        theme: theme || 'system',
        setTheme: setNextTheme,
        systemTheme: systemTheme || 'light',
        isDarkMode,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};