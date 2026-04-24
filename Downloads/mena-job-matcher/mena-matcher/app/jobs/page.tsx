'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Sparkles, ExternalLink, ChevronRight, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Job } from '@/lib/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLang } from '@/lib/i18n/LanguageContext';

const INDUSTRIES = [
  'All', 'Marketing', 'Technology', 'Finance', 'Sales', 'Engineering',
  'Healthcare', 'Education', 'Design', 'Operations', 'HR', 'Legal',
];

const COUNTRIES = [
  { value: '', label: 'All Locations' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'ae', label: 'UAE' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'qa', label: 'Qatar' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'om', label: 'Oman' },
  { value: 'eg', label: 'Egypt' },
  { value: 'jo', label: 'Jordan' },
  { value: 'lb', label: 'Lebanon' },
];

const PAGE_SIZE = 20;

export default function JobsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const i18n = {
    aiCardTitle:  isAr ? 'المطابقة الذكية للوظائف'  : 'AI Job Matching',
    aiCardDesc:   isAr
      ? 'ابحث عن وظيفة أحلامك بشكل أسرع! استخدم نظام المطابقة بالذكاء الاصطناعي لتحليل ملفك الشخصي بدقة.'
      : 'Find your dream job faster! Use our AI job matching for a precise analysis of your profile.',
    aiCardBtn:    isAr ? 'جرب المطابقة الذكية' : 'Try AI Matcher',
    browseTitle:  isAr ? 'تصفح الوظائف في منطقة MENA' : 'Browse Jobs in MENA',
    openPositions: isAr ? 'وظيفة شاغرة' : 'open positions',
    searchPlaceholder: isAr ? 'المسمى الوظيفي أو الكلمة المفتاحية...' : 'Job title or keyword...',
    allLocations: isAr ? 'كل المواقع' : 'All Locations',
    industry:     isAr ? 'القطاع' : 'Industry',
    search:       isAr ? 'بحث' : 'Search',
    jobsFound:    isAr ? 'وظيفة متاحة' : 'jobs found',
    loading:      isAr ? 'جار التحميل...' : 'Loading...',
    noJobs:       isAr ? 'لا توجد وظائف' : 'No jobs found',
    adjustFilters: isAr ? 'جرب تعديل الفلاتر' : 'Try adjusting your filters',
    viewDetails:  isAr ? 'عرض التفاصيل' : 'View Details',
    apply:        isAr ? 'تقدم' : 'Apply',
    prev:         isAr ? 'السابق ←' : '← Prev',
    next:         isAr ? '→ التالي' : 'Next →',
    page:         isAr ? 'صفحة' : 'Page',
    of:           isAr ? 'من' : 'of',
  };
  const [jobs,       setJobs]       = useState<Job[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(0);
  const [keyword,    setKeyword]    = useState('');
  const [country,    setCountry]    = useState('');
  const [industry,   setIndustry]   = useState('All');
  const [search,     setSearch]     = useState({ keyword: '', country: '', industry: 'All' });

  const fetchJobs = useCallback(async (kw: string, ct: string, ind: string, pg: number) => {
    setLoading(true);
    try {
      const sb = createClient();
      let q = sb
        .from('jobs')
        .select('*', { count: 'exact' })
        .gt('expires_at', new Date().toISOString())
        .order('posted_at', { ascending: false })
        .range(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE - 1);

      if (kw)                q = q.ilike('title', `%${kw}%`);
      if (ct)                q = q.eq('country', ct);
      if (ind !== 'All')     q = q.ilike('industry', `%${ind}%`);

      const { data, count } = await q;
      setJobs((data ?? []) as unknown as Job[]);
      setTotal(count ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(search.keyword, search.country, search.industry, page);
  }, [search, page, fetchJobs]);

  const handleSearch = () => {
    setPage(0);
    setSearch({ keyword, country, industry });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-24 pb-10 px-4">
        <div className="max-w-5xl mx-auto text-center" dir={isAr ? 'rtl' : 'ltr'}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {i18n.browseTitle}
          </h1>
          <p className="text-slate-400 mb-8">{total.toLocaleString()} {i18n.openPositions}</p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-3 flex flex-col sm:flex-row gap-2 shadow-xl max-w-3xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={i18n.searchPlaceholder}
                className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="outline-none text-sm text-slate-700 bg-transparent"
              >
                {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95"
            >
              {i18n.search}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">

          {/* AI Upsell CTA */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">{i18n.aiCardTitle}</span>
            </div>
            <p className="text-orange-100 text-xs leading-relaxed mb-4">
              {i18n.aiCardDesc}
            </p>
            <Link
              href="/"
              className="block text-center bg-white text-orange-600 font-bold text-xs py-2 rounded-xl hover:bg-orange-50 transition-colors"
            >
              {i18n.aiCardBtn} →
            </Link>
          </div>

          {/* Industry Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-sm text-slate-700">{i18n.industry}</span>
            </div>
            <div className="space-y-1">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => { setIndustry(ind); setPage(0); setSearch(s => ({ ...s, industry: ind })); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    industry === ind
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* For Employers — Coming Soon */}
          {/* TODO: Job posting for employers
          <div className="bg-slate-100 rounded-2xl p-4 border-2 border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-500">For Employers</p>
            <p className="text-xs text-slate-400 mt-1">Job inserieren — Coming Soon</p>
          </div>
          */}
        </aside>

        {/* Job List */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {loading ? i18n.loading : `${total.toLocaleString()} ${i18n.jobsFound}`}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-lg mb-2">{i18n.noJobs}</p>
              <p className="text-slate-400 text-sm">{i18n.adjustFilters}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/jobs/${job.id}`} className="font-bold text-slate-900 hover:text-orange-500 transition-colors line-clamp-1">
                        {job.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Building2 className="w-3 h-3" />{job.company}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />{job.location}
                        </span>
                        {job.employmentType && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {job.employmentType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{job.description?.slice(0, 120)}...</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap"
                      >
                        🔒 {i18n.viewDetails} <ChevronRight className="w-3 h-3" />
                      </Link>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 whitespace-nowrap"
                      >
                        {i18n.apply} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                {i18n.prev}
              </button>
              <span className="text-sm text-slate-500">
                {i18n.page} {page + 1} {i18n.of} {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                {i18n.next}
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
