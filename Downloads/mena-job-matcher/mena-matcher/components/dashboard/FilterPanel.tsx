'use client';
// components/dashboard/FilterPanel.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JobFilters } from '@/lib/types';
import { Filter, MapPin, Briefcase, Home, DollarSign, ChevronDown, X } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { MENA_LOCATIONS, COUNTRY_LABELS, CountryCode, LangKey } from '@/lib/locations';

// Inline flags to avoid import issues
const COUNTRY_FLAGS: Record<CountryCode, string> = {
  SA:'🇸🇦', AE:'🇦🇪', EG:'🇪🇬', QA:'🇶🇦', KW:'🇰🇼',
  BH:'🇧🇭', OM:'🇴🇲', JO:'🇯🇴', LB:'🇱🇧', IQ:'🇮🇶',
  LY:'🇱🇾', TN:'🇹🇳', DZ:'🇩🇿', MA:'🇲🇦',
};

// ─── Searchable Location Combobox ─────────────────────────────────────────────
interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  lang: LangKey;
}

function LocationCombobox({ value, onChange, lang }: ComboboxProps) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const ref                 = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Filtered locations — matches EN or AR name
  const filtered = search.trim().length === 0
    ? MENA_LOCATIONS
    : MENA_LOCATIONS.filter((loc) =>
        loc.en.toLowerCase().includes(search.toLowerCase()) ||
        loc.ar.includes(search) ||
        loc.value.toLowerCase().includes(search.toLowerCase())
      );

  // Countries that have at least one visible result
  const visibleCountries = (
    ['SA','AE','EG','QA','KW','BH','OM','JO','LB','IQ','MA','TN','DZ','LY'] as CountryCode[]
  ).filter((c) => filtered.some((l) => l.country === c));

  // Display label for current value
  const selectedLoc = MENA_LOCATIONS.find((l) => l.value === value);
  const selectedFlag = selectedLoc ? COUNTRY_FLAGS[selectedLoc.country] + ' ' : '';
  const selectedLabel = value
    ? selectedFlag + (selectedLoc?.[lang] ?? value)
    : (lang === 'ar' ? '🇸🇦 كل المملكة العربية السعودية' : '🇸🇦 All Saudi Arabia');

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setSearch('');
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  }, [onChange]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full flex items-center justify-between px-3 py-2 border border-neutral-300 rounded-lg bg-white text-sm hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
      >
        <span className={value ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedLabel}
        </span>
        <span className="flex items-center gap-1">
          {value && (
            <X
              className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-neutral-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن مدينة...' : 'Search city...'}
              className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Options list */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {visibleCountries.length === 0 && (
              <li className="px-4 py-3 text-sm text-neutral-400 text-center">
                {lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </li>
            )}

            {visibleCountries.map((country) => (
              <li key={country}>
                {/* Country header */}
                <div className="px-3 py-2 text-sm font-bold text-neutral-700 bg-neutral-100 border-t border-neutral-200 flex items-center gap-2">
                  <span className="text-base">{COUNTRY_FLAGS[country]}</span>
                  <span>{COUNTRY_LABELS[country][lang].replace(/^[\p{Emoji}]\s*/u, '')}</span>
                </div>
                {/* Cities */}
                {filtered
                  .filter((loc) => loc.country === country)
                  .map((loc) => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => handleSelect(loc.value)}
                      className={`w-full text-start px-5 py-2 text-sm hover:bg-primary-50 transition-colors ${
                        value === loc.value
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-neutral-700'
                      }`}
                    >
                      {COUNTRY_FLAGS[loc.country]} {loc[lang]}
                    </button>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Currency helper ──────────────────────────────────────────────────────────
const LOCATION_CURRENCY: Record<string, { code: string; en: string; ar: string }> = {
  // UAE
  'UAE':                    { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Dubai, UAE':             { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Abu Dhabi, UAE':         { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Sharjah, UAE':           { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Ajman, UAE':             { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Ras Al Khaimah, UAE':    { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Fujairah, UAE':          { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  'Umm Al Quwain, UAE':     { code: 'AED', en: 'AED (د.إ)',   ar: 'درهم إماراتي'       },
  // Saudi Arabia
  'Saudi Arabia':           { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Riyadh, Saudi Arabia':   { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Jeddah, Saudi Arabia':   { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Dammam, Saudi Arabia':   { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Khobar, Saudi Arabia':   { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Mecca, Saudi Arabia':    { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Medina, Saudi Arabia':   { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Abha, Saudi Arabia':     { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'Taif, Saudi Arabia':     { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  'NEOM, Saudi Arabia':     { code: 'SAR', en: 'SAR (ر.س)',   ar: 'ريال سعودي'         },
  // Kuwait
  'Kuwait':                 { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  'Kuwait City, Kuwait':    { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  'Hawalli, Kuwait':        { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  'Salmiya, Kuwait':        { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  'Farwaniya, Kuwait':      { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  'Ahmadi, Kuwait':         { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  'Jahra, Kuwait':          { code: 'KWD', en: 'KWD (د.ك)',   ar: 'دينار كويتي'        },
  // Qatar
  'Qatar':                  { code: 'QAR', en: 'QAR (ر.ق)',   ar: 'ريال قطري'          },
  'Doha, Qatar':            { code: 'QAR', en: 'QAR (ر.ق)',   ar: 'ريال قطري'          },
  'Lusail, Qatar':          { code: 'QAR', en: 'QAR (ر.ق)',   ar: 'ريال قطري'          },
  'Al Wakra, Qatar':        { code: 'QAR', en: 'QAR (ر.ق)',   ar: 'ريال قطري'          },
  'Al Rayyan, Qatar':       { code: 'QAR', en: 'QAR (ر.ق)',   ar: 'ريال قطري'          },
  // Bahrain
  'Bahrain':                { code: 'BHD', en: 'BHD (د.ب)',   ar: 'دينار بحريني'       },
  'Manama, Bahrain':        { code: 'BHD', en: 'BHD (د.ب)',   ar: 'دينار بحريني'       },
  'Riffa, Bahrain':         { code: 'BHD', en: 'BHD (د.ب)',   ar: 'دينار بحريني'       },
  'Muharraq, Bahrain':      { code: 'BHD', en: 'BHD (د.ب)',   ar: 'دينار بحريني'       },
  // Oman
  'Oman':                   { code: 'OMR', en: 'OMR (ر.ع)',   ar: 'ريال عُماني'        },
  'Muscat, Oman':           { code: 'OMR', en: 'OMR (ر.ع)',   ar: 'ريال عُماني'        },
  // Egypt
  'Egypt':                  { code: 'EGP', en: 'EGP (ج.م)',   ar: 'جنيه مصري'          },
  'Cairo, Egypt':           { code: 'EGP', en: 'EGP (ج.م)',   ar: 'جنيه مصري'          },
  'Alexandria, Egypt':      { code: 'EGP', en: 'EGP (ج.م)',   ar: 'جنيه مصري'          },
  // Jordan
  'Jordan':                 { code: 'JOD', en: 'JOD (د.أ)',   ar: 'دينار أردني'        },
  'Amman, Jordan':          { code: 'JOD', en: 'JOD (د.أ)',   ar: 'دينار أردني'        },
  // Morocco
  'Morocco':                { code: 'MAD', en: 'MAD (د.م)',   ar: 'درهم مغربي'         },
  'Casablanca, Morocco':    { code: 'MAD', en: 'MAD (د.م)',   ar: 'درهم مغربي'         },
};

const DEFAULT_CURRENCY = { code: 'USD', en: 'USD ($)', ar: 'دولار أمريكي' };

function getCurrency(location: string, lang: string) {
  const c = LOCATION_CURRENCY[location] ?? DEFAULT_CURRENCY;
  return { code: c.code, label: lang === 'ar' ? c.ar : c.en };
}

// ─── Main FilterPanel ─────────────────────────────────────────────────────────
interface FilterPanelProps {
  onApplyFilters: (filters: JobFilters) => void;
  isLoading?: boolean;
  initialKeyword?: string;
}

export function FilterPanel({ onApplyFilters, isLoading, initialKeyword = '' }: FilterPanelProps) {
  const { t, lang } = useLang();
  const isAr = lang === 'ar';
  const [keyword,        setKeyword]        = useState(initialKeyword);
  const [location,       setLocation]       = useState('Saudi Arabia');
  const [industry,       setIndustry]       = useState('');
  const [employmentType, setEmploymentType] = useState<JobFilters['employmentType']>();
  const [remote,         setRemote]         = useState<boolean | undefined>();
  const [salaryMin,      setSalaryMin]      = useState('');
  const [salaryMax,      setSalaryMax]      = useState('');

  // Update keyword when analyzeJob title arrives (async)
  useEffect(() => {
    if (initialKeyword) setKeyword(initialKeyword);
  }, [initialKeyword]);

  // Dynamic currency based on selected location
  const currency = getCurrency(location, lang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: JobFilters = {};
    if (keyword)        filters.keyword        = keyword;
    filters.location = location || 'Saudi Arabia';
    if (industry)       filters.industry       = industry;
    if (employmentType) filters.employmentType = employmentType;
    if (remote !== undefined) filters.remote   = remote;
    if (salaryMin)      filters.salaryMin      = parseInt(salaryMin);
    if (salaryMax)      filters.salaryMax      = parseInt(salaryMax);
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('Saudi Arabia');
    setIndustry(''); setEmploymentType(undefined);
    setRemote(undefined); setSalaryMin(''); setSalaryMax('');
    onApplyFilters({ location: 'Saudi Arabia' });
  };

  const industries = [
    { value: '',           label: t.allIndustries  },
    { value: 'tech',       label: t.industryTech   },
    { value: 'finance',    label: t.industryFinance },
    { value: 'healthcare', label: t.industryHealthcare },
    { value: 'marketing',  label: t.industryMarketing },
    { value: 'engineering',label: t.industryEngineering },
    { value: 'education',  label: t.industryEducation },
    { value: 'consulting', label: t.industryConsulting },
    { value: 'logistics',  label: t.industryLogistics },
    { value: 'realestate', label: t.industryRealEstate },
    { value: 'energy',     label: t.industryEnergy },
  ];

  const employmentTypes = [
    { value: 'full-time', label: t.fullTime  },
    { value: 'part-time', label: t.partTime  },
    { value: 'contract',  label: t.contract  },
    { value: 'freelance', label: t.freelance },
  ];

  return (
    <Card>
      <CardHeader className="bg-secondary-50">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-secondary-700 flex-shrink-0" />
          <h3 className="font-semibold text-neutral-900">{t.filterSettings}</h3>
        </div>
      </CardHeader>

      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Keyword / Target Job Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              {isAr ? 'المسمى الوظيفي أو الكلمات المفتاحية' : 'Target Job Title or Keywords'}
            </label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder={isAr ? 'مثال: محاسب، سائق مكتب...' : 'e.g., Accountant, Office Driver...'}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Location — Searchable Combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {t.locationLabel}
            </label>
            <LocationCombobox
              value={location}
              onChange={setLocation}
              lang={lang as LangKey}
            />
          </div>

          {/* Industry */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              {t.industryLabel}
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {industries.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {t.employmentType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {employmentTypes.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    value={type.value}
                    checked={employmentType === type.value}
                    onChange={(e) => setEmploymentType(e.target.value as any)}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remote */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Home className="w-4 h-4 flex-shrink-0" />
              {t.remoteOption}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remote === true}
                onChange={(e) => setRemote(e.target.checked ? true : undefined)}
                className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{t.remoteOnly}</span>
            </label>
          </div>

          {/* Salary */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              {lang === 'ar' ? `الراتب السنوي (${currency.label})` : `Annual Salary (${currency.label})`}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder={t.min}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder={t.max}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? t.searching : t.searchJobs}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
              {t.reset}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
