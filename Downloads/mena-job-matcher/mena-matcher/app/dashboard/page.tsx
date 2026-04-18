'use client';
// app/dashboard/page.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SessionTimeout } from '@/components/SessionTimeout';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { JobCard } from '@/components/dashboard/JobCard';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ChatAssistant } from '@/components/dashboard/ChatAssistant';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { UserProfile, JobMatch, JobFilters } from '@/lib/types';
import { Search, Loader2, AlertCircle, LogOut, Upload, Sparkles, X, UploadCloud, AlertTriangle, Heart } from 'lucide-react';
import { JobListSkeleton } from '@/components/dashboard/SkeletonLoader';
import { ToastContainer } from '@/components/ui/Toast';
import { AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/i18n/translations';
import { createClient, loadProfile, saveProfile, loadSavedJobs, loadSavedJobIds } from '@/lib/supabase';

type Tab = 'all' | 'saved';

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const isAr = lang === 'ar';

  const [profile,           setProfile]           = useState<UserProfile | null>(null);
  const [jobs,              setJobs]              = useState<JobMatch[]>([]);
  const [allFetchedJobs,    setAllFetchedJobs]    = useState<JobMatch[]>([]); // full pool for city filtering
  const [lastCountryFilter, setLastCountryFilter] = useState<string>('');     // track which country was fetched
  const [jobTiers,          setJobTiers]          = useState<{ topCount: number; possibleCount: number } | null>(null);
  const [matchesLeft,       setMatchesLeft]       = useState<number | null>(null); // null = no limit (pro)
  const [showPaywall,       setShowPaywall]       = useState(false);
  const [userTier,          setUserTier]          = useState<'free'|'pro'>('free');
  const [userCredits,       setUserCredits]       = useState(0);
  const [unlockedJobIds,    setUnlockedJobIds]    = useState<Set<string>>(new Set());
  const [savedJobs,         setSavedJobs]         = useState<JobMatch[]>([]);
  const [savedJobIds,       setSavedJobIds]       = useState<Set<string>>(new Set());
  const [activeTab,         setActiveTab]         = useState<Tab>('all');
  const [isLoadingJobs,     setIsLoadingJobs]     = useState(false);
  const [isLoadingSaved,    setIsLoadingSaved]    = useState(false);
  const [isLoadingInit,     setIsLoadingInit]     = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [hasSearched,       setHasSearched]       = useState(false);
  const [userEmail,         setUserEmail]         = useState<string | null>(null);
  const [isLoggedIn,        setIsLoggedIn]        = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toasts,            setToasts]            = useState<{ id: string; message: string; undoLabel?: string; onUndo?: () => void }[]>([]);

  const addToast = (message: string, undoLabel?: string, onUndo?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, undoLabel, onUndo }]);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Init — Database First ─────────────────────────────────────────────────
  useEffect(() => {
    // Handle payment return from MyFatoorah
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get('payment');
      const credits = params.get('credits');
      if (payment === 'success') {
        const msg = credits
          ? `🎉 ${lang === 'ar' ? `تم إضافة ${credits} نجمة لحسابك!` : `${credits} Stars added to your account!`}`
          : `🎉 ${lang === 'ar' ? 'تم تفعيل الخطة بنجاح!' : 'Plan activated successfully!'}`;
        addToast(msg);
        // Reload credits from DB
        setUserCredits(prev => prev + Number(credits ?? 0));
      } else if (payment === 'failed') {
        addToast(`❌ ${lang === 'ar' ? 'فشلت عملية الدفع. يرجى المحاولة مجدداً.' : 'Payment failed. Please try again.'}`);
      } else if (params.get('upgraded') === 'true') {
        addToast(`🎉 ${lang === 'ar' ? 'تم تفعيل الخطة بنجاح! 500 نجمة أضيفت لحسابك' : 'Pro plan activated! 500 Stars added.'}`);
      }
      if (payment || params.get('upgraded')) {
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);
  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();

        // Retry once after 800ms — middleware cookie refresh may not have
        // propagated to the client on the very first render after page reload
        let { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user && !authError) {
          await new Promise(r => setTimeout(r, 800));
          ({ data: { user }, error: authError } = await supabase.auth.getUser());
        }

        if (authError) console.warn('[dashboard] auth error:', authError.message);

        if (user) {
          setIsLoggedIn(true);
          setUserEmail(user.email ?? null);

          const savedLang = sessionStorage.getItem('userLang') as Language | null;
          if (savedLang) setLang(savedLang);

          // Load everything in parallel — don't show UI until done
          const [dbProfile, savedIds, initialSavedJobs] = await Promise.all([
            loadProfile(),
            loadSavedJobIds(),
            loadSavedJobs(),
          ]);

          console.log('[dashboard] DB profile:', dbProfile?.name ?? 'none');
          console.log('[dashboard] Saved job IDs:', savedIds.size);
          console.log('[dashboard] Saved jobs loaded:', initialSavedJobs.length);

          if (dbProfile) {
            setProfile(dbProfile);
            sessionStorage.setItem('userProfile', JSON.stringify(dbProfile));
          } else {
            const cached = sessionStorage.getItem('userProfile');
            if (cached) {
              try { setProfile(JSON.parse(cached)); } catch {}
            }
          }

          setSavedJobIds(savedIds);
          setSavedJobs(initialSavedJobs);

          // ── Restore session state (jobs + unlocked) ───────────────────────
          try {
            const sJobs     = sessionStorage.getItem('mena_session_jobs');
            const sUnlocked = sessionStorage.getItem('mena_unlocked_ids');
            const sFilter   = sessionStorage.getItem('mena_last_country');
            const sSearched = sessionStorage.getItem('mena_has_searched');
            if (sJobs) {
              const parsed = JSON.parse(sJobs) as JobMatch[];
              setJobs(parsed);
              setAllFetchedJobs(parsed);
              setHasSearched(true);
            } else if (sSearched === 'true') {
              setHasSearched(true);
            }
            if (sUnlocked) setUnlockedJobIds(new Set(JSON.parse(sUnlocked)));
            if (sFilter)   setLastCountryFilter(sFilter);
          } catch { /* non-blocking */ }

          // Load monetization data
          try {
            const supabaseMono = createClient();
            const { data: mono } = await supabaseMono
              .from('profiles')
              .select('tier, credits, free_matches_used')
              .eq('user_id', user.id)
              .single();
            if (mono) {
              setUserTier(mono.tier ?? 'free');
              setUserCredits(mono.credits ?? 0);
              if (mono.tier === 'free') {
                setMatchesLeft(Math.max(0, 5 - (mono.free_matches_used ?? 0)));
              }
            }
          } catch { /* non-blocking */ }

        } else {
          // No Supabase session — check sessionStorage before redirecting
          // (handles brief auth hydration lag on refresh)
          const cached    = sessionStorage.getItem('userProfile');
          const savedLang = sessionStorage.getItem('userLang') as Language | null;
          if (cached) {
            try {
              setProfile(JSON.parse(cached));
              if (savedLang) setLang(savedLang);
              // Don't redirect — let middleware handle auth protection
              // The profile from sessionStorage is enough to show the UI
            } catch {
              // Corrupted cache — clear and redirect only as last resort
              sessionStorage.removeItem('userProfile');
              router.replace('/login');
              return;
            }
          } else {
            // Truly no session and no cached profile → middleware already
            // redirected, but just in case:
            router.replace('/login');
            return;
          }
        }
      } catch (err) {
        console.error('[dashboard] Init error:', err);
        // Never sign out on error — just try sessionStorage
        const cached = sessionStorage.getItem('userProfile');
        if (cached) {
          try { setProfile(JSON.parse(cached)); } catch {}
        } else {
          router.replace('/login');
          return;
        }
      } finally {
        setIsLoadingInit(false);
      }
    }
    init();
  }, []);

  const handleProfileUpdate = useCallback((updated: UserProfile) => {
    setProfile(updated);
    sessionStorage.setItem('userProfile', JSON.stringify(updated));
    if (isLoggedIn) saveProfile(updated).catch(console.error);
  }, [isLoggedIn]);

  // ── Sign out — clear all local state ──────────────────────────────────────
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear all state
    setProfile(null);
    setJobs([]);
    setAllFetchedJobs([]);
    setLastCountryFilter('');
    setSavedJobs([]);
    setSavedJobIds(new Set());
    setHasSearched(false);
    setActiveTab('all');
    setError(null);
    // Clear storage
    sessionStorage.clear();
    localStorage.removeItem('mena-lang');
    router.push('/');
  };

  const handleSearchJobs = async (filters?: JobFilters) => {
    if (!profile) return;
    setActiveTab('all');
    setError(null);
    setHasSearched(true);

    const location = filters?.location ?? '';

    // ── City-level filter: use existing pool, no API call ──────────────────
    // A city location contains a comma e.g. "Dubai, UAE" or "Riyadh, Saudi Arabia"
    const isCity    = location.includes(',');
    const cityCountry = isCity ? location.split(',').pop()?.trim() ?? '' : '';

    if (isCity && allFetchedJobs.length > 0 && (cityCountry === lastCountryFilter || lastCountryFilter === '')) {
      console.log(`[dashboard] Local city filter: "${location}" from ${allFetchedJobs.length} pooled jobs`);
      const cityLow = location.split(',')[0].toLowerCase().trim();
      const filtered = allFetchedJobs.filter(j =>
        j.location.toLowerCase().includes(cityLow)
      );
      console.log(`[dashboard] City filter "${cityLow}": ${filtered.length}/${allFetchedJobs.length} jobs`);
      // Sort by matchScore (already scored in pool)
      const sorted = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
      setJobs(sorted);
      setJobTiers({ topCount: sorted.filter(j => j.matchScore >= 80).length, possibleCount: sorted.filter(j => j.matchScore >= 60 && j.matchScore < 80).length });
      return; // ← no API call
    }

    // ── Country-level or new search: fetch from API ────────────────────────
    setIsLoadingJobs(true);
    try {
      // For city selection without a pool, extract country for API call
      const apiFilters = isCity
        ? { ...filters, location: cityCountry }
        : filters;

      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, filters: apiFilters, maxResults: 50, lang }),
      });
      if (res.status === 403) {
        const errData = await res.json();
        if (errData.error === 'LIMIT_REACHED') {
          setShowPaywall(true);
          setMatchesLeft(0);
          return;
        }
      }
      if (res.status === 429) {
        setError(isAr
          ? 'الخادم مشغول جداً حالياً. يرجى الانتظار دقيقة والمحاولة مجدداً.'
          : 'The server is very busy right now. Please wait a minute and try again.');
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      const sorted = [...(data.matches as JobMatch[])].sort((a, b) => b.matchScore - a.matchScore);
      setJobs(sorted);
      setAllFetchedJobs(sorted);   // store full pool for city filtering
      setLastCountryFilter(cityCountry || location || ''); // remember which country this pool belongs to
      setJobTiers(data.tiers ?? null);
      if (typeof data.matchesLeft === 'number') setMatchesLeft(data.matchesLeft);
      // Persist session
      try {
        sessionStorage.setItem('mena_session_jobs', JSON.stringify(sorted));
        sessionStorage.setItem('mena_last_country', cityCountry || location || '');
        sessionStorage.setItem('mena_has_searched', 'true');
      } catch { /* storage full — non-blocking */ }
    } catch {
      setError(t.jobsLoadError);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleTabSwitch = async (tab: Tab) => {
    setActiveTab(tab);
    // Reload saved jobs only if count mismatch (new saves happened in this session)
    if (tab === 'saved' && isLoggedIn && savedJobs.length !== savedJobIds.size) {
      setIsLoadingSaved(true);
      try {
        const fresh = await loadSavedJobs();
        console.log('[saved-jobs] refreshed:', fresh.length);
        setSavedJobs(fresh);
      } catch (err) {
        console.error('[saved-jobs] refresh error:', err);
      } finally {
        setIsLoadingSaved(false);
      }
    }
  };

  const handleSaveToggle = (jobId: string, saved: boolean) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(jobId); else next.delete(jobId);
      return next;
    });
    if (saved) {
      // Add to saved list if not already there
      const job = jobs.find((j) => j.id === jobId);
      if (job) setSavedJobs((prev) => prev.some((j) => j.id === jobId) ? prev : [job, ...prev]);
    } else {
      // Remove from saved list immediately (works in both tabs)
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  const handleUnlockJob = async (jobId: string) => {
    if (userTier === 'pro') {
      setUnlockedJobIds(prev => new Set([...prev, jobId]));
      return;
    }
    if (userCredits > 0) {
      // Deduct 1 credit
      const newCredits = userCredits - 1;
      setUserCredits(newCredits);
      setUnlockedJobIds(prev => {
        const next = new Set([...prev, jobId]);
        try { sessionStorage.setItem('mena_unlocked_ids', JSON.stringify([...next])); } catch {}
        return next;
      });
      addToast(isAr ? '🔓 تم فتح الوظيفة! رصيد متبقي: ' + newCredits : `🔓 Job unlocked! Credits left: ${newCredits}`);
      // Update Supabase in background
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ credits: newCredits }).eq('user_id', user.id);
        }
      } catch { /* non-blocking */ }
    } else {
      setShowPaywall(true);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoadingInit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
          <p className="text-sm text-neutral-500">{isAr ? 'جارٍ التحميل...' : 'Loading your profile...'}</p>
        </div>
      </div>
    );
  }

  // ── No profile ─────────────────────────────────────────────────────────────
  if (!profile && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <PageHeader userEmail={userEmail} isLoggedIn={isLoggedIn} onSignOut={handleSignOut} lang={lang} t={t} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-sm px-4">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Upload className="w-9 h-9 text-primary-500" />
            </div>
            <h2 className="font-display text-2xl text-neutral-900 mb-2">
              {isAr ? 'لا يوجد ملف شخصي بعد' : 'No profile yet'}
            </h2>
            <p className="text-neutral-500 text-sm mb-6">
              {isAr ? 'ارفع سيرتك الذاتية لبدء مطابقة الوظائف' : 'Upload your CV to start matching jobs'}
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)} size="lg">
              <Upload className="w-4 h-4 me-2" />
              {isAr ? 'ارفع سيرتك الذاتية' : 'Upload CV'}
            </Button>
          </div>
        </div>
        {/* Upload modal — mounted here so it works before profile exists */}
        {isUploadModalOpen && (
          <ReUploadModal
            lang={lang}
            isLoggedIn={isLoggedIn}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={(newProfile) => {
              handleProfileUpdate(newProfile);
              setIsUploadModalOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  if (!profile) return null;

  const firstName = profile.name?.split(' ')[0];

  return (
    <div>
    <SessionTimeout />
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PageHeader userEmail={userEmail} isLoggedIn={isLoggedIn} onSignOut={handleSignOut} lang={lang} t={t} />

      {/* Welcome banner */}
      <div className="bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-semibold text-lg leading-snug">
                  {isAr
                    ? `مرحباً${firstName ? ' ' + firstName : ''}! 👋`
                    : `Welcome back${firstName ? ', ' + firstName : ''}! 👋`}
                </h1>
                {/* Tier badge */}
                {userTier === 'pro' && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                    👑 {isAr ? 'غير محدود' : 'Unlimited'}
                  </span>
                )}
                {userTier !== 'pro' && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                    ⚡ {userCredits} {isAr ? 'رصيد' : 'credits'}
                  </span>
                )}
                {userTier === 'free' && userCredits === 0 && matchesLeft !== null && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    matchesLeft <= 1 ? 'bg-red-400/80 text-white' : 'bg-white/20 text-white'
                  }`}>
                    {isAr ? `${matchesLeft}/5 مطابقات` : `${matchesLeft}/5 matches`}
                  </span>
                )}
              </div>
              <p className="text-white/75 text-sm">
                {isAr
                  ? 'هذه هي أفضل الوظائف المطابقة لملفك اليوم'
                  : "Here are your top job matches for today"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <ProfileCard
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onRequestReUpload={() => setIsUploadModalOpen(true)}
              onSaveSuccess={(updated, previous) => {
                addToast(
                  isAr ? 'تم تحديث الملف الشخصي ✓' : 'Profile updated ✓',
                  isAr ? 'تراجع' : 'Undo',
                  () => handleProfileUpdate(previous)
                );
              }}
            />
            <ChatAssistant profile={profile} onProfileUpdate={handleProfileUpdate} />

            {/* Credits counter — anyone with credits */}
            {userCredits > 0 && userTier !== 'pro' && (
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">
                    {isAr ? 'رصيدك المتاح' : 'Available credits'}
                  </p>
                  <p className="text-2xl font-bold text-orange-500">{userCredits}</p>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'رصيد = فتح وظيفة واحدة' : '1 credit = 1 job unlock'}
                  </p>
                </div>
                <a href="/pricing"
                  className="text-xs px-3 py-1.5 bg-orange-50 text-orange-500 hover:bg-orange-100 rounded-full font-medium transition-colors">
                  {isAr ? 'شراء المزيد' : 'Buy more'}
                </a>
              </div>
            )}

            {/* Monthly counter — free users with no credits */}
            {userTier === 'free' && userCredits === 0 && matchesLeft !== null && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {isAr ? 'المطابقات المتبقية' : 'Monthly matches'}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    matchesLeft === 0 ? 'bg-red-100 text-red-600'
                    : matchesLeft <= 2 ? 'bg-orange-100 text-orange-600'
                    : 'bg-green-100 text-green-600'
                  }`}>
                    {matchesLeft}/5
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      matchesLeft === 0 ? 'bg-red-400'
                      : matchesLeft <= 2 ? 'bg-orange-400'
                      : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(matchesLeft / 5) * 100}%` }}
                  />
                </div>
                {matchesLeft === 0 ? (
                  <a href="/pricing"
                    className="block w-full text-center py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    {isAr ? 'ترقية للمزيد' : 'Upgrade for more'}
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 text-center">
                    {isAr ? 'يتجدد كل 30 يوماً' : 'Resets every 30 days'}
                    {' · '}
                    <a href="/pricing" className="text-orange-500 hover:underline">
                      {isAr ? 'ترقية' : 'Upgrade'}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <FilterPanel onApplyFilters={handleSearchJobs} isLoading={isLoadingJobs} />

            {/* Tab switcher — only shown after first search or if logged in */}
            {(hasSearched || isLoggedIn) && (
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {(['all', 'saved'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabSwitch(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {tab === 'all'
                      ? (isAr ? `كل الوظائف${jobs.length ? ` (${jobs.length})` : ''}` : `All Jobs${jobs.length ? ` (${jobs.length})` : ''}`)
                      : (isAr ? `المحفوظة${savedJobIds.size ? ` (${savedJobIds.size})` : ''}` : `Saved${savedJobIds.size ? ` (${savedJobIds.size})` : ''}`)}
                  </button>
                ))}
              </div>
            )}

            {/* ── ALL JOBS TAB ── */}
            {activeTab === 'all' && (
              <>
                {/* CTA */}
                {!hasSearched && !isLoadingJobs && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 animate-fade-in">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="font-display text-xl text-neutral-900 mb-2">{t.readyToSearch}</h3>
                    <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">{t.readySubtitle}</p>
                    <Button onClick={() => handleSearchJobs()} size="lg">
                      <Search className="w-4 h-4 me-2" />
                      {t.searchNow}
                    </Button>
                    {/* Monthly matches counter */}
                    {matchesLeft !== null && (
                      <div className="mt-4 max-w-xs mx-auto">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>{isAr ? 'المطابقات المتبقية' : 'Matches left this month'}</span>
                          <span className="font-semibold text-slate-700">{matchesLeft}/5</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full transition-all"
                            style={{ width: `${(matchesLeft / 5) * 100}%` }} />
                        </div>
                        {matchesLeft <= 1 && (
                          <p className="text-xs text-orange-500 mt-1.5 font-medium text-center">
                            ⚠️ {isAr ? 'اقتربت من الحد الشهري —' : 'Almost at your limit —'}
                            {' '}<a href="/pricing" className="underline">{isAr ? 'ترقية' : 'Upgrade'}</a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Loading — animated progress messages */}
                {isLoadingJobs && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center animate-fade-in">
                    <MatchingAnimation isAr={isAr} />
                  </div>
                )}

                {/* Error */}
                {error && !isLoadingJobs && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-red-100 animate-fade-in">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-neutral-900 mb-2">{t.errorTitle}</h3>
                    <p className="text-neutral-500 text-sm mb-6">{error}</p>
                    <Button onClick={() => handleSearchJobs()}>{t.retry}</Button>
                  </div>
                )}

                {/* Results */}
                {!isLoadingJobs && !error && jobs.length > 0 && (
                  <div className="space-y-6">
                    {/* Stats bar */}
                    <div className="flex items-center justify-between px-1">
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold text-neutral-900">{jobs.length}</span>
                        {' '}{isAr ? 'وظيفة من أصل' : 'top matches from'}{' '}
                        <span className="font-bold text-primary-600">1,100+</span>
                        {' '}{isAr ? 'وظيفة متاحة' : 'available jobs'}
                      </p>
                      <p className="text-xs text-neutral-400">{t.sortedByMatch}</p>
                    </div>

                    {/* Top Matches */}
                    {(() => {
                      const topCount = jobTiers?.topCount ?? jobs.length;
                      const topJobs  = jobs.slice(0, topCount);
                      const possible = jobs.slice(topCount);
                      return (
                        <>
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-base font-bold text-neutral-900">
                                {isAr ? '🔥 أفضل التطابقات' : '🔥 Top Matches'}
                              </span>
                              <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">
                                {topJobs.length}
                              </span>
                            </div>
                            <AnimatePresence>
                              {topJobs.map((job, index) => {
                                const locked = index > 0 && userTier !== 'pro' && !unlockedJobIds.has(job.id);
                                return (
                                  <JobCard key={job.id} job={job} index={index}
                                    initialSaved={savedJobIds.has(job.id)} onSaveToggle={handleSaveToggle}
                                    isLocked={locked} onUnlock={handleUnlockJob} userProfile={profile} aiPreloaded={index < 5} />
                                );
                              })}
                            </AnimatePresence>
                          </div>

                          {possible.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-base font-bold text-neutral-700">
                                  {isAr ? '💡 مطابقات محتملة' : '💡 Possible Matches'}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                                  {possible.length}
                                </span>
                              </div>
                              <AnimatePresence>
                                {possible.map((job, index) => {
                                  const locked = userTier !== 'pro' && !unlockedJobIds.has(job.id);
                                  return (
                                    <JobCard key={job.id} job={job} index={topJobs.length + index}
                                      initialSaved={savedJobIds.has(job.id)} onSaveToggle={handleSaveToggle}
                                      isLocked={locked} onUnlock={handleUnlockJob} userProfile={profile} aiPreloaded={index < 5} />
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* No results — show latest instead */}
                {!isLoadingJobs && !error && hasSearched && jobs.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 animate-fade-in">
                    <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-neutral-900 mb-2">
                      {isAr ? 'لم يتم العثور على نتائج دقيقة' : 'No exact matches found'}
                    </h3>
                    <p className="text-neutral-500 text-sm mb-6">
                      {isAr
                        ? 'جرب البحث بكلمات أوسع أو اختر صناعة مختلفة'
                        : 'Try broader keywords or select a different industry'}
                    </p>
                    <Button onClick={() => handleSearchJobs()}>{t.searchAgain}</Button>
                  </div>
                )}
              </>
            )}

            {/* ── SAVED JOBS TAB ── */}
            {activeTab === 'saved' && (
              <>
                {isLoadingSaved && (
                  <div className="space-y-4"><JobListSkeleton count={3} /></div>
                )}

                {!isLoadingSaved && savedJobs.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-neutral-900">
                        <span className="text-rose-500">{savedJobs.length}</span>{' '}
                        {isAr ? 'وظيفة محفوظة' : 'Saved Jobs'}
                      </h2>
                    </div>
                    <AnimatePresence>
                      {savedJobs.map((job, index) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          index={index}
                          initialSaved={true}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {!isLoadingSaved && savedJobs.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 animate-fade-in">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-rose-300" />
                    </div>
                    <h3 className="font-display text-xl text-neutral-900 mb-2">
                      {isAr ? 'لا توجد وظائف محفوظة بعد' : 'No saved jobs yet'}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                      {isAr
                        ? 'انقر على أيقونة القلب في أي وظيفة لحفظها هنا'
                        : 'Click the heart icon on any job to save it here'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Re-upload modal */}
      {isUploadModalOpen && (
        <ReUploadModal
          lang={lang}
          isLoggedIn={isLoggedIn}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={(newProfile) => {
            handleProfileUpdate(newProfile);
            setIsUploadModalOpen(false);
            setJobs([]);
            setHasSearched(false);
            addToast(isAr ? 'تم تحديث الملف بنجاح 🎉' : 'Profile updated from new CV 🎉');
          }}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>

    {/* Paywall Modal */}
    {showPaywall && (
      <PaywallModal isAr={isAr} onClose={() => setShowPaywall(false)} />
    )}
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
function PageHeader({ userEmail, isLoggedIn, onSignOut, lang, t }: {
  userEmail: string | null;
  isLoggedIn: boolean;
  onSignOut: () => void;
  lang: string;
  t: any;
}) {
  const isAr = lang === 'ar';
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-neutral-900 text-sm hidden sm:block">
              {isAr ? 'مطابق الوظائف' : 'MENA Jobs'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden sm:block text-xs text-neutral-400 max-w-[160px] truncate">
                {userEmail}
              </span>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {t.aiActive}
            </div>
            <LanguageSwitcher />
            {isLoggedIn && (
              <button
                onClick={onSignOut}
                title={isAr ? 'تسجيل الخروج' : 'Sign out'}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Re-Upload Modal ───────────────────────────────────────────────────────────
function ReUploadModal({
  lang,
  isLoggedIn,
  onClose,
  onSuccess,
}: {
  lang: string;
  isLoggedIn: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}) {
  const isAr      = lang === 'ar';
  const fileRef   = useRef<HTMLInputElement>(null);
  const [status,  setStatus]  = useState<'idle' | 'processing' | 'error'>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const processFile = async (file: File) => {
    setStatus('processing');
    setErrMsg('');
    try {
      // Size guard
      if (file.size > 10 * 1024 * 1024) throw new Error(isAr ? 'الملف كبير جداً (10MB كحد أقصى)' : 'File too large (max 10MB)');

      // Extract text
      let cvText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: any) => item.str ?? '').join(' '));
        }
        cvText = pages.join('\n');
      } else {
        cvText = await file.text();
      }

      if (cvText.trim().length < 20) {
        throw new Error(isAr
          ? 'لم نتمكن من قراءة النص. تأكد من أن الملف يحتوي على نص قابل للنسخ.'
          : 'Could not read text. Make sure the PDF contains selectable text.');
      }

      // Call extract API
      const res = await fetch('/api/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cvText.trim(), lang }),
      });
      if (!res.ok) throw new Error(isAr ? 'فشل استخراج الملف' : 'Profile extraction failed');
      const { profile, searchKeywords = [] } = await res.json();

      // Save to Supabase if logged in
      if (isLoggedIn) {
        const { createClient: mkClient } = await import('@/lib/supabase');
        const supabase = mkClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { error: dbError } = await supabase.from('profiles').upsert({
            user_id:           user.id,
            email:             user.email ?? null,
            full_name:         profile.name ?? null,
            cv_data:           profile,
            search_keywords:   searchKeywords, // ← AI-extracted English keywords
            updated_at:        new Date().toISOString(),
            tier:              'free',
            credits:           0,
            free_matches_used: 0,
            last_reset_date:   new Date().toISOString(),
          }, { onConflict: 'user_id' });

          if (dbError) {
            console.error('[CV Upload] DB error:', dbError.message, dbError.code);
            setErrMsg(`DB Error: ${dbError.message} (code: ${dbError.code})`);
            setStatus('error');
            return;
          }
        }
      }

      // Persist to sessionStorage
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      onSuccess(profile);
    } catch (err: any) {
      setErrMsg(err.message || (isAr ? 'حدث خطأ' : 'An error occurred'));
      setStatus('error');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-primary-500" />
            </div>
            <h2 className="font-semibold text-neutral-900">
              {isAr ? 'رفع سيرة ذاتية جديدة' : 'Upload New CV'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            {isAr
              ? 'تحذير: رفع ملف جديد سيُستبدل ملفك الشخصي الحالي بما في ذلك أي تعديلات يدوية أجريتها.'
              : 'Warning: Uploading a new file will overwrite your current profile including any manual edits you have made.'}
          </p>
        </div>

        {/* Drop zone */}
        {status === 'idle' && (
          <div
            className="border-2 border-dashed border-neutral-200 hover:border-primary-300 rounded-xl p-8 text-center cursor-pointer transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handleFile} className="hidden" />
            <UploadCloud className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-700 mb-1">
              {isAr ? 'اسحب الملف هنا أو انقر للاختيار' : 'Drag & drop or click to choose'}
            </p>
            <p className="text-xs text-neutral-400">PDF · TXT · max 10MB</p>
          </div>
        )}

        {/* Processing */}
        {status === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 text-primary-500 mx-auto mb-3 animate-spin" />
            <p className="text-sm font-medium text-neutral-700">
              {isAr ? 'الذكاء الاصطناعي يحلل سيرتك الذاتية...' : 'AI is analysing your CV...'}
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-4">{errMsg}</p>
            <button
              onClick={() => { setStatus('idle'); setErrMsg(''); }}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isAr ? 'حاول مجدداً' : 'Try again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function MatchingAnimation({ isAr }: { isAr: boolean }) {
  const [step, setStep] = React.useState(0);

  const steps = isAr ? [
    { icon: '🌍', text: 'نبحث في أسواق الشرق الأوسط...' },
    { icon: '🤖', text: 'الذكاء الاصطناعي يحلل تطابقك مع كل وظيفة...' },
    { icon: '🔥', text: 'نرتب أفضل 20 نتيجة لك...' },
    { icon: '✨', text: 'لمسات أخيرة على التحليل...' },
  ] : [
    { icon: '🌍', text: 'Searching markets in UAE, Saudi Arabia, Kuwait...' },
    { icon: '🤖', text: 'AI is analysing matches with your CV...' },
    { icon: '🔥', text: 'Sorting your top 20 matches...' },
    { icon: '✨', text: 'Final touches on the analysis...' },
  ];

  React.useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="py-4">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
        <Loader2 className="w-7 h-7 text-primary-500 animate-spin" />
      </div>
      <div className="h-8 flex items-center justify-center">
        <p className="text-base font-medium text-neutral-700 transition-all duration-500">
          {steps[step].icon} {steps[step].text}
        </p>
      </div>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step ? 'bg-primary-500 w-4' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}


// ── Paywall Modal ─────────────────────────────────────────────────────────────
function PaywallModal({ isAr, onClose }: { isAr: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">&#128274;</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {isAr ? 'وصلت إلى حدك الشهري' : "You've reached your monthly limit"}
        </h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          {isAr
            ? 'لقد استخدمت 5 مطابقات مجانية هذا الشهر. قم بالترقية للاستمرار في البحث.'
            : "You've used your 5 free AI matches this month. Upgrade to keep finding your dream job in MENA."}
        </p>
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{isAr ? 'المطابقات المستخدمة' : 'Matches used'}</span>
            <span className="font-semibold text-slate-600">5/5</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-orange-400 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href="/pricing"
            className="block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-200"
          >
            {isAr ? 'ترقية الآن' : 'Upgrade Now'}
          </a>
          <a
            href="/pricing"
            className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all text-sm"
          >
            {isAr ? 'شراء رصيد — 10$ لـ 50 مطابقة' : 'Buy Credits — $10 for 50 matches'}
          </a>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm transition-colors mt-1"
          >
            {isAr ? 'إغلاق' : 'Maybe later'}
          </button>
        </div>
      </div>
    </div>
  );
}