'use client';
// app/auth/reset-password/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [validSession, setValidSession] = useState(false);
  const [checking,  setChecking]  = useState(true);

  // Supabase puts the access token in the URL hash when user clicks the email link.
  // We need to detect the session from that hash.
  useEffect(() => {
    const supabase = createClient();

    // Listen for the PASSWORD_RECOVERY event from the hash token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setValidSession(true);
      }
      setChecking(false);
    });

    // Also check immediately in case the session is already set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      // Redirect to dashboard after 2.5s
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthColor = ['bg-slate-100', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][strength];
  const strengthLabel = isAr
    ? ['', 'ضعيف', 'متوسط', 'قوي'][strength]
    : ['', 'Weak', 'Fair', 'Strong'][strength];

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
            {isAr ? 'إنشاء كلمة مرور جديدة' : 'Create new password'}
          </h1>
          <p className="text-neutral-500 text-sm">
            {isAr ? 'اختر كلمة مرور قوية لحسابك' : 'Choose a strong password for your account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8">
          {checking ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-500">{isAr ? 'جارٍ التحقق...' : 'Verifying link...'}</p>
            </div>
          ) : done ? (
            /* Success */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="font-semibold text-neutral-900 mb-2">
                {isAr ? 'تم تحديث كلمة المرور!' : 'Password updated!'}
              </h2>
              <p className="text-sm text-neutral-500">
                {isAr ? 'جارٍ تحويلك إلى لوحة التحكم...' : 'Redirecting you to the dashboard...'}
              </p>
            </div>
          ) : !validSession ? (
            /* Invalid / expired link */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="font-semibold text-neutral-900 mb-2">
                {isAr ? 'الرابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link'}
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                {isAr ? 'يرجى طلب رابط جديد' : 'Please request a new reset link'}
              </p>
              <a
                href="/forgot-password"
                className="inline-block px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {isAr ? 'طلب رابط جديد' : 'Request new link'}
              </a>
            </div>
          ) : (
            /* Reset form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isAr ? 'كلمة المرور الجديدة' : 'New password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={isAr ? 'على الأقل 6 أحرف' : 'At least 6 characters'}
                    className={`w-full ${isAr ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-slate-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className={`absolute top-3 ${isAr ? 'left-3' : 'right-3'} text-neutral-400 hover:text-neutral-600`}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(strength / 3) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-600'
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-neutral-400`} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter your password'}
                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-slate-50 ${
                      confirm && password !== confirm ? 'border-red-300 focus:ring-red-400' : ''
                    }`}
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 6}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}