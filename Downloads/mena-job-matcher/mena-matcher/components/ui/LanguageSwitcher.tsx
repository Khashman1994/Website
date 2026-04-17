'use client';
// components/ui/LanguageSwitcher.tsx
import React from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { lang, setLang, isRTL } = useLang();

  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          lang === 'en'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          lang === 'ar'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
        dir="rtl"
      >
        العربية
      </button>
    </div>
  );
}
