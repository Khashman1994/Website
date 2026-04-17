'use client';
// app/privacy/page.tsx
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function PrivacyPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const sections = isAr ? [
    { title: '1. جمع البيانات', body: 'نجمع المعلومات التي تقدمها مباشرة، مثل الاسم والبريد الإلكتروني وبيانات السيرة الذاتية عند التسجيل.' },
    { title: '2. استخدام البيانات', body: 'نستخدم بياناتك لمطابقة وظائف مناسبة لك، وتحسين خدماتنا، وإرسال إشعارات ذات صلة. لا نبيع بياناتك لأطراف ثالثة.' },
    { title: '3. الذكاء الاصطناعي', body: 'نستخدم OpenAI GPT-4o لتحليل سيرتك الذاتية ومطابقتها بالوظائف. يتم إرسال نص سيرتك الذاتية إلى خوادم OpenAI وفق سياسة الخصوصية الخاصة بهم.' },
    { title: '4. التخزين والأمان', body: 'نخزن بياناتك في Supabase بتشفير كامل. نستخدم Row Level Security لضمان وصولك فقط لبياناتك.' },
    { title: '5. حقوقك (GDPR)', body: 'يحق لك طلب عرض بياناتك، تصحيحها، حذفها، أو تصديرها في أي وقت عبر التواصل معنا.' },
    { title: '6. ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط الضرورية فقط لإدارة الجلسات. لا نستخدم ملفات تتبع إعلانية.' },
    { title: '7. التواصل', body: 'لأي استفسار بشأن الخصوصية، تواصل معنا عبر صفحة الاتصال.' },
  ] : [
    { title: '1. Data Collection', body: 'We collect information you directly provide, such as name, email, and CV data when you register.' },
    { title: '2. Data Use', body: 'We use your data to match suitable jobs, improve our services, and send relevant notifications. We never sell your data to third parties.' },
    { title: '3. Artificial Intelligence', body: 'We use OpenAI GPT-4o to analyse your CV and match it with jobs. Your CV text is sent to OpenAI servers under their privacy policy.' },
    { title: '4. Storage & Security', body: 'We store your data in Supabase with full encryption. We use Row Level Security to ensure only you can access your data.' },
    { title: '5. Your Rights (GDPR)', body: 'You have the right to view, correct, delete, or export your data at any time by contacting us.' },
    { title: '6. Cookies', body: 'We only use necessary session cookies. We do not use advertising tracking cookies.' },
    { title: '7. Contact', body: 'For any privacy inquiries, contact us via our Contact page.' },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <Navbar />
      <section className="pt-28 pb-16 bg-gradient-to-br from-secondary-900 to-secondary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl text-white mb-4">
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-white/50 text-sm">
            {isAr ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}
          </p>
        </div>
      </section>
      <section className="flex-1 py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-semibold text-secondary-900 text-lg mb-3">{s.title}</h2>
              <p className="text-neutral-600 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}