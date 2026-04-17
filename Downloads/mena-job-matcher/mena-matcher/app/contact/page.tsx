'use client';
// app/contact/page.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function ContactPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate send — replace with your email service (Resend, Sendgrid, etc.)
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  const inp = `w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-400`;

  return (
    <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <Navbar />

      <section className="pt-28 pb-16 bg-gradient-to-br from-secondary-900 to-secondary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
              {isAr ? 'تواصل معنا' : 'Get in Touch'}
            </h1>
            <p className="text-white/60 text-lg">
              {isAr ? 'نسعد بسماع أسئلتك واقتراحاتك' : "We'd love to hear your questions and suggestions"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="flex-1 py-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8"
          >
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="font-semibold text-secondary-900 text-xl mb-2">
                  {isAr ? 'تم الإرسال!' : 'Message Sent!'}
                </h2>
                <p className="text-neutral-500 text-sm">
                  {isAr ? 'شكراً لتواصلك. سنرد عليك خلال 24 ساعة.' : "Thank you for reaching out. We'll respond within 24 hours."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                  </div>
                  <h2 className="font-semibold text-secondary-900">
                    {isAr ? 'أرسل رسالة' : 'Send a Message'}
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      {isAr ? 'الاسم' : 'Name'}
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      placeholder={isAr ? 'اسمك الكامل' : 'Your full name'} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      {isAr ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-3.5 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                        placeholder={isAr ? 'بريدك الإلكتروني' : 'your@email.com'}
                        className={`${inp} ${isAr ? 'pr-9' : 'pl-9'}`} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    {isAr ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
                    placeholder={isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
                    className={`${inp} resize-none`} />
                </div>

                <button type="submit" disabled={sending}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isAr ? 'إرسال الرسالة' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}