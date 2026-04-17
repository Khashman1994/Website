'use client';
// app/about/page.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Heart, Globe } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function AboutPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const values = isAr
    ? [
        { icon: Target,  title: 'دقة المطابقة',      desc: 'نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل كل وظيفة وكل ملف شخصي على حدة، لضمان أفضل تطابق ممكن.' },
        { icon: Heart,   title: 'للمنطقة، من المنطقة', desc: 'صممنا المنصة خصيصاً للسوق العربي بالكامل، بفهم عميق لثقافة العمل في المنطقة.' },
        { icon: Globe,   title: 'تغطية شاملة',        desc: '16 دولة، 80+ مدينة، وآلاف الوظائف من كبرى الشركات في الشرق الأوسط وشمال أفريقيا.' },
      ]
    : [
        { icon: Target,  title: 'Matching Precision',  desc: 'We use state-of-the-art AI technology to analyse each job and each profile individually, ensuring the best possible match.' },
        { icon: Heart,   title: 'For the Region',      desc: 'Designed specifically for the Arab market with a deep understanding of the region\'s work culture.' },
        { icon: Globe,   title: 'Full Coverage',       desc: '16 countries, 80+ cities, and thousands of jobs from top companies across the MENA region.' },
      ];

  return (
    <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-secondary-900 to-secondary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-sm mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              {isAr ? 'مهمتنا' : 'Our Mission'}
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-white mb-6 leading-tight">
              {isAr
                ? 'نربط المواهب بالفرص في منطقة الشرق الأوسط'
                : 'Connecting Talent with Opportunity in the MENA Region'}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              {isAr
                ? 'نؤمن بأن كل شخص يستحق أن يجد وظيفة تناسب مهاراته وطموحاته. الذكاء الاصطناعي هو جسر من الكفاءة إلى الفرصة.'
                : 'We believe everyone deserves a job that matches their skills and ambitions. AI is the bridge from talent to opportunity.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg text-neutral-600 mx-auto"
          >
            <h2 className="font-display text-2xl text-secondary-900 mb-6">
              {isAr ? 'قصتنا' : 'Our Story'}
            </h2>
            <p className="leading-relaxed mb-5">
              {isAr
                ? 'نشأت فكرة MENA Jobs من تجربة شخصية: البحث عن عمل في سوق كبير ومتنوع كالشرق الأوسط يمكن أن يكون مرهقاً. المئات من الوظائف، عشرات التطبيقات، وفي النهاية لا يعرف المرشح أين يركّز جهوده.'
                : 'The idea for MENA Jobs came from personal experience: job searching in a large, diverse market like the Middle East can be exhausting. Hundreds of jobs, dozens of applications, and the candidate never knows where to focus their energy.'}
            </p>
            <p className="leading-relaxed mb-5">
              {isAr
                ? 'قررنا استخدام الذكاء الاصطناعي لحل هذه المعادلة. بدلاً من إرسال سيرتك الذاتية لكل مكان على أمل الحظ، نقوم بتحليل ملفك الشخصي ومطابقته بدقة مع الوظائف التي تناسبك فعلاً.'
                : 'We decided to use AI to solve this equation. Instead of sending your CV everywhere hoping for luck, we analyse your profile and precisely match it with jobs that actually suit you.'}
            </p>
            <p className="leading-relaxed">
              {isAr
                ? 'اليوم، تخدم منصتنا باحثين عن عمل في 16 دولة عربية، بدعم كامل للغة العربية والإنجليزية، وبفهم عميق لسوق العمل الإقليمي.'
                : 'Today, our platform serves job seekers in 16 Arab countries, with full support for Arabic and English, and deep understanding of the regional job market.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-secondary-900 text-center mb-12">
            {isAr ? 'قيمنا' : 'Our Values'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="font-semibold text-secondary-900 text-lg mb-3">{v.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}