'use client';
// components/layout/Header.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useLang } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase';

export function Header() {
  const { lang } = useLang();
  const router   = useRouter();
  const isAr     = lang === 'ar';

  const [userEmail,  setUserEmail]  = useState<string | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-neutral-900 hidden sm:block">
              {isAr ? 'مطابق الوظائف' : 'MENA Jobs'}
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {!isLoading && (
              userEmail ? (
                // Logged in
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isAr ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                    title={isAr ? 'تسجيل الخروج' : 'Sign out'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Guest
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:border-primary-400 text-neutral-700 hover:text-primary-600 text-sm font-semibold rounded-full transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {isAr ? 'تسجيل الدخول' : 'Login'}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
