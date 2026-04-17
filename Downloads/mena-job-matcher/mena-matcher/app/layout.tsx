// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'MENA Job Matcher | مطابق الوظائف بالذكاء الاصطناعي',
  description: 'AI-powered job matching for the Arab world — UAE, Saudi Arabia, Egypt and beyond.',
  keywords: ['Jobs', 'MENA', 'Dubai', 'Riyadh', 'Cairo', 'AI Matching', 'وظائف', 'الشرق الأوسط'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* EN: Inter (clean, modern SaaS feel) + DM Serif Display (headings) */}
        {/* AR: Cairo (best Arabic web font — clear, professional) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}