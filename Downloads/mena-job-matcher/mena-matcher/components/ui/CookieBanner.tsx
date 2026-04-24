'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/i18n/LanguageContext';

type ConsentValue = 'granted' | 'denied';
type ConsentChoice = 'accepted' | 'rejected';

const STORAGE_KEY = 'mena-cookie-consent';
export const CONSENT_RESET_EVENT = 'mena-cookie-consent-reset';

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function updateConsent(value: ConsentValue) {
  gtag('consent', 'update', {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

export function CookieBanner() {
  const { t, isRTL } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
    if (saved === 'accepted') {
      updateConsent('granted');
    } else if (saved === 'rejected') {
      updateConsent('denied');
    } else {
      setVisible(true);
    }

    const handleReset = () => setVisible(true);
    window.addEventListener(CONSENT_RESET_EVENT, handleReset);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, handleReset);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    updateConsent('granted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    updateConsent('denied');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.cookieBannerTitle}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 md:py-5">
        <p className="text-sm leading-relaxed text-neutral-700 md:flex-1">
          {t.cookieBannerText}{' '}
          <Link
            href="/privacy"
            className="font-medium text-primary-600 underline-offset-2 hover:underline"
          >
            {t.cookieLearnMore}
          </Link>
        </p>
        <div className="flex flex-shrink-0 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2 md:flex-none"
          >
            {t.cookieReject}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 md:flex-none"
          >
            {t.cookieAccept}
          </button>
        </div>
      </div>
    </div>
  );
}
