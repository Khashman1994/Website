'use client';
// app/forgot-password/page.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function ForgotPasswordPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase  = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;

      console.log('[forgot-password] Sending reset email to:', email);
      console.log('[forgot-password] redirectTo:', redirectTo);

      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (err) {
        console.error('[forgot-password] Supabase error:', {
          message: err.message,
          status:  err.status,
          name:    err.name,
        });
        throw err;
      }

      console.log('[forgot-password] Email sent successfully');
      setSent(true);
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.message?.toLowerCase().includes('rate');
      setError(
        isRateLimit
          ? (isAr ? 'تم تجاوز الحد المسموح. انتظر ساعة وحاول مجدداً.' : 'Rate limit reached. Please wait 1 hour and try again.')
          : (err.message || (isAr ? 'حدث خطأ، حاول مجدداً' : 'Something went wrong, please try again'))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-neutral-700">MENA Job Matcher</span>
          </div>
          <h1 className="font-display text-3xl text-neutral-900 mb-2">
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </h1>
          <p className="text-neutral-500 text-sm">
            {isAr
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8">
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="font-semibold text-neutral-900 mb-2">
                {isAr ? 'تم إرسال الرابط!' : 'Link sent!'}
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                {isAr
                  ? `تم إرسال رابط إعادة التعيين إلى ${email}. تحقق من بريدك الوارد.`
                  : `We sent a reset link to ${email}. Check your inbox.`}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
              </Link>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isAr ? 'البريد الإلكتروني' : 'Email address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-slate-50`}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAr ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
              </button>

              <div className="flex flex-col items-center gap-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
                </Link>
                <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                  {isAr ? '← العودة للرئيسية' : '← Back to Home'}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
