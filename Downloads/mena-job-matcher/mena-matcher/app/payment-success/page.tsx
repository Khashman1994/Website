'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang } = useLang();
  const isAr    = lang === 'ar';
  const credits  = params.get('credits') ?? '5';

  useEffect(() => {
    const t = setTimeout(() => router.replace(`/dashboard?payment=success&credits=${credits}`), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
      <div className="text-center px-4">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isAr ? 'تمت عملية الدفع بنجاح! 🎉' : 'Payment Successful! 🎉'}
        </h1>
        <p className="text-slate-600 mb-2">
          {isAr
            ? `تم إضافة ${credits} نجمة إلى حسابك`
            : `${credits} Stars have been added to your account`}
        </p>
        <p className="text-slate-400 text-sm">
          {isAr ? 'سيتم توجيهك تلقائياً...' : 'Redirecting you automatically...'}
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-50" />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}