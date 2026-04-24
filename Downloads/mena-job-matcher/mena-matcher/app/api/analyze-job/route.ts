// app/api/analyze-job/route.ts — Just-in-Time AI analysis for a single job
import { NextRequest, NextResponse } from 'next/server';
import { matchJobWithProfile } from '@/lib/openai';
import { UserProfile, Job } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase';

export const maxDuration = 30;

const FREE_ANALYSES_LIMIT = 2;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, job, profile, lang = 'en' } = body as {
      jobId: string;
      job: Job;
      profile: UserProfile;
      lang?: string;
    };

    if (!jobId || !job || !profile) {
      return NextResponse.json({ error: 'jobId, job, profile required' }, { status: 400 });
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const sb = createServerSupabaseClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // ── Server-derived credit state (client isFree flag is ignored) ──────────
    const { data: prof, error: profErr } = await sb
      .from('profiles')
      .select('tier, credits, free_analyses_used')
      .eq('user_id', user.id)
      .single();

    if (profErr || !prof) {
      console.error('[analyze-job] Profile lookup failed:', profErr?.message);
      return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 });
    }

    const tier     = prof.tier ?? 'free';
    const credits  = prof.credits ?? 0;
    const freeUsed = prof.free_analyses_used ?? 0;

    let serverIsFree = false;

    if (tier === 'pro') {
      serverIsFree = false; // pro: unlimited, no deduction
    } else if (freeUsed < FREE_ANALYSES_LIMIT) {
      const { error: rpcErr } = await sb.rpc('increment_free_analyses', { uid: user.id });
      if (rpcErr) {
        console.error('[analyze-job] increment_free_analyses failed:', rpcErr.message);
        return NextResponse.json({ error: 'CREDIT_ERROR' }, { status: 500 });
      }
      serverIsFree = true;
    } else if (credits > 0) {
      const { error: rpcErr } = await sb.rpc('decrement_credits', { uid: user.id });
      if (rpcErr) {
        if (rpcErr.message?.includes('NO_CREDITS')) {
          return NextResponse.json({ error: 'NO_CREDITS' }, { status: 403 });
        }
        console.error('[analyze-job] decrement_credits failed:', rpcErr.message);
        return NextResponse.json({ error: 'CREDIT_ERROR' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'NO_CREDITS' }, { status: 403 });
    }

    // ── Run AI analysis ───────────────────────────────────────────────────────
    console.log(`[analyze-job] user=${user.id} tier=${tier} free=${serverIsFree} | job="${job.title}"`);
    const start = Date.now();

    const result = await matchJobWithProfile(job as any, profile, lang as any);

    console.log(`[analyze-job] Done in ${Date.now() - start}ms | score=${result.matchScore}`);

    return NextResponse.json({
      jobId,
      matchScore:  result.matchScore,
      insights:    result.insights,
      creditsUsed: tier === 'pro' || serverIsFree ? 0 : 1,
    });

  } catch (err: any) {
    console.error('[analyze-job] Error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
