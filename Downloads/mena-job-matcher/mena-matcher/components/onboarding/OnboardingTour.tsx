'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

const TOUR_KEY = 'menajob_tour_done';

type Step = {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

const STEPS_EN: Step[] = [
  {
    target:    '#tour-profile',
    title:     '👋 Welcome to MenaJob AI!',
    content:   'Start by filling out your Smart Profile or uploading your CV so our AI can find the perfect jobs for you.',
    placement: 'center',
  },
  {
    target:    '#tour-search',
    title:     '🔍 Start Your Job Search',
    content:   'Let the magic happen! Search for your dream job in the MENA region. You have 2 free AI searches!',
    placement: 'bottom',
  },
  {
    target:    '#tour-results',
    title:     '⭐ Your Match Score',
    content:   'Look for your Match Score on each job. Upgrade to Premium ($4.99) to see all hidden company names and apply directly.',
    placement: 'top',
  },
];

const STEPS_AR: Step[] = [
  {
    target:    '#tour-profile',
    title:     '👋 مرحباً بك في MenaJob AI!',
    content:   'ابدأ بملء ملفك الذكي أو رفع سيرتك الذاتية حتى يتمكن الذكاء الاصطناعي من إيجاد أفضل الوظائف لك.',
    placement: 'center',
  },
  {
    target:    '#tour-search',
    title:     '🔍 ابدأ البحث عن وظيفة',
    content:   'دع السحر يحدث! ابحث عن وظيفة أحلامك في منطقة الشرق الأوسط. لديك بحثان مجانيان!',
    placement: 'bottom',
  },
  {
    target:    '#tour-results',
    title:     '⭐ درجة التطابق',
    content:   'ابحث عن درجة التطابق في كل وظيفة. قم بالترقية مقابل 4.99$ لرؤية أسماء الشركات المخفية.',
    placement: 'top',
  },
];

export function OnboardingTour({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const steps    = isAr ? STEPS_AR : STEPS_EN;

  const [visible,      setVisible]      = useState(false);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isLoggedIn) return;
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!visible) return;
    positionTooltip();
  }, [visible, currentStep]);

  const positionTooltip = () => {
    const step = steps[currentStep];
    const placement = step.placement ?? 'bottom';
    const TW = 320;
    const TH = 160;

    // Center placement — no element needed
    if (placement === 'center') {
      setTooltipStyle({
        top:  window.innerHeight / 2 - TH / 2,
        left: window.innerWidth  / 2 - TW / 2,
      });
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Use getBoundingClientRect — already viewport-relative, no scroll offset needed
    const rect = el.getBoundingClientRect();

    let top  = 0;
    let left = 0;

    if (placement === 'bottom') {
      top  = rect.bottom + 12;
      left = rect.left + rect.width / 2 - TW / 2;
    } else if (placement === 'top') {
      top  = rect.top - TH - 12;
      left = rect.left + rect.width / 2 - TW / 2;
    } else if (placement === 'right') {
      top  = rect.top + rect.height / 2 - TH / 2;
      left = rect.right + 12;
    } else {
      top  = rect.top + rect.height / 2 - TH / 2;
      left = rect.left - TW - 12;
    }

    // Keep within viewport
    left = Math.max(12, Math.min(left, window.innerWidth  - TW - 12));
    top  = Math.max(12, Math.min(top,  window.innerHeight - TH - 12));

    setTooltipStyle({ top, left });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const finish = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
  };

  if (!isLoggedIn || !visible) return null;

  const step = steps[currentStep];
  const el   = document.querySelector(step.target);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Highlight the target element */}
        {el && (() => {
          const rect = el.getBoundingClientRect();
          return (
            <div
              className="absolute rounded-xl ring-4 ring-orange-400 ring-offset-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              style={{
                top:    rect.top  + window.scrollY,
                left:   rect.left + window.scrollX,
                width:  rect.width,
                height: rect.height,
              }}
            />
          );
        })()}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-80 bg-white rounded-2xl shadow-2xl p-5 pointer-events-auto"
        style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-base leading-snug">{step.title}</h3>
          <button onClick={finish} className="text-slate-300 hover:text-slate-500 text-lg leading-none ml-2 flex-shrink-0">×</button>
        </div>

        {/* Content */}
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{step.content}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-orange-500 w-4' : 'bg-slate-200'}`} />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={finish}
            className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
          >
            {isAr ? 'تخطي' : 'Skip tour'}
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
              >
                {isAr ? 'رجوع' : 'Back'}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
            >
              {currentStep === steps.length - 1
                ? (isAr ? 'إنهاء' : 'Finish')
                : (isAr ? 'التالي' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}