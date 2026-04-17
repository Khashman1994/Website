'use client';
// components/landing/HowItWorks.tsx
import React from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

export function HowItWorks() {
  const { t } = useLang();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-200">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl text-neutral-900 mb-4">{t.howItWorks}</h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">{t.howItWorksSubtitle}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { num: '1', title: t.step1Title, desc: t.step1Desc },
          { num: '2', title: t.step2Title, desc: t.step2Desc },
          { num: '3', title: t.step3Title, desc: t.step3Desc },
        ].map((step) => (
          <div
            key={step.num}
            className="text-center p-8 rounded-2xl bg-white border border-neutral-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-display text-2xl">
              {step.num}
            </div>
            <h3 className="font-display text-xl text-neutral-900 mb-3">{step.title}</h3>
            <p className="text-neutral-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}