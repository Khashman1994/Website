'use client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function ImprintPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="flex-1 pt-28 pb-16 max-w-2xl mx-auto px-4">
        <h1 className="font-display text-3xl text-secondary-900 mb-6">
          {isAr ? 'بيانات الاتصال' : 'Imprint'}
        </h1>
        <div className="space-y-3 text-sm text-neutral-700">
          <p><strong>MENA Matcher</strong></p>
          <p>{isAr ? 'البريد الإلكتروني:' : 'Email:'} contact@menajob-ai.com</p>
          <p className="text-neutral-400 text-xs mt-8">
            {isAr
              ? 'جميع الحقوق محفوظة © 2026 MENA Matcher'
              : '© 2026 MENA Matcher. All rights reserved.'}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}