'use client';

// lib/i18n/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, Translations } from './translations';

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mena-lang') as Language | null;
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('mena-lang', newLang);
  };

  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang, isRTL }}>
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={lang}
        className={isRTL ? 'font-arabic' : 'font-body'}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
