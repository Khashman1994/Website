'use client';
// app/login/page.tsx
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useLang } from '@/lib/i18n/LanguageContext';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Inner component that uses useSearchParams (must be inside Suspense)
function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'inactivity';
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(
    searchParams.get('error') === 'auth_failed'
      ? (isAr ? 'فشل تسجيل الدخول بجوجل' : 'Google login failed. Please try again.')
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
    // On success browser redirects — no further action needed
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
            {isAr ? 'مرحباً بعودتك' : 'Welcome back'}
          </h1>
          <p className="text-neutral-600">
            {isAr ? 'سجّل دخولك للوصول إلى ملفك الشخصي' : 'Sign in to access your profile'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          {/* Session expired banner */}
          {sessionExpired && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800">
              <span>⏱</span>
              <span>
                {isAr
                  ? 'انتهت جلستك بسبب عدم النشاط لمدة ساعة. يرجى تسجيل الدخول مجدداً.'
                  : 'Your session expired after 1 hour of inactivity. Please sign in again.'}
              </span>
            </div>
          )}
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-neutral-300 rounded-lg font-medium text-sm text-slate-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 mb-5"
          >
            {/* Google SVG logo */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
              <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
              <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
              <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            {isAr ? 'المتابعة مع جوجل' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">{isAr ? 'أو' : 'OR'}</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm`}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-sm text-neutral-600 mt-6">
            {isAr ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              {isAr ? 'إنشاء حساب' : 'Sign up'}
            </Link>
          </p>

          {/* Continue without login */}
          <p className="text-center text-sm text-neutral-400 mt-3">
            <Link href="/" className="hover:text-neutral-600 transition-colors">
              {isAr ? '← العودة للرئيسية' : '← Back to Home'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Suspense wrapper — required by Next.js for useSearchParams during SSG
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-warm" />}>
      <LoginPageInner />
    </Suspense>
  );
}