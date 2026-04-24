// app/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { CookieBanner } from '@/components/ui/CookieBanner';

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
        <Script id="gtag-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
            });
          `}
        </Script>
        <LanguageProvider>
          {children}
          <CookieBanner />
        </LanguageProvider>
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-S14NGZGVME" />
    </html>
  );
}