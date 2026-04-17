// app/api/match-jobs/route.ts — Lazy AI Edition (fast, no OpenAI)
import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/job-api';
import { UserProfile, JobFilters, Job, JobMatch } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase';

// ─── Keyword extraction ───────────────────────────────────────────────────────
function buildKeywords(profile: UserProfile): string[] {
  // Use AI-extracted English keywords if saved (multilingual CV support)
  if ((profile as any).searchKeywords?.length > 0) {
    return (profile as any).searchKeywords.map((k: string) => k.toLowerCase());
  }

  const ROLE_MAP: Record<string,string> = {
    'مطور':'Developer','مهندس':'Engineer','مدير':'Manager','محاسب':'Accountant',
    'تسويق':'Marketing','مبيعات':'Sales','موارد بشرية':'HR','تصميم':'Designer','محلل':'Analyst',
  };
  const roles = profile.preferredRoles.slice(0, 3).map(r => {
    for (const [ar, en] of Object.entries(ROLE_MAP)) if (r.includes(ar)) return en;
    return r.replace(/[\u0600-\u06FF]+/g, '').trim();
  });
  const skills = profile.coreSkills
    .filter(s => /^[a-zA-Z0-9\s\+\#\.]+$/.test(s))
    .slice(0, 5);
  return [...roles, ...skills].filter(Boolean).map(k => k.toLowerCase());
}

// ─── Heuristic local scoring (no AI) ─────────────────────────────────────────
function dumbScore(job: Job, keywords: string[]): number {
  if (!keywords.length) return 50;
  const title = job.title.toLowerCase();
  const desc  = (job.description ?? '').toLowerCase().slice(0, 600);

  let score = 30; // base
  let hits  = 0;

  for (const kw of keywords) {
    if (title.includes(kw)) { score += 12; hits++; }       // title match = strong
    else if (desc.includes(kw)) { score += 4; hits++; }    // desc match = weak
  }

  // Bonus: seniority alignment
  const seniorityKws = ['senior', 'lead', 'head', 'director', 'principal'];
  const profileSeniority = keywords.some(k => seniorityKws.includes(k));
  const jobSeniority = seniorityKws.some(s => title.includes(s));
  if (profileSeniority && jobSeniority) score += 8;

  // Bonus: recent job
  if (job.postedDate) {
    const days = (Date.now() - new Date(job.postedDate).getTime()) / 86400000;
    if (days < 7)  score += 6;
    else if (days < 30) score += 3;
  }

  // Penalty: 0 keyword hits
  if (hits === 0) score = Math.max(score - 10, 20);

  return Math.min(score, 99); // cap at 99 — 100 reserved for AI-confirmed
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, filters, lang = 'en' } = body as {
      profile: UserProfile; filters?: JobFilters; lang?: string;
    };

    if (!profile) return NextResponse.json({ error: 'Profile required' }, { status: 400 });

    // ── Match guard (tier / credits) ──────────────────────────────────────────
    let userId: string | null = null;
    let matchesLeft: number | null = null;

    try {
      const sb = createServerSupabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      userId = user?.id ?? null;

      if (userId) {
        const { data: prof } = await sb
          .from('profiles')
          .select('tier, credits, free_matches_used, last_reset_date')
          .eq('user_id', userId).single();

        if (prof) {
          const tier = prof.tier ?? 'free';
          const now  = new Date();
          const lastReset = prof.last_reset_date ? new Date(prof.last_reset_date) : new Date(0);
          let freeUsed = prof.free_matches_used ?? 0;

          if ((now.getTime() - lastReset.getTime()) / 86400000 > 30) {
            freeUsed = 0;
            await sb.from('profiles').update({ free_matches_used: 0, last_reset_date: now.toISOString() }).eq('user_id', userId);
          }

          if (tier === 'pro') {
            // pass
          } else if ((prof.credits ?? 0) > 0) {
            await sb.from('profiles').update({ credits: prof.credits - 1 }).eq('user_id', userId);
          } else if (freeUsed < 5) {
            await sb.from('profiles').update({ free_matches_used: freeUsed + 1 }).eq('user_id', userId);
            matchesLeft = 4 - freeUsed;
          } else {
            return NextResponse.json({ error: 'LIMIT_REACHED', matchesLeft: 0, tier }, { status: 403 });
          }
        }
      }
    } catch { /* non-blocking */ }

    // ── Phase 1: fetch ────────────────────────────────────────────────────────
    const kwList  = buildKeywords(profile);
    const kwQuery = kwList.slice(0, 2).join(' ') || 'Manager';
    console.log(`[match-jobs] user=${userId ?? 'guest'} | kw="${kwQuery}" | loc=${filters?.location || 'SA'}`);

    const start = Date.now();
    const jobs  = await searchJobs(kwQuery, filters, 50);
    console.log(`[match-jobs] Fetched ${jobs.length} jobs in ${Date.now() - start}ms`);
    if (jobs.length === 0) return NextResponse.json({ matches: [], matchesLeft });

    // ── Phase 2: Hybrid scoring ───────────────────────────────────────────────
    // Top 5 → real AI analysis  |  Rest → instant heuristic score
    const top5   = jobs.slice(0, 5);
    const rest   = jobs.slice(5);

    // AI for top 5 (parallel, fast)
    const { matchJobWithProfile } = await import('@/lib/openai');
    const aiResults = await Promise.all(
      top5.map(j => matchJobWithProfile(j as any, profile, lang as any).catch(() => ({
        ...j, matchScore: 0,
        insights: { keyMatches: [], missingSkills: [], actionableInsight: '' },
      })))
    );
    console.log(`[match-jobs] AI scored ${aiResults.length} jobs in ${Date.now() - start}ms total`);

    // Heuristic for rest — score hidden on frontend, just needs 0 placeholder
    const heuristicResults: JobMatch[] = rest.map(j => ({
      ...j,
      matchScore: 0, // hidden behind lock — real score fetched on unlock
      insights:   { keyMatches: [], missingSkills: [], actionableInsight: '' },
    } as JobMatch));

    // Merge: AI jobs sorted by AI score, then heuristic jobs sorted by dumb score
    const aiSorted         = (aiResults as JobMatch[]).sort((a, b) => b.matchScore - a.matchScore);
    const heuristicSorted  = heuristicResults.sort((a, b) => b.matchScore - a.matchScore);
    const matches          = [...aiSorted, ...heuristicSorted].slice(0, 30);

    console.log(`[match-jobs] Returning ${matches.length} jobs (5 AI + ${matches.length - 5} heuristic)`);

    return NextResponse.json({
      matches,
      matchesLeft,
      aiReadyCount: aiSorted.length, // frontend knows first N have real AI insights
    });

  } catch (err: any) {
    console.error('[match-jobs] Error:', err);
    if (err?.message === 'RATE_LIMIT') {
      return NextResponse.json({ error: 'RATE_LIMIT' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Job matching failed' }, { status: 500 });
  }
}