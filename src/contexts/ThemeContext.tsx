import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default to 'system'
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });
  
  // Track whether dark mode is active
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Update the theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Store the theme in localStorage
    localStorage.setItem('theme', theme);

    // Apply theme based on selection
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === 'dark');
    } else {
      root.classList.add(theme);
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        const systemTheme = e.matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        setIsDarkMode(systemTheme === 'dark');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    isDarkMode
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}