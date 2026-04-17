'use client';
// components/ui/PremiumOverlay.tsx
import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface PremiumOverlayProps {
  children: React.ReactNode;
  /** When true the content is visible (user is premium) */
  unlocked?: boolean;
}

export function PremiumOverlay({ children, unlocked = false }: PremiumOverlayProps) {
  const { t } = useLang();

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl border border-primary-200 z-10">
        <div className="text-center px-6 py-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-primary-500" />
          </div>
          <p className="font-display text-lg text-neutral-900 mb-1">
            {t.premiumTitle}
          </p>
          <p className="text-sm text-neutral-500 mb-4">
            {t.premiumSubtitle}
          </p>
          {/* TODO: wire to Stripe checkout session */}
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
            onClick={() => alert('Stripe integration coming soon')}
          >
            <Sparkles className="w-4 h-4" />
            {t.premiumButton}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small badge shown on cards to mark premium content */
export function PremiumBadge() {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
      <Sparkles className="w-3 h-3" />
      {t.premiumBadge}
    </span>
  );
}
