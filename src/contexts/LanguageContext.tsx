import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Import the i18n configuration

type Language = 'en' | 'gu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'en' || savedLanguage === 'gu') ? savedLanguage : 'en';
  });

  const availableLanguages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'gu' as Language, name: 'ગુજરાતી' } // Gujarati
  ];

  // Function to set language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update html lang attribute for accessibility
    document.documentElement.setAttribute('lang', lang);
    
    // For RTL languages (not needed for Gujarati, but good to have for future)
    if (lang === 'gu') {
      document.documentElement.setAttribute('dir', 'ltr'); // Gujarati is LTR
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  useEffect(() => {
    // Initialize language on component mount
    i18n.changeLanguage(language);
    document.documentElement.setAttribute('lang', language);
  }, [i18n, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};