'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function UpdatePasswordPage() {
  const router  = useRouter();
  const { lang } = useLang();
  const isAr    = lang === 'ar';

  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [status,      setStatus]      = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errMsg,      setErrMsg]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (password.length < 8) {
      setErrMsg(isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setErrMsg(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setStatus('loading');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setStatus('done');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setErrMsg(err.message || (isAr ? 'حدث خطأ' : 'An error occurred'));
      setStatus('error');
    }
  };

  const inp = 'w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAr ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAr ? 'أدخل كلمة المرور الجديدة لحسابك' : 'Enter a new password for your account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Success state */}
          {status === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="font-semibold text-slate-900 text-lg mb-1">
                {isAr ? 'تم تحديث كلمة المرور!' : 'Password Updated!'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isAr ? 'جارٍ توجيهك إلى لوحة التحكم...' : 'Redirecting you to dashboard...'}
              </p>
            </div>
          )}

          {/* Form */}
          {status !== 'done' && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isAr ? 'كلمة المرور (8 أحرف على الأقل)' : 'At least 8 characters'}
                    className={`${inp} ${isAr ? 'pl-10' : 'pr-10'}`}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className={`absolute top-3 ${isAr ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600`}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Repeat your password'}
                  className={inp}
                  required
                />
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      password.length < 8  ? 'w-1/4 bg-red-400' :
                      password.length < 12 ? 'w-2/4 bg-orange-400' :
                                             'w-full bg-emerald-400'
                    }`} />
                  </div>
                  <p className={`text-[11px] ${
                    password.length < 8  ? 'text-red-500' :
                    password.length < 12 ? 'text-orange-500' :
                                           'text-emerald-500'
                  }`}>
                    {password.length < 8  ? (isAr ? 'ضعيفة جداً' : 'Too weak') :
                     password.length < 12 ? (isAr ? 'جيدة' : 'Good') :
                                            (isAr ? 'قوية' : 'Strong')}
                  </p>
                </div>
              )}

              {/* Error */}
              {errMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                  {errMsg}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-200 active:scale-[0.98]"
              >
                {status === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{isAr ? 'جارٍ الحفظ...' : 'Saving...'}</>
                  : isAr ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
