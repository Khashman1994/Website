'use client';
import { useLang } from '@/lib/i18n/LanguageContext';

const INSTAGRAM_URL = 'https://www.instagram.com/mena_job?igsh=MWZrdnJ4MWhvc3dlYw==';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

export function InstagramSection() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <section className="py-12 bg-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 text-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
            boxShadow: '0 4px 20px rgba(253,29,29,0.3)',
          }}
        >
          <InstagramIcon className="w-5 h-5" />
          {isAr ? 'تابعنا @mena_job' : 'Follow @mena_job'}
        </a>
        <p className="text-slate-400 text-sm mt-3">
          {isAr
            ? 'انضم إلى آلاف الباحثين عن عمل في منطقة الخليج'
            : 'Join thousands of job seekers across the Gulf region'}
        </p>
      </div>
    </section>
  );
}
