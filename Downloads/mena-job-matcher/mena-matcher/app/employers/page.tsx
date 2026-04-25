// app/employers/page.tsx
import Link from 'next/link';
import { Briefcase, Users, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'For Employers — Post Jobs Free | MENA Job Matcher',
  description:
    'Reach pre-qualified MENA talent. Post unlimited jobs for free, get AI-matched candidates, and grow your team faster.',
};

export default function EmployersLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Top bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">MENA Job Matcher</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login?redirectTo=/employers/dashboard"
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup?role=employer&redirectTo=/employers/dashboard"
            className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Post a job free
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 mb-6">
          <Zap className="w-3.5 h-3.5" /> 100% free during early access
        </span>
        <h1 className="font-display text-4xl md:text-6xl text-neutral-900 leading-tight mb-5">
          Hire the <span className="text-primary-500">right MENA talent</span>,
          <br className="hidden md:block" /> not the most applicants.
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-9">
          Post unlimited jobs for free. We surface them to AI-matched candidates across the
          GCC, Egypt, Levant, and North Africa — no sales calls, no contracts.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup?role=employer&redirectTo=/employers/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            Post your first job <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login?redirectTo=/employers/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 font-semibold rounded-lg transition-all"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {[
          {
            icon: Briefcase,
            title: 'Unlimited free postings',
            body: 'List as many roles as you need. No per-job fees, no posting credits, no surprise bills.',
          },
          {
            icon: Users,
            title: 'AI-matched candidates',
            body: 'Our matching engine ranks your job against every active candidate so you see the best fits first.',
          },
          {
            icon: ShieldCheck,
            title: 'MENA-native experience',
            body: 'Arabic + English, GCC salary norms, and locations from Riyadh to Casablanca built in.',
          },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 shadow-sm">
          <h2 className="font-display text-2xl md:text-3xl text-neutral-900 mb-3">
            Ready to meet your next hire?
          </h2>
          <p className="text-neutral-600 mb-6">Setup takes under 2 minutes.</p>
          <Link
            href="/signup?role=employer&redirectTo=/employers/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            Create employer account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
