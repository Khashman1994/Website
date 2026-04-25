'use client';
// components/employers/EmployerLandingView.tsx
// Client view for /employers — owns all the visible copy + RTL handling
// via useLang. The server shell at app/employers/page.tsx decides the CTA
// targets based on auth state and passes them in.

import Link from 'next/link';
import { Briefcase, Users, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Props {
  /** True when an authenticated user is viewing the page. */
  loggedIn: boolean;
  /** Where the orange "Post a job" / "Open dashboard" CTAs link. */
  primaryCta: string;
  /** Where the secondary "Sign in" / "I already have an account" links go. */
  secondaryCta: string;
}

export function EmployerLandingView({ loggedIn, primaryCta, secondaryCta }: Props) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const T = isAr
    ? {
        brand:        'مطابق وظائف MENA',
        signIn:       'تسجيل الدخول',
        topCta:       loggedIn ? 'فتح لوحة الشركة' : 'انشر وظيفة مجاناً',
        free:         'مجاني 100% خلال الإطلاق المبكر',
        h1Pre:        'وظّف ',
        h1Highlight:  'المواهب المناسبة في الشرق الأوسط',
        h1Post:       '،',
        h1Line2:      'وليس أكثر المتقدمين.',
        sub:
          'انشر عدداً غير محدود من الوظائف مجاناً. سنعرضها على مرشحين تمت مطابقتهم بالذكاء الاصطناعي ' +
          'في الخليج ومصر وبلاد الشام وشمال أفريقيا — بدون مكالمات مبيعات أو عقود.',
        primary:      loggedIn ? 'افتح لوحة الشركة' : 'انشر وظيفتك الأولى',
        secondary:    'لدي حساب بالفعل',

        cardsTitle1:  'إعلانات غير محدودة مجاناً',
        cardsBody1:   'انشر أي عدد من الوظائف. لا رسوم لكل وظيفة، ولا أرصدة نشر، ولا فواتير مفاجئة.',
        cardsTitle2:  'مرشحون مطابقون بالذكاء الاصطناعي',
        cardsBody2:   'محرّك المطابقة لدينا يصنّف وظيفتك مقارنةً بكل مرشح نشط لتظهر لك أفضل المطابقات أولاً.',
        cardsTitle3:  'تجربة مصممة لمنطقة الشرق الأوسط',
        cardsBody3:   'دعم العربية والإنجليزية، رواتب الخليج، ومدن من الرياض إلى الدار البيضاء — كل ذلك مدمج.',

        ctaTitle:     'جاهز للقاء موظفك التالي؟',
        ctaSub:       'الإعداد يستغرق أقل من دقيقتين.',
        ctaButton:    loggedIn ? 'افتح لوحة الشركة' : 'إنشاء حساب صاحب عمل',
      }
    : {
        brand:        'MENA Job Matcher',
        signIn:       'Sign in',
        topCta:       loggedIn ? 'Go to dashboard' : 'Post a job free',
        free:         '100% free during early access',
        h1Pre:        'Hire the ',
        h1Highlight:  'right MENA talent',
        h1Post:       ',',
        h1Line2:      'not the most applicants.',
        sub:
          'Post unlimited jobs for free. We surface them to AI-matched candidates across the ' +
          'GCC, Egypt, Levant, and North Africa — no sales calls, no contracts.',
        primary:      loggedIn ? 'Open employer dashboard' : 'Post your first job',
        secondary:    'I already have an account',

        cardsTitle1:  'Unlimited free postings',
        cardsBody1:   'List as many roles as you need. No per-job fees, no posting credits, no surprise bills.',
        cardsTitle2:  'AI-matched candidates',
        cardsBody2:   'Our matching engine ranks your job against every active candidate so you see the best fits first.',
        cardsTitle3:  'MENA-native experience',
        cardsBody3:   'Arabic + English, GCC salary norms, and locations from Riyadh to Casablanca built in.',

        ctaTitle:     'Ready to meet your next hire?',
        ctaSub:       'Setup takes under 2 minutes.',
        ctaButton:    loggedIn ? 'Open employer dashboard' : 'Create employer account',
      };

  const cards = [
    { icon: Briefcase,   title: T.cardsTitle1, body: T.cardsBody1 },
    { icon: Users,       title: T.cardsTitle2, body: T.cardsBody2 },
    { icon: ShieldCheck, title: T.cardsTitle3, body: T.cardsBody3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">{T.brand}</span>
        </Link>
        <nav className="flex items-center gap-3">
          {!loggedIn && (
            <Link
              href={secondaryCta}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              {T.signIn}
            </Link>
          )}
          <Link
            href={primaryCta}
            className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            {T.topCta}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 mb-6">
          <Zap className="w-3.5 h-3.5" /> {T.free}
        </span>
        <h1 className="font-display text-4xl md:text-6xl text-neutral-900 leading-tight mb-5">
          {T.h1Pre}
          <span className="text-primary-500">{T.h1Highlight}</span>
          {T.h1Post}
          <br className="hidden md:block" /> {T.h1Line2}
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-9">{T.sub}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={primaryCta}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            {T.primary} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
          {!loggedIn && (
            <Link
              href={secondaryCta}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 font-semibold rounded-lg transition-all"
            >
              {T.secondary}
            </Link>
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {cards.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 shadow-sm">
          <h2 className="font-display text-2xl md:text-3xl text-neutral-900 mb-3">{T.ctaTitle}</h2>
          <p className="text-neutral-600 mb-6">{T.ctaSub}</p>
          <Link
            href={primaryCta}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            {T.ctaButton} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  );
}
