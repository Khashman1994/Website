// lib/supabase.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { UserProfile } from './types';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser client (use in Client Components) ────────────────────────────────
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}

// ─── Server client (use in Server Components / API Routes only) ──────────────
export function createServerSupabaseClient() {
  // Dynamic import of next/headers to avoid bundling in client components
  const { cookies } = require('next/headers');
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: any) {
        try { cookieStore.set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: any) {
        try { cookieStore.set({ name, value: '', ...options }); } catch {}
      },
    },
  });
}

// ─── Profile helpers ──────────────────────────────────────────────────────────
export interface DbProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  cv_data: UserProfile | null;
  search_keywords: string[] | null;
  updated_at: string;
}

/** Load profile from Supabase for the current user */
export async function loadProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('cv_data, search_keywords')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data?.cv_data) return null;
  const profile = data.cv_data as UserProfile;
  if ((data as any).search_keywords?.length) {
    (profile as any).searchKeywords = (data as any).search_keywords;
  }
  return profile;
}

/** Save or update profile in Supabase */
export async function saveProfile(profile: UserProfile): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const searchKeywords = [
    ...profile.preferredRoles,
    ...profile.coreSkills.filter((s) => /^[a-zA-Z0-9\s\+\#\.]+$/.test(s)),
  ]
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 20);

  const { error } = await supabase.from('profiles').upsert({
    user_id:           user.id,
    email:             user.email ?? null,
    full_name:         profile.name ?? null,
    cv_data:           profile,
    search_keywords:   searchKeywords,
    updated_at:        new Date().toISOString(),
    // Safe defaults for new users (ignored if row already has values)
    tier:              'free',
    credits:           0,
    free_matches_used: 0,
  }, {
    onConflict:     'user_id',
    ignoreDuplicates: false,
  });

  if (error) {
    // Log but never throw — prevents logout on profile save failure
    console.warn('[saveProfile] Non-fatal error:', error.message);
  }
}

// ─── Saved Jobs helpers ───────────────────────────────────────────────────────
import type { JobMatch } from './types';

export interface SavedJobRow {
  id: string;
  user_id: string;
  job_id: string;
  job_data: JobMatch;
  created_at: string;
}

/** Fetch all saved jobs for current user */
export async function loadSavedJobs(): Promise<JobMatch[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_jobs')
    .select('job_id, job_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) { console.error('[loadSavedJobs] error:', error); return []; }
  if (!data || data.length === 0) return [];

  return data
    .map((row: any) => {
      const jobData = row.job_data;
      if (!jobData) return null;
      // Guarantee id is always present — use job_data.id or fall back to job_id column
      return { ...jobData, id: jobData.id || row.job_id } as JobMatch;
    })
    .filter(Boolean) as JobMatch[];
}

/** Fetch set of saved job IDs for current user (for heart state) */
export async function loadSavedJobIds(): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('saved_jobs')
    .select('job_id')
    .eq('user_id', user.id);

  return new Set((data ?? []).map((r: any) => r.job_id as string));
}

/** Toggle save/unsave a job — returns new saved state */
export async function toggleSavedJob(job: JobMatch): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', job.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', job.id);
    return false;
  } else {
    // created_at is set automatically by Supabase default — do not pass saved_at
    await supabase.from('saved_jobs').insert({
      user_id:  user.id,
      job_id:   job.id,
      job_data: job,
    });
    return true;
  }
}