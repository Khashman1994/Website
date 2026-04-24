'use client';
// components/dashboard/JobCard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobMatch } from '@/lib/types';
import { MatchFeedback } from './MatchFeedback';
import {
  MapPin, Building2, DollarSign, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Lightbulb, ExternalLink,
  Lock, Sparkles, Heart, Zap,
} from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { toggleSavedJob } from '@/lib/supabase';

// ── Animated Score Ring ───────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const r = 22, circ = 2 * Math.PI * r;

  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    const step = (ts: number) => {
      if (!start) start = ts;
      const ease = 1 - Math.pow(1 - Math.min((ts - start) / duration, 1), 3);
      setDisplayed(Math.round(ease * score));
      if (ease < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [score]);

  const fill  = (displayed / 100) * circ;
  const color = displayed >= 80 ? '#f97316' : displayed >= 60 ? '#f59e0b' : displayed >= 40 ? '#94a3b8' : '#e2e8f0';

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{displayed}%</span>
      </div>
    </div>
  );
}

// ── Heart / Save button ───────────────────────────────────────────────────────
function SaveButton({ job, isSaved, onToggle }: {
  job: JobMatch;
  isSaved: boolean;
  onToggle: (saved: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [localSaved, setLocalSaved] = useState(isSaved);

  // Sync if parent changes (e.g. on tab switch)
  useEffect(() => setLocalSaved(isSaved), [isSaved]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    // Optimistic update
    const next = !localSaved;
    setLocalSaved(next);
    try {
      const actual = await toggleSavedJob(job);
      setLocalSaved(actual);
      onToggle(actual);
    } catch {
      setLocalSaved(!next); // revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saving}
      title={localSaved ? 'Remove from saved' : 'Save job'}
      className={`p-1.5 rounded-full transition-all duration-200 ${
        localSaved
          ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
          : 'text-neutral-300 hover:text-rose-400 hover:bg-rose-50'
      }`}
    >
      <Heart className={`w-4 h-4 ${localSaved ? 'fill-current' : ''} ${saving ? 'opacity-50' : ''}`} />
    </button>
  );
}

// ── Premium overlay ───────────────────────────────────────────────────────────
function PremiumBlur({ children, lang }: { children: React.ReactNode; lang: string }) {
  const isAr = lang === 'ar';
  return (
    <div className="relative mt-4 rounded-xl overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[3px]">
        <div className="text-center px-4 py-2">
          <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-4 h-4 text-primary-500" />
          </div>
          <p className="font-semibold text-sm text-neutral-800 mb-0.5">
            {isAr ? 'ميزة مميزة' : 'Premium Insight'}
          </p>
          <p className="text-xs text-neutral-400 mb-3">
            {isAr ? 'افتح التحليل الكامل بالترقية' : 'Upgrade to unlock full AI analysis'}
          </p>
          <button
            onClick={() => alert('Premium coming soon!')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            {isAr ? 'ترقية' : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Insights body ─────────────────────────────────────────────────────────────
function InsightsBody({ job, t }: { job: JobMatch; t: any }) {
  return (
    <div className="space-y-4">
      {job.insights.keyMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-neutral-700">{t.keyMatches}</span>
          </div>
          <ul className="space-y-1.5">
            {job.insights.keyMatches.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs">✓</span>{m}
              </li>
            ))}
          </ul>
        </div>
      )}
      {job.insights.missingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-neutral-700">{t.missingSkills}</span>
          </div>
          <ul className="space-y-1.5">
            {job.insights.missingSkills.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                <span className="text-amber-400 mt-0.5 flex-shrink-0 text-xs">△</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {job.insights.actionableInsight && (
        <div className="flex items-start gap-2.5 p-3 bg-orange-50 rounded-xl border border-orange-100">
          <Lightbulb className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-primary-700 mb-0.5">{t.actionableInsight}</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{job.insights.actionableInsight}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main JobCard ──────────────────────────────────────────────────────────────
interface JobCardProps {
  job: JobMatch;
  index: number;
  initialSaved?: boolean;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  isLocked?: boolean;
  onUnlock?: (jobId: string) => void;
  userProfile?: any;
  aiPreloaded?: boolean;
  autoExpand?: boolean; // auto-expand and trigger AI analysis (from analyzeJob param)
}

export function JobCard({ job, index, initialSaved = false, onSaveToggle, isLocked = false, onUnlock, userProfile, aiPreloaded = false, autoExpand = false }: JobCardProps) {
  const [isExpanded, setIsExpanded]   = useState(autoExpand);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiInsights, setAiInsights]   = useState(job.insights ?? null);
  const [aiScore, setAiScore]         = useState<number | null>(null);
  const { t, lang } = useLang();
  const isAr = lang === 'ar';
  const insights    = aiInsights ?? job.insights;
  const hasInsights = (insights?.keyMatches?.length ?? 0) > 0;
  const isFreeJob   = index < 2; // first 2 fully free
  // Jobs 2-4: AI already loaded, just instant reveal. Jobs 5+: need JIT fetch
  const needsAiFetch = !aiPreloaded && index >= 5;

  // Auto-trigger AI analysis when this card is the target of analyzeJob param
  useEffect(() => {
    if (autoExpand && !hasInsights && !aiLoading) {
      setTimeout(() => fetchAiAnalysis(), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExpand]);

  async function fetchAiAnalysis() {
    if (aiLoading || hasInsights) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, job, profile: userProfile, lang, isFree: isFreeJob }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data.insights);
        if (data.matchScore) setAiScore(data.matchScore);
      }
    } catch { /* non-blocking */ }
    finally { setAiLoading(false); }
  }

  // When user unlocks: instant for AI-preloaded jobs, JIT fetch for the rest
  function handleUnlockClick() {
    onUnlock?.(job.id);
    if (needsAiFetch) fetchAiAnalysis(); // trigger AI fetch in background
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-shadow duration-300 overflow-hidden"
      style={{ marginBottom: '1rem' }}
    >
      <div className="p-5">
        {/* ── Top row: score ring + title + location (always visible) ── */}
        <div className="flex items-start gap-4">
          {isLocked
            ? (
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50">
                <Lock className="w-5 h-5 text-slate-300" />
              </div>
            )
            : <ScoreRing score={aiScore ?? job.matchScore} />
          }
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-neutral-900 text-base leading-snug">{job.title}</h3>
              {!isLocked && (
                <SaveButton job={job} isSaved={initialSaved} onToggle={(saved) => onSaveToggle?.(job.id, saved)} />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{job.location}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.location && (() => {
                const FLAGS: Record<string,string> = {
                  'Saudi Arabia':'\u{1F1F8}\u{1F1E6} SA','UAE':'\u{1F1E6}\u{1F1EA} UAE',
                  'Kuwait':'\u{1F1F0}\u{1F1FC} KW','Egypt':'\u{1F1EA}\u{1F1EC} EG',
                  'Qatar':'\u{1F1F6}\u{1F1E6} QA','Bahrain':'\u{1F1E7}\u{1F1ED} BH',
                  'Oman':'\u{1F1F4}\u{1F1F2} OM','Jordan':'\u{1F1EF}\u{1F1F4} JO',
                };
                const c = Object.keys(FLAGS).find(k => job.location.toLowerCase().includes(k.toLowerCase()));
                return c ? <span className="badge bg-blue-50 text-blue-600 text-[11px]">{FLAGS[c]}</span> : null;
              })()}
              {job.postedDate && new Date(job.postedDate) > new Date(Date.now() - 86400000) && (
                <span className="badge bg-emerald-50 text-emerald-600 text-[11px]">{isAr ? '✨ جديد' : '✨ New'}</span>
              )}
              {job.employmentType && (
                <span className="badge bg-slate-100 text-slate-500 text-[11px]">{job.employmentType}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── LOCKED: glassmorphism overlay ── */}
        {isLocked ? (
          <div className="relative mt-4 rounded-xl overflow-hidden">
            {/* Blurred fake content */}
            <div className="blur-sm select-none pointer-events-none p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Building2 className="w-3.5 h-3.5" />
                <span>{'████████ ██████'}</span>
              </div>
              <div className="text-xs text-slate-200 leading-5">
                {'████████████████████████████████ ████████████████████████████████████████████'}
              </div>
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-28 bg-slate-200 rounded-full" />
                <div className="h-7 w-16 bg-orange-100 rounded-full" />
              </div>
            </div>
            {/* Glass overlay */}
            <div
              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center text-center px-4"
              style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)' }}
            >
              <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                <Lock className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm font-bold text-slate-800 mb-0.5">
                {isAr ? 'افتح هذه الوظيفة' : 'Unlock this job'}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                {needsAiFetch
                  ? (isAr ? 'فتح + تحليل ذكي فوري' : '1 credit · instant AI analysis')
                  : (isAr ? 'رصيد واحد للوصول الكامل' : '1 credit for full details + apply')}
              </p>
              <button
                onClick={handleUnlockClick}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-70 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-orange-100"
              >
                {aiLoading
                  ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{isAr ? ' جارٍ التحليل...' : ' Analyzing...'}</>
                  : <><Zap className="w-3.5 h-3.5" />{needsAiFetch ? (isAr ? 'فتح + تحليل ذكي' : 'Unlock + AI Analysis') : (isAr ? 'فتح (رصيد واحد)' : 'Unlock (1 Credit)')}</>
                }
              </button>
            </div>
          </div>
        ) : (
          /* ── UNLOCKED: full content ── */
          <div className="mt-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />{job.company}
              </span>
              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                  {job.salary.min?.toLocaleString()} – {job.salary.max?.toLocaleString()} {job.salary.currency}
                </span>
              )}
              {job.remote && (
                <span className="badge bg-emerald-50 text-emerald-600 text-[11px]">
                  {isAr ? 'عن بعد' : 'Remote'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              {hasInsights || aiLoading ? (
                <button
                  onClick={() => { setIsExpanded(!isExpanded); if (!isExpanded && !hasInsights) fetchAiAnalysis(); }}
                  className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 font-medium text-xs transition-colors"
                >
                  {aiLoading
                    ? <><span className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin inline-block" /> {isAr ? 'جارٍ التحليل...' : 'Analyzing...'}</>
                    : <>{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{isExpanded ? t.hideInsights : t.showInsights}</>
                  }
                </button>
              ) : (
                <button
                  onClick={() => { fetchAiAnalysis(); setIsExpanded(true); }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-primary-500 font-medium text-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAr ? 'تحليل ذكي' : 'AI Analysis'}
                </button>
              )}
              <a
                href={job.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
              >
                <ExternalLink className="w-3 h-3" />
                {t.applyNow}
              </a>
            </div>
            <AnimatePresence>
              {isExpanded && hasInsights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-slate-50 mt-4">
                    <InsightsBody job={{ ...job, insights }} t={t} />
                    <MatchFeedback jobId={job.id} aiScore={aiScore ?? job.matchScore} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
