'use client';
// app/signup/page.tsx
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useLang } from '@/lib/i18n/LanguageContext';
import { Loader2, Mail, Lock, User, Sparkles, Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  // ── Read role + redirectTo from URL (e.g. /signup?role=employer&redirectTo=/employers/dashboard)
  const roleParam: UserRole =
    searchParams.get('role') === 'employer' ? 'employer' : 'candidate';
  const isEmployer = roleParam === 'employer';
  const rawRedirect = searchParams.get('redirectTo');
  const redirectTo =
    rawRedirect && rawRedirect.startsWith('/')
      ? rawRedirect
      : isEmployer
      ? '/employers/dashboard'
      : '/dashboard';

  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    // Forward role + redirectTo through OAuth so /auth/callback can persist them.
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set('role', roleParam);
    callbackUrl.searchParams.set('redirectTo', redirectTo);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    });
    if (oauthError) { setError(oauthError.message); setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      // Stash role in user_metadata. Supabase persists this on auth.users
      // and surfaces it on every session — /auth/callback reads it when the
      // confirmation email is clicked and writes it into profiles.role.
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: roleParam },
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${roleParam}&redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل إنشاء الحساب' : 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-display text-2xl text-neutral-900 mb-2">
            {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {isAr
              ? 'أرسلنا رابط تأكيد إلى بريدك الإلكتروني'
              : 'We sent a confirmation link to your email'}
          </p>
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
          </Link>
        </div>
      </div>
    );
  }

  // ── Headline copy varies for employer vs candidate ───────────────────────
  const headline = isEmployer
    ? (isAr ? 'إنشاء حساب صاحب عمل' : 'Create employer account')
    : (isAr ? 'إنشاء حساب جديد' : 'Create your account');
  const subheadline = isEmployer
    ? (isAr ? 'انشر وظائف مجاناً واحصل على أفضل المرشحين' : 'Post jobs free and meet pre-qualified MENA talent')
    : (isAr ? 'احفظ ملفك الشخصي وابحث عن وظيفتك المثالية' : 'Save your profile and find your perfect job');

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm mb-6">
            {isEmployer ? (
              <Briefcase className="w-4 h-4 text-primary-500" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary-500" />
            )}
            <span className="text-sm font-medium text-neutral-700">
              {isEmployer ? 'MENA Job Matcher · Employers' : 'MENA Job Matcher'}
            </span>
          </div>
          <h1 className="font-display text-3xl text-neutral-900 mb-2">{headline}</h1>
          <p className="text-neutral-600">{subheadline}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-neutral-300 rounded-lg font-medium text-sm text-slate-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
              <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
              <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
              <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            {isAr ? 'التسجيل مع جوجل' : 'Sign up with Google'}
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">{isAr ? 'أو' : 'OR'}</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isEmployer
                  ? (isAr ? 'اسمك' : 'Your name')
                  : (isAr ? 'الاسم الكامل' : 'Full Name')}
              </label>
              <div className="relative">
                <User className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isEmployer
                  ? (isAr ? 'بريد العمل الإلكتروني' : 'Work email')
                  : (isAr ? 'البريد الإلكتروني' : 'Email')}
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
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={isAr ? 'على الأقل 6 أحرف' : 'At least 6 characters'}
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
              {isEmployer
                ? (isAr ? 'إنشاء حساب صاحب عمل' : 'Create employer account')
                : (isAr ? 'إنشاء الحساب' : 'Create Account')}
            </button>
          </form>

          {/* Toggle role link */}
          <p className="text-center text-xs text-neutral-500 mt-5">
            {isEmployer ? (
              <>
                {isAr ? 'تبحث عن وظيفة بدلاً من ذلك؟ ' : 'Looking for a job instead? '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  {isAr ? 'إنشاء حساب مرشح' : 'Sign up as a candidate'}
                </Link>
              </>
            ) : (
              <>
                {isAr ? 'تبحث عن توظيف؟ ' : 'Hiring? '}
                <Link
                  href="/signup?role=employer&redirectTo=/employers/dashboard"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isAr ? 'إنشاء حساب صاحب عمل' : 'Create an employer account'}
                </Link>
              </>
            )}
          </p>

          {/* Login link */}
          <p className="text-center text-sm text-neutral-600 mt-4">
            {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <Link
              href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          </p>

          {/* Back to home */}
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
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-warm" />}>
      <SignupPageInner />
    </Suspense>
  );
}
