'use client';
// components/layout/Navbar.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Menu, X, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useLang } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase';

export function Navbar() {
  const { lang } = useLang();
  const router   = useRouter();
  const pathname = usePathname();
  const isAr     = lang === 'ar';

  const [userEmail,   setUserEmail]   = useState<string | null>(null);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    sessionStorage.clear();
    router.push('/');
    setMenuOpen(false);
  };

  const navLinks = isAr
    ? [{ href: '/', label: 'الرئيسية' }, { href: '/about', label: 'عن المنصة' }, { href: '/contact', label: 'تواصل معنا' }]
    : [{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'}`}
      dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-secondary-900 hidden sm:block">
              {isAr ? 'وظائف MENA' : 'MENA Jobs'}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary-500'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {userEmail ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-900 hover:bg-secondary-800 text-white text-sm font-semibold rounded-full transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {isAr ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                  title={isAr ? 'تسجيل الخروج' : 'Sign out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                {isAr ? 'تسجيل الدخول' : 'Login'}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-2 transition-colors ${
                pathname === link.href ? 'text-primary-500' : 'text-neutral-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            {userEmail ? (
              <div className="flex gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 bg-secondary-900 text-white text-sm font-semibold rounded-xl"
                >
                  {isAr ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
                <button onClick={handleSignOut} className="px-3 py-2.5 border border-slate-200 rounded-xl text-neutral-500">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl"
              >
                {isAr ? 'تسجيل الدخول' : 'Login'}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
