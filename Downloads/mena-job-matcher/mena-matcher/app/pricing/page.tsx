'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Gift } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

const PLANS = [
  {
    id:       'free',
    icon:     Gift,
    color:    'slate',
    badge:    null,
    priceUSD: 0,
    priceAR:  'مجاني',
    titleEN:  'Free',
    titleAR:  'مجاني',
    descEN:   'Get started with AI job matching',
    descAR:   'ابدأ مع مطابقة الوظائف بالذكاء الاصطناعي',
    features: {
      en: ['5 AI matches per month','Basic job alerts','Access to all MENA jobs','CV upload & analysis'],
      ar: ['5 مطابقات ذكاء اصطناعي شهرياً','تنبيهات وظيفية أساسية','الوصول لجميع وظائف الشرق الأوسط','رفع وتحليل السيرة الذاتية'],
    },
    ctaEN:    'Current Plan',
    ctaAR:    'الخطة الحالية',
    planId:   null,
    disabled: true,
  },
  {
    id:       'starter',
    icon:     Zap,
    color:    'emerald',
    badge:    'TRY IT',
    priceUSD: 1,
    priceAR:  '4 ر.س',
    titleEN:  'Starter',
    titleAR:  'المبتدئ',
    descEN:   '5 Stars — try AI matching for $1',
    descAR:   '5 نجمات — جرّب المطابقة بدولار واحد',
    features: {
      en: ['5 AI match stars','Unlock 5 job details','Full AI analysis per job','No subscription'],
      ar: ['5 نجمات للمطابقة','فتح 5 وظائف كاملة','تحليل ذكاء اصطناعي لكل وظيفة','بدون اشتراك'],
    },
    ctaEN:    'Get 5 Stars — $1',
    ctaAR:    'احصل على 5 نجمات — 4 ر.س',
    planId:   'starter',
    disabled: false,
  },
  {
    id:       'coins_50',
    icon:     Zap,
    color:    'orange',
    badge:    'POPULAR',
    priceUSD: 10,
    priceAR:  '37 ر.س',
    titleEN:  'Pay as You Go',
    titleAR:  'ادفع حسب الاستخدام',
    descEN:   '50 AI matches, never expire',
    descAR:   '50 مطابقة ذكاء اصطناعي، لا تنتهي',
    features: {
      en: ['50 AI match credits','Credits never expire','Priority job alerts','Detailed match insights'],
      ar: ['50 رصيد مطابقة ذكاء اصطناعي','الأرصدة لا تنتهي','تنبيهات وظيفية ذات أولوية','تحليل تفصيلي للمطابقة'],
    },
    ctaEN:    'Buy 50 Credits — $10',
    ctaAR:    'اشترِ 50 رصيداً — 37 ر.س',
    planId:   'coins_50',
    disabled: false,
  },
  {
    id:       'pro',
    icon:     Crown,
    color:    'violet',
    badge:    'BEST VALUE',
    priceUSD: 19.99,
    priceAR:  '75 ر.س',
    titleEN:  'Pro',
    titleAR:  'برو',
    descEN:   '500 Stars/month · Full AI analysis',
    descAR:   '500 نجمة شهرياً · تحليل ذكاء اصطناعي كامل',
    features: {
      en: ['500 Stars per month (renews monthly)','Priority email alerts','Early access to new jobs','Export matches to PDF','Dedicated support'],
      ar: ['500 نجمة شهرياً (تتجدد كل شهر)','تنبيهات بريد إلكتروني ذات أولوية','وصول مبكر للوظائف الجديدة','تصدير المطابقات PDF','دعم متخصص'],
    },
    ctaEN:    'Get Pro — $19.99/mo',
    ctaAR:    'اشترك في برو — 75 ر.س/شهر',
    planId:   'pro_monthly',
    disabled: false,
  },
];

const COLOR_MAP: Record<string, Record<string, string>> = {
  slate:   { bg:'bg-slate-50',   border:'border-slate-200',  icon:'text-slate-500',  btn:'bg-slate-200 text-slate-600 cursor-default',                           badge:'bg-slate-100 text-slate-500'  },
  emerald: { bg:'bg-emerald-50', border:'border-emerald-300', icon:'text-emerald-500', btn:'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200', badge:'bg-emerald-500 text-white' },
  orange:  { bg:'bg-orange-50',  border:'border-orange-400 ring-2 ring-orange-300', icon:'text-orange-500', btn:'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200',   badge:'bg-orange-500 text-white'  },
  violet:  { bg:'bg-violet-50',  border:'border-violet-300', icon:'text-violet-500', btn:'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200',   badge:'bg-violet-600 text-white'  },
};

export default function PricingPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState<string | null>(null);

  async function handleBuy(planId: string | null) {
    if (!planId) return;
    setLoading(planId);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const { paymentUrl, error } = await res.json();
      if (error) { alert(error); return; }
      if (paymentUrl) window.location.href = paymentUrl; // redirect to MyFatoorah
    } catch {
      alert(isAr ? 'فشل في إنشاء الدفع' : 'Payment creation failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 py-16 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
            {isAr ? 'الأسعار' : 'Pricing'}
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            {isAr ? 'اختر خطتك' : 'Choose Your Plan'}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {isAr
              ? 'اعثر على وظيفة أحلامك في الشرق الأوسط مع مطابقة الذكاء الاصطناعي'
              : 'Find your dream job in MENA with AI-powered matching'}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const c = COLOR_MAP[plan.color];
            const Icon = plan.icon;
            return (
              <div key={plan.id}
                className={`relative rounded-3xl border-2 p-8 flex flex-col ${c.bg} ${c.border} transition-transform hover:-translate-y-1`}>
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-bold rounded-full ${c.badge}`}>
                    {plan.badge}
                  </span>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-5`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {isAr ? plan.titleAR : plan.titleEN}
                </h2>
                <p className="text-slate-500 text-sm mb-5">
                  {isAr ? plan.descAR : plan.descEN}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {isAr ? plan.priceAR : (plan.priceUSD === 0 ? 'Free' : `$${plan.priceUSD}`)}
                  </span>
                  {plan.priceUSD > 0 && !isAr && (
                    <span className="text-slate-400 text-sm ml-1">
                      {plan.id === 'pro' ? '/mo' : ' one-time'}
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-grow">
                  {(isAr ? plan.features.ar : plan.features.en).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.icon}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBuy(plan.planId)}
                  disabled={plan.disabled || loading === plan.planId}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${c.btn} ${plan.disabled ? '' : 'active:scale-95'}`}
                >
                  {loading === plan.planId ? '...' : (isAr ? plan.ctaAR : plan.ctaEN)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Back to dashboard */}
        <div className="text-center mt-10">
          <button onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
            ← {isAr ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}