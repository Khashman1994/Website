'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

const REASON_MAP: Record<string, { en: string; ar: string }> = {
  missing_params:      { en: 'Invalid payment link.',          ar: 'رابط الدفع غير صالح.'     },
  verification_failed: { en: 'Payment could not be verified.', ar: 'تعذّر التحقق من الدفع.'    },
  db_error:            { en: 'Account update failed.',         ar: 'فشل تحديث الحساب.'         },
  failed:              { en: 'Payment was declined.',          ar: 'تم رفض الدفعة.'           },
  cancelled:           { en: 'Payment was cancelled.',         ar: 'تم إلغاء الدفعة.'         },
};

function PaymentFailedInner() {
  const router   = useRouter();
  const params   = useSearchParams();
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const reason   = params.get('reason') ?? 'failed';
  const msg      = REASON_MAP[reason] ?? REASON_MAP['failed'];

  useEffect(() => {
    const t = setTimeout(() => router.replace('/pricing'), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center max-w-sm">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {isAr ? 'فشلت عملية الدفع' : 'Payment Failed'}
        </h1>
        <p className="text-slate-600 mb-2">
          {isAr ? msg.ar : msg.en}
        </p>
        <p className="text-slate-400 text-sm mb-6">
          {isAr ? 'سيتم توجيهك إلى صفحة الأسعار...' : 'Redirecting you to pricing...'}
        </p>
        <a
          href="/pricing"
          className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all active:scale-95"
        >
          {isAr ? 'العودة إلى الأسعار' : 'Back to Pricing'}
        </a>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-red-50" />}>
      <PaymentFailedInner />
    </Suspense>
  );
}
