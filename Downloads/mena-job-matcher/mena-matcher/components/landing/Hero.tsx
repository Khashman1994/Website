'use client';
// components/landing/Hero.tsx
import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase';

export function Hero() {
  const { t, lang } = useLang();
  const router = useRouter();
  const isAr   = lang === 'ar';

  // Auto-redirect if already logged in AND has a profile
  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Only redirect if profile already exists in DB
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) router.replace('/dashboard');
    }
    check();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-warm texture-noise">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 rounded-full opacity-20 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="text-sm font-medium text-neutral-700">{t.poweredBy}</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-neutral-900 leading-tight">
            {t.heroTitle} <br />
            <span className="text-primary-500">{t.heroTitleAccent}</span> <br />
            {t.heroTitleSuffix}
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-600">
            {t.heroSubtitle}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-neutral-700">
              <Brain className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-sm font-medium">{t.aiProfileAnalysis}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Target className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-sm font-medium">{t.preciseMatching}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-sm font-medium">{t.smartInsights}</span>
            </div>
          </div>

          {/* Login link */}
          <p className="text-sm text-neutral-500 pt-2">
            {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2">
              {isAr ? 'سجّل دخولك هنا' : 'Sign in here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}