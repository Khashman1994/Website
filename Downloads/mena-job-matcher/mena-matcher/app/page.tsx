'use client';
// app/page.tsx — High-End Landing Page
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Brain, Target, Zap,
  CheckCircle2, Users, MapPin, Star, Upload,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileUpload } from '@/components/landing/FileUpload';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { useLang } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase';

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

// ── Abstract mesh SVG background ─────────────────────────────────────────────
function MeshBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0f172a" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      {/* Network nodes */}
      {[
        [120,80],[320,140],[540,60],[700,180],[900,100],[1100,160],
        [200,280],[450,240],[650,320],[850,260],[1050,300],
        [100,420],[350,380],[600,460],[800,400],[1000,440],
      ].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#f97316" opacity="0.6" />
      ))}
      {/* Connection lines */}
      {[
        "M120,80 L320,140","M320,140 L540,60","M540,60 L700,180",
        "M700,180 L900,100","M900,100 L1100,160",
        "M200,280 L450,240","M450,240 L650,320","M650,320 L850,260",
        "M320,140 L200,280","M540,60 L450,240","M700,180 L650,320",
        "M900,100 L850,260","M1100,160 L1050,300",
        "M350,380 L600,460","M600,460 L800,400","M800,400 L1000,440",
        "M450,240 L350,380","M650,320 L600,460","M850,260 L800,400",
      ].map((d, i) => (
        <path key={i} d={d} stroke="#0f172a" strokeWidth="0.6" opacity="0.4" />
      ))}
    </svg>
  );
}

// ── AI Mockup widget ──────────────────────────────────────────────────────────
function AIMockup({ isAr }: { isAr: boolean }) {
  const jobs = [
    { title: isAr ? 'مهندس برمجيات' : 'Software Engineer',    co: 'Careem',   score: 94, color: 'bg-emerald-500' },
    { title: isAr ? 'مدير منتج'      : 'Product Manager',      co: 'Noon',     score: 87, color: 'bg-primary-500' },
    { title: isAr ? 'محلل بيانات'    : 'Data Analyst',         co: 'Aramco',   score: 81, color: 'bg-amber-500'   },
  ];
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_20px_60px_rgb(0,0,0,0.10)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="mx-auto flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-primary-400" />
            MENA Job Matcher AI
          </div>
        </div>

        <div className="p-5 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
          {/* CV upload strip */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-700">
                {isAr ? 'سيرة_ذاتية.pdf' : 'Resume_2025.pdf'}
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5">
                <motion.div
                  className="h-full bg-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex-shrink-0">
              {isAr ? '✓ محلّل' : '✓ Done'}
            </span>
          </div>

          {/* Divider with AI label */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {isAr ? 'GPT-4o يحلل' : 'GPT-4o analysing'}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Job matches */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {isAr ? 'أفضل التطابقات' : 'Top Matches'}
            </p>
            {jobs.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, x: isAr ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.18, duration: 0.4 }}
                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${job.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{job.title}</p>
                  <p className="text-[10px] text-slate-400">{job.co}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-sm font-bold ${
                    job.score >= 90 ? 'text-emerald-600' : job.score >= 80 ? 'text-primary-500' : 'text-amber-500'
                  }`}>
                    {job.score}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { lang } = useLang();
  const router   = useRouter();
  const isAr     = lang === 'ar';

  // Redirect all logged-in users to dashboard (empty state handled there)
  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace('/dashboard');
    }
    check();
  }, []);

  const stats = [
    { icon: Zap,   value: '<30s', label: isAr ? 'وقت التحليل'        : 'Analysis Time'         },
    { icon: Star,  value: '95%',  label: isAr ? 'معدل رضا المستخدمين': 'User Satisfaction'      },
    { icon: Users, value: '50K+', label: isAr ? 'مرشح مسجّل'          : 'Registered Candidates'  },
    { icon: MapPin,value: '16',   label: isAr ? 'دولة في المنطقة'     : 'MENA Countries'         },
  ];

  const features = [
    {
      icon: (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
          <rect x="4" y="8" width="32" height="24" rx="3" stroke="#f97316" strokeWidth="1.8"/>
          <path d="M4 14h32" stroke="#f97316" strokeWidth="1.8"/>
          <circle cx="10" cy="11" r="1.2" fill="#f97316"/>
          <circle cx="15" cy="11" r="1.2" fill="#f97316"/>
          <circle cx="20" cy="11" r="1.2" fill="#f97316"/>
          <path d="M10 20h6M10 25h10M22 20h8M22 25h5" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="30" cy="28" r="4" stroke="#f97316" strokeWidth="1.8"/>
          <path d="M30 26.5v1.8l1 1" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      title: isAr ? 'تحليل ذكي متطور'        : 'Advanced Neural Parsing',
      desc:  isAr
        ? 'تقنياتنا تستخرج السياق الحقيقي لخبراتك في ثوانٍ.'
        : 'Our custom-trained AI extracts the true context of your experience in seconds.',
    },
    {
      icon: (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
          <circle cx="20" cy="20" r="14" stroke="#f97316" strokeWidth="1.8"/>
          <circle cx="20" cy="20" r="8"  stroke="#f97316" strokeWidth="1.8" strokeDasharray="3 2"/>
          <circle cx="20" cy="20" r="3"  fill="#f97316"/>
          <path d="M20 6v4M20 30v4M6 20h4M30 20h4" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M14 10l1.5 2.5M26 10l-1.5 2.5M10 14l2.5 1.5M30 14l-2.5 1.5" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        </svg>
      ),
      title: isAr ? 'مطابقة فائقة الدقة'     : 'Hyper-Accurate Matching',
      desc:  isAr
        ? 'نحن لا نبحث عن الكلمات فقط، بل نفهم سياق سوق العمل.'
        : "We don't just search keywords; we understand the nuances of the MENA job market.",
    },
    {
      icon: (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
          <path d="M8 32L16 20l6 8 5-10 5 6" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8"  cy="32" r="2" fill="#f97316"/>
          <circle cx="16" cy="20" r="2" fill="#f97316"/>
          <circle cx="22" cy="28" r="2" fill="#f97316"/>
          <circle cx="27" cy="18" r="2" fill="#f97316"/>
          <circle cx="32" cy="24" r="2" fill="#f97316"/>
          <path d="M26 8l2 2-6 6" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M24 8h4v4"      stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: isAr ? 'رؤى مهنية قابلة للتنفيذ' : 'Actionable Career Intelligence',
      desc:  isAr
        ? 'احصل على رؤى عميقة حول ملاءمة الوظيفة وكيفية اجتياز المقابلة.'
        : 'Get deep insights into why a job fits you and prepare for the interview.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isAr ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
        <MeshBackground />

        {/* Soft radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-primary-500/5 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-96px)] py-12">

            {/* Left: Copy */}
            <div className={isAr ? 'lg:order-2' : ''}>
              <motion.h1
                {...fadeUp(0.12)}
                className="font-display text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.08] mb-6"
              >
                {isAr ? (
                  <>مستقبلك المهني في<br /><span className="text-primary-500">الشرق الأوسط</span><br />مدعومًا بالذكاء الاصطناعي</>
                ) : (
                  <>Your Career in the<br /><span className="text-primary-500">MENA Region,</span><br />Powered by AI.</>
                )}
              </motion.h1>

              <motion.p {...fadeUp(0.2)} className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                {isAr
                  ? 'لا تضيع وقتك في البحث. ارفع سيرتك الذاتية وسيجد الذكاء الاصطناعي الوظائف التي تناسب مهاراتك تحديداً — في ثوانٍ.'
                  : "Stop wasting time searching. Upload your CV and AI will find jobs that match your exact skills — in seconds. Let the jobs find you."}
              </motion.p>

              <motion.div {...fadeUp(0.28)} className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  {isAr ? 'ابدأ مجاناً' : 'Get Started — Free'}
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
                <Link
                  href="#upload"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-600 font-semibold rounded-full transition-all"
                >
                  {isAr ? 'ارفع سيرتك الآن' : 'Upload CV Now'}
                </Link>
              </motion.div>

              {/* Trust signals */}
              <motion.div {...fadeUp(0.36)} className="flex flex-wrap gap-4">
                {[
                  isAr ? '✓ بدون بطاقة ائتمان' : '✓ No credit card',
                  isAr ? '✓ يدعم العربية'       : '✓ Arabic supported',
                  isAr ? '✓ نتائج فورية'        : '✓ Instant results',
                ].map((t) => (
                  <span key={t} className="text-xs text-slate-400 font-medium">{t}</span>
                ))}
              </motion.div>
            </div>

            {/* Right: AI Mockup */}
            <motion.div
              {...fadeUp(0.22)}
              className={`${isAr ? 'lg:order-1' : ''} flex justify-center lg:justify-end`}
            >
              <div className="w-full max-w-sm">
                <AIMockup isAr={isAr} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS TRUST BAR ──────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPLOAD SECTION ───────────────────────────────────────────────── */}
      <section id="upload" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl text-slate-900 mb-3">
              {isAr ? 'ارفع سيرتك الذاتية الآن' : 'Upload Your CV Now'}
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {isAr
                ? 'PDF أو TXT — يدعم العربية والإنجليزية. التحليل يستغرق أقل من 30 ثانية.'
                : 'PDF or TXT — Arabic & English supported. Analysis takes under 30 seconds.'}
            </p>
          </motion.div>
          <FileUpload />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl text-slate-900 mb-4">
              {isAr ? 'لماذا MENA Jobs؟' : 'Why MENA Jobs?'}
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              {isAr
                ? 'لسنا مجرد محرك بحث. نحن مساعدك الشخصي في سوق العمل.'
                : "We're not just a search engine. We're your personal career assistant."}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="group p-8 rounded-2xl border border-slate-100 hover:border-primary-200 bg-white hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] transition-all duration-300 shadow-sm"
              >
                <div className="w-14 h-14 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50/50">
        <HowItWorks />
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <MeshBackground />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
              {isAr ? 'جاهز لبدء مسيرتك المهنية؟' : 'Ready to Start Your Career Journey?'}
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              {isAr
                ? 'انضم لآلاف المحترفين الذين وجدوا وظائفهم المثالية عبر منصتنا.'
                : 'Join thousands of professionals who found their ideal jobs through our platform.'}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-full transition-all shadow-2xl shadow-primary-500/20 hover:-translate-y-0.5"
            >
              {isAr ? 'ابدأ مجاناً الآن' : 'Start for Free Now'}
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}