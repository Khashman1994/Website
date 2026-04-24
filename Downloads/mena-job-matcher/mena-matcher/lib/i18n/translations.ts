// lib/i18n/translations.ts

export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Meta
    siteTitle: 'AI Job Matcher | Find Your Perfect Job in MENA',
    siteDescription: 'AI-powered job matching for the Arab world. Upload your CV and find jobs that truly fit you.',

    // Header
    poweredBy: 'Powered by AI Technology',
    heroTitle: 'Find Your Perfect',
    heroTitleAccent: 'Job Match',
    heroTitleSuffix: 'with Artificial Intelligence',
    heroSubtitle: 'Upload your CV and let our AI find the best jobs for you — with precise match scores and personalized application tips tailored for the MENA market.',
    aiProfileAnalysis: 'AI Profile Analysis',
    preciseMatching: 'Precise Matching',
    smartInsights: 'Smart Insights',

    // How it works
    howItWorks: 'How It Works',
    howItWorksSubtitle: 'Three simple steps to your perfect job match',
    step1Title: 'Upload CV',
    step1Desc: 'Upload your CV as PDF or TXT. Our AI analyzes your experience and skills — in Arabic or English.',
    step2Title: 'AI Builds Your Profile',
    step2Desc: 'In seconds, the AI creates a structured profile with your strengths and ideal job roles.',
    step3Title: 'Jobs with Match Score',
    step3Desc: 'Get job recommendations sorted by AI match score — with detailed insights and application tips.',

    // Upload
    uploadTitle: 'Upload Your CV',
    uploadSubtitle: 'PDF or TXT — Arabic & English supported',
    dragDrop: 'Drag & drop your CV here',
    orClick: 'or click to browse',
    pdfTxt: 'PDF or TXT, max 10MB',
    analyzing: 'AI is analyzing your CV...',
    uploadError: 'Could not read file. Please try a PDF or TXT file.',
    apiError: 'Profile extraction failed. Please check your OpenAI key.',

    // Dashboard
    yourDashboard: 'Your Job Dashboard',
    aiActive: 'AI Active',
    back: 'Back',
    yourProfile: 'Your Profile',
    experienceLevel: 'Experience Level',
    location: 'Location',
    coreSkills: 'Core Skills',
    industries: 'Industries',
    languages: 'Languages',

    // Experience levels
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior',
    lead: 'Lead / Team Lead',
    executive: 'Executive / C-Level',

    // Filter
    filterSettings: 'Filters & Settings',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g. Dubai, Riyadh, Cairo...',
    industryLabel: 'Industry',
    allIndustries: 'All Industries',
    industryTech: 'Technology & IT',
    industryFinance: 'Finance & Banking',
    industryHealthcare: 'Healthcare',
    industryMarketing: 'Marketing & Sales',
    industryEngineering: 'Engineering',
    industryEducation: 'Education',
    industryConsulting: 'Consulting',
    industryLogistics: 'Logistics',
    industryRealEstate: 'Real Estate',
    industryEnergy: 'Oil & Energy',
    employmentType: 'Employment Type',
    fullTime: 'Full-time',
    partTime: 'Part-time',
    contract: 'Contract',
    freelance: 'Freelance',
    remoteOption: 'Remote Option',
    remoteOnly: 'Remote jobs only',
    salaryRange: 'Annual Salary (AED)',
    min: 'Min',
    max: 'Max',
    searchJobs: 'Search Jobs',
    reset: 'Reset',
    searching: 'Searching...',

    // Job results
    jobsFound: 'jobs found',
    sortedByMatch: 'Sorted by match score',
    readyToSearch: 'Ready for your perfect job?',
    readySubtitle: 'Click "Search Jobs" to get AI-powered recommendations that perfectly match your profile.',
    searchNow: 'Search Jobs Now',
    analyzingJobs: 'AI is analyzing jobs...',
    analyzingSubtitle: 'We are scanning the market and calculating your match scores',
    errorTitle: 'An error occurred',
    retry: 'Try Again',
    noResults: 'No jobs found',
    noResultsSubtitle: 'Try different filters or broaden your search criteria.',
    searchAgain: 'Search Again',
    jobsLoadError: 'Could not load jobs. Please try again.',

    // Job card
    keyMatches: 'Key Matches',
    missingSkills: 'Missing Skills',
    actionableInsight: 'Application Tip',
    showInsights: 'Show AI Insights',
    hideInsights: 'Hide Insights',
    applyNow: 'Apply Now',
    remoteTag: 'Remote',

    // Chat
    chatTitle: 'Profile Assistant',
    chatWelcome: 'Hello! I am your profile assistant. You can ask me to update your profile. For example: "Add React to my skills" or "Change my experience level to Senior".',
    chatPlaceholder: 'Update your profile...',
    chatUpdated: 'Profile updated! The changes have been applied.',
    chatError: 'Could not update profile. Please try again.',

    // Premium overlay
    premiumTitle: 'Premium Feature',
    premiumSubtitle: 'Unlock detailed AI insights and match scores',
    premiumButton: 'Unlock Premium',
    premiumBadge: 'Premium',

    // Language switcher
    switchToArabic: 'العربية',
    switchToEnglish: 'English',

    // Cookie banner
    cookieBannerTitle: 'Cookie consent',
    cookieBannerText: "We use cookies to improve your experience and analyze our traffic. By clicking 'Accept', you consent to our use of cookies.",
    cookieAccept: 'Accept All',
    cookieReject: 'Reject',
    cookieLearnMore: 'Learn more',
    cookieSettings: 'Cookie Settings',
  },

  ar: {
    // Meta
    siteTitle: 'مطابق الوظائف بالذكاء الاصطناعي | ابحث عن وظيفتك المثالية في الشرق الأوسط',
    siteDescription: 'مطابقة وظائف بالذكاء الاصطناعي للعالم العربي. ارفع سيرتك الذاتية وابحث عن الوظائف التي تناسبك حقاً.',

    // Header
    poweredBy: 'مدعوم بتقنية الذكاء الاصطناعي',
    heroTitle: 'ابحث عن',
    heroTitleAccent: 'وظيفتك المثالية',
    heroTitleSuffix: 'بالذكاء الاصطناعي',
    heroSubtitle: 'ارفع سيرتك الذاتية ودع ذكاءنا الاصطناعي يجد أفضل الوظائف لك — مع نقاط مطابقة دقيقة ونصائح تقديم شخصية مصممة لسوق الشرق الأوسط.',
    aiProfileAnalysis: 'تحليل الملف بالذكاء الاصطناعي',
    preciseMatching: 'مطابقة دقيقة',
    smartInsights: 'رؤى ذكية',

    // How it works
    howItWorks: 'كيف يعمل',
    howItWorksSubtitle: 'ثلاث خطوات بسيطة للوصول إلى وظيفتك المثالية',
    step1Title: 'ارفع سيرتك الذاتية',
    step1Desc: 'ارفع سيرتك الذاتية بصيغة PDF أو TXT. يحلل ذكاؤنا الاصطناعي خبراتك ومهاراتك — بالعربية أو الإنجليزية.',
    step2Title: 'الذكاء الاصطناعي يبني ملفك',
    step2Desc: 'في ثوانٍ، يُنشئ الذكاء الاصطناعي ملفاً منظماً بنقاط قوتك وأدوار الوظيفة المثالية لك.',
    step3Title: 'وظائف مع نقاط المطابقة',
    step3Desc: 'احصل على توصيات وظيفية مرتبة حسب نقاط المطابقة مع رؤى تفصيلية ونصائح التقديم.',

    // Upload
    uploadTitle: 'ارفع سيرتك الذاتية',
    uploadSubtitle: 'PDF أو TXT — يدعم العربية والإنجليزية',
    dragDrop: 'اسحب وأفلت سيرتك الذاتية هنا',
    orClick: 'أو انقر للاختيار',
    pdfTxt: 'PDF أو TXT، بحد أقصى 10MB',
    analyzing: 'الذكاء الاصطناعي يحلل سيرتك الذاتية...',
    uploadError: 'تعذر قراءة الملف. يرجى تجربة ملف PDF أو TXT.',
    apiError: 'فشل استخراج الملف الشخصي. يرجى التحقق من مفتاح OpenAI.',

    // Dashboard
    yourDashboard: 'لوحة تحكم الوظائف',
    aiActive: 'الذكاء الاصطناعي نشط',
    back: 'رجوع',
    yourProfile: 'ملفك الشخصي',
    experienceLevel: 'مستوى الخبرة',
    location: 'الموقع',
    coreSkills: 'المهارات الأساسية',
    industries: 'القطاعات',
    languages: 'اللغات',

    // Experience levels
    entry: 'مستوى مبتدئ',
    mid: 'مستوى متوسط',
    senior: 'سينيور',
    lead: 'قيادة / رئيس فريق',
    executive: 'تنفيذي / C-Level',

    // Filter
    filterSettings: 'الفلاتر والإعدادات',
    locationLabel: 'الموقع',
    locationPlaceholder: 'مثل: دبي، الرياض، القاهرة...',
    industryLabel: 'القطاع',
    allIndustries: 'جميع القطاعات',
    industryTech: 'التكنولوجيا وتقنية المعلومات',
    industryFinance: 'المالية والمصرفية',
    industryHealthcare: 'الرعاية الصحية',
    industryMarketing: 'التسويق والمبيعات',
    industryEngineering: 'الهندسة',
    industryEducation: 'التعليم',
    industryConsulting: 'الاستشارات',
    industryLogistics: 'الخدمات اللوجستية',
    industryRealEstate: 'العقارات',
    industryEnergy: 'النفط والطاقة',
    employmentType: 'نوع التوظيف',
    fullTime: 'دوام كامل',
    partTime: 'دوام جزئي',
    contract: 'عقد',
    freelance: 'عمل حر',
    remoteOption: 'خيار العمل عن بُعد',
    remoteOnly: 'وظائف عن بُعد فقط',
    salaryRange: 'الراتب السنوي (درهم)',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    searchJobs: 'البحث عن وظائف',
    reset: 'إعادة تعيين',
    searching: 'جارٍ البحث...',

    // Job results
    jobsFound: 'وظيفة تم العثور عليها',
    sortedByMatch: 'مرتبة حسب نقاط المطابقة',
    readyToSearch: 'هل أنت مستعد لوظيفتك المثالية؟',
    readySubtitle: 'انقر على "البحث عن وظائف" للحصول على توصيات مدعومة بالذكاء الاصطناعي تتطابق مع ملفك تماماً.',
    searchNow: 'ابحث عن وظائف الآن',
    analyzingJobs: 'الذكاء الاصطناعي يحلل الوظائف...',
    analyzingSubtitle: 'نحن نفحص السوق ونحسب نقاط المطابقة الخاصة بك',
    errorTitle: 'حدث خطأ',
    retry: 'حاول مجدداً',
    noResults: 'لا توجد وظائف',
    noResultsSubtitle: 'جرّب فلاتر مختلفة أو وسّع معايير البحث.',
    searchAgain: 'ابحث مجدداً',
    jobsLoadError: 'تعذر تحميل الوظائف. يرجى المحاولة مجدداً.',

    // Job card
    keyMatches: 'نقاط التوافق',
    missingSkills: 'المهارات المطلوبة',
    actionableInsight: 'نصيحة التقديم',
    showInsights: 'عرض رؤى الذكاء الاصطناعي',
    hideInsights: 'إخفاء الرؤى',
    applyNow: 'تقدم الآن',
    remoteTag: 'عن بُعد',

    // Chat
    chatTitle: 'مساعد الملف الشخصي',
    chatWelcome: 'مرحباً! أنا مساعدك الشخصي. يمكنك أن تطلب مني تحديث ملفك. مثلاً: "أضف React إلى مهاراتي" أو "غيّر مستوى خبرتي إلى سينيور".',
    chatPlaceholder: 'حدّث ملفك الشخصي...',
    chatUpdated: 'تم تحديث الملف الشخصي! تم تطبيق التغييرات.',
    chatError: 'تعذر تحديث الملف الشخصي. يرجى المحاولة مجدداً.',

    // Premium overlay
    premiumTitle: 'ميزة مميزة',
    premiumSubtitle: 'افتح رؤى الذكاء الاصطناعي التفصيلية ونقاط المطابقة',
    premiumButton: 'فتح الميزات المميزة',
    premiumBadge: 'مميز',

    // Language switcher
    switchToArabic: 'العربية',
    switchToEnglish: 'English',

    // Cookie banner
    cookieBannerTitle: 'موافقة ملفات تعريف الارتباط',
    cookieBannerText: "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور الخاصة بنا. بالنقر على 'قبول'، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
    cookieAccept: 'قبول الكل',
    cookieReject: 'رفض',
    cookieLearnMore: 'اعرف المزيد',
    cookieSettings: 'إعدادات ملفات تعريف الارتباط',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Translations = { [K in keyof typeof translations.en]: string };