'use client';
// components/layout/Footer.tsx
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <footer className="bg-secondary-900 text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg">{isAr ? 'وظائف MENA' : 'MENA Jobs'}</span>
            </div>
            <p className="text-secondary-400 text-sm leading-relaxed">
              {isAr
                ? 'منصة مدعومة بالذكاء الاصطناعي لمطابقة الوظائف في منطقة الشرق الأوسط وشمال أفريقيا.'
                : 'AI-powered job matching platform for the Middle East & North Africa region.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {isAr ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/',        label: isAr ? 'الرئيسية'    : 'Home'    },
                { href: '/about',   label: isAr ? 'عن المنصة'   : 'About'   },
                { href: '/contact', label: isAr ? 'تواصل معنا'  : 'Contact' },
                { href: '/login',   label: isAr ? 'تسجيل الدخول': 'Login'   },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-secondary-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {isAr ? 'قانوني' : 'Legal'}
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/privacy', label: isAr ? 'سياسة الخصوصية' : 'Privacy Policy' },
                { href: '/imprint', label: isAr ? 'بيانات الاتصال'  : 'Imprint'        },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-secondary-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-secondary-500 text-xs">
            © {new Date().getFullYear()} MENA Jobs. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <a
            href="https://www.instagram.com/mena_job?igsh=MWZrdnJ4MWhvc3dlYw=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-400 hover:text-pink-400 transition-colors"
            title="Instagram"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}