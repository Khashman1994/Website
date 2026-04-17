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
          <p className="text-secondary-600 text-xs">
            {isAr ? 'مدعوم بـ OpenAI و Supabase' : 'Powered by OpenAI & Supabase'}
          </p>
        </div>
      </div>
    </footer>
  );
}
