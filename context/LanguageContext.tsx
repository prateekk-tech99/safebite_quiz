import React, { createContext, useState, useContext, useMemo } from 'react';
import { translations } from '../lib/translations';
import { Language } from '../types';

// This extracts all keys from the English translation object.
// We assume all languages will have the same keys.
type TranslationKey = keyof typeof translations[Language.EN];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// FIX: The component's prop type was causing downstream type errors in index.tsx. Using React.PropsWithChildren is more robust and solves the issue.
export const LanguageProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [language, setLanguage] = useState<Language>(Language.EN);

  // The 't' function is memoized with useCallback to prevent unnecessary re-renders
  // in components that use it, but since it depends on 'language', useMemo on the
  // context value is a better approach here.
  const t = (key: TranslationKey, ...args: any[]): string => {
    const translationSet = translations[language] || translations[Language.EN];
    const translation = translationSet[key];

    if (typeof translation === 'function') {
      // Type assertion to tell TypeScript that this is a function
      return (translation as (...args: any[]) => string)(...args);
    }
    // Type assertion to tell TypeScript this is a string
    return (translation as string) || (key as string);
  };
  
  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};