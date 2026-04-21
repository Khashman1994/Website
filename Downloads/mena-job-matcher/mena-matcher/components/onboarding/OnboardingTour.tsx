'use client';
import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLang } from '@/lib/i18n/LanguageContext';

const TOUR_KEY = 'menajob_tour_done';

const STEPS_EN: Step[] = [
  {
    target:    '#tour-profile',
    title:     '👋 Welcome to MenaJob AI!',
    content:   'Start by filling out your Smart Profile or uploading your CV so our AI can find the perfect jobs for you.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target:    '#tour-search',
    title:     '🔍 Start Your Job Search',
    content:   'Let the magic happen! Search for your dream job in the MENA region. You have 2 free AI searches!',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target:    '#tour-results',
    title:     '⭐ Your Match Score',
    content:   'Look for your Match Score on each job. Upgrade to Premium ($4.99) to see all hidden company names and apply directly.',
    placement: 'top',
    disableBeacon: true,
  },
];

const STEPS_AR: Step[] = [
  {
    target:    '#tour-profile',
    title:     '👋 مرحباً بك في MenaJob AI!',
    content:   'ابدأ بملء ملفك الذكي أو رفع سيرتك الذاتية حتى يتمكن الذكاء الاصطناعي من إيجاد أفضل الوظائف لك.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target:    '#tour-search',
    title:     '🔍 ابدأ البحث عن وظيفة',
    content:   'دع السحر يحدث! ابحث عن وظيفة أحلامك في منطقة الشرق الأوسط. لديك بحثان مجانيان بالذكاء الاصطناعي!',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target:    '#tour-results',
    title:     '⭐ درجة التطابق',
    content:   'ابحث عن درجة التطابق في كل وظيفة. قم بالترقية مقابل 4.99$ لرؤية أسماء الشركات المخفية والتقديم مباشرة.',
    placement: 'top',
    disableBeacon: true,
  },
];

export function OnboardingTour({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    // Only run once per browser
    if (localStorage.getItem(TOUR_KEY)) return;
    // Small delay so dashboard fully renders before tour starts
    const t = setTimeout(() => setRun(true), 1500);
    return () => clearTimeout(t);
  }, [isLoggedIn]);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(TOUR_KEY, 'true');
      setRun(false);
    }
  };

  if (!isLoggedIn || !run) return null;

  return (
    <Joyride
      steps={isAr ? STEPS_AR : STEPS_EN}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      locale={{
        back:  isAr ? 'رجوع'  : 'Back',
        close: isAr ? 'إغلاق' : 'Close',
        last:  isAr ? 'إنهاء' : 'Finish',
        next:  isAr ? 'التالي': 'Next',
        skip:  isAr ? 'تخطي'  : 'Skip tour',
      }}
      styles={{
        options: {
          primaryColor:    '#f97316',   // orange-500
          backgroundColor: '#ffffff',
          textColor:       '#1e293b',   // slate-900
          arrowColor:      '#ffffff',
          zIndex:          9999,
        },
        tooltip: {
          borderRadius: '16px',
          padding:      '20px 24px',
          boxShadow:    '0 20px 60px rgba(0,0,0,0.15)',
          maxWidth:     '320px',
        },
        tooltipTitle: {
          fontSize:   '16px',
          fontWeight: '700',
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize:   '14px',
          lineHeight: '1.6',
          color:      '#475569',
        },
        buttonNext: {
          backgroundColor: '#f97316',
          borderRadius:    '10px',
          padding:         '10px 20px',
          fontWeight:      '600',
          fontSize:        '14px',
        },
        buttonBack: {
          color:      '#94a3b8',
          marginRight: '8px',
          fontSize:   '14px',
        },
        buttonSkip: {
          color:    '#94a3b8',
          fontSize: '13px',
        },
        spotlight: {
          borderRadius: '12px',
        },
      }}
    />
  );
}
