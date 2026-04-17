// app/api/analyze-job/route.ts — Just-in-Time AI analysis for a single job
import { NextRequest, NextResponse } from 'next/server';
import { matchJobWithProfile } from '@/lib/openai';
import { UserProfile, Job } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, job, profile, lang = 'en', isFree = false } = body as {
      jobId: string;
      job: Job;
      profile: UserProfile;
      lang?: string;
      isFree?: boolean; // first 2 jobs are free
    };

    if (!jobId || !job || !profile) {
      return NextResponse.json({ error: 'jobId, job, profile required' }, { status: 400 });
    }

    // ── Auth + credit check ───────────────────────────────────────────────────
    let userId: string | null = null;

    try {
      const sb = createServerSupabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      userId = user?.id ?? null;

      if (userId && !isFree) {
        const { data: prof } = await sb
          .from('profiles')
          .select('tier, credits')
          .eq('user_id', userId).single();

        if (prof) {
          const tier = prof.tier ?? 'free';
          const credits = prof.credits ?? 0;

          if (tier !== 'pro' && credits <= 0) {
            return NextResponse.json({ error: 'NO_CREDITS' }, { status: 403 });
          }
          if (tier !== 'pro') {
            // Deduct 1 credit for the reveal
            await sb.from('profiles').update({ credits: credits - 1 }).eq('user_id', userId);
          }
        }
      }
    } catch { /* non-blocking */ }

    // ── Run AI analysis for this single job ───────────────────────────────────
    console.log(`[analyze-job] Analyzing job "${job.title}" for user ${userId ?? 'guest'}`);
    const start = Date.now();

    const result = await matchJobWithProfile(job as any, profile, lang as any);

    console.log(`[analyze-job] Done in ${Date.now() - start}ms | score=${result.matchScore}`);

    return NextResponse.json({
      jobId,
      matchScore: result.matchScore,
      insights:   result.insights,
      creditsUsed: isFree ? 0 : 1,
    });

  } catch (err: any) {
    console.error('[analyze-job] Error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}