'use server';
// app/actions/employer.ts
// Server Actions for the B2B Employer Portal.

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { Company, CompanyInput, Job, JobPostInput } from '@/lib/types';

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ─── Helpers ────────────────────────────────────────────────────────────────
async function requireUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, user };
}

function trim(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function toNumOrNull(v: FormDataEntryValue | null): number | null {
  const s = trim(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// ─── 1. Get current employer's company (or null) ────────────────────────────
export async function getMyCompany(): Promise<Company | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('employer_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('[getMyCompany]', error.message);
    return null;
  }
  return (data as Company) ?? null;
}

// ─── 2. List jobs posted by current employer ────────────────────────────────
export async function listMyJobs(): Promise<Job[]> {
  const { supabase, user } = await requireUser();

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('employer_id', user.id)
    .maybeSingle();
  if (!company) return [];

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('source', 'employer_posted')
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('[listMyJobs]', error.message);
    return [];
  }
  return (data ?? []) as unknown as Job[];
}

// ─── 3. Create or update the current employer's company profile ─────────────
export async function upsertCompany(
  input: CompanyInput | FormData,
): Promise<ActionResult<Company>> {
  try {
    const { supabase, user } = await requireUser();

    const payload: CompanyInput =
      input instanceof FormData
        ? {
            name:        trim(input.get('name')),
            website:     trim(input.get('website'))     || undefined,
            logo_url:    trim(input.get('logo_url'))    || undefined,
            description: trim(input.get('description')) || undefined,
          }
        : input;

    if (!payload.name) return { ok: false, error: 'Company name is required' };

    // Promote profile.role → 'employer' (best-effort; ignore if profile row missing)
    await supabase
      .from('profiles')
      .update({ role: 'employer' })
      .eq('user_id', user.id);

    const { data, error } = await supabase
      .from('companies')
      .upsert(
        {
          employer_id: user.id,
          name:        payload.name,
          website:     payload.website     ?? null,
          logo_url:    payload.logo_url    ?? null,
          description: payload.description ?? null,
        },
        { onConflict: 'employer_id' },
      )
      .select('*')
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath('/employers/dashboard');
    return { ok: true, data: data as Company };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Failed to save company' };
  }
}

// ─── 4. Post a new job (linked to employer's company) ───────────────────────
export async function postJob(
  input: JobPostInput | FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireUser();

    // Resolve the employer's company
    const { data: company, error: cErr } = await supabase
      .from('companies')
      .select('id, name')
      .eq('employer_id', user.id)
      .maybeSingle();
    if (cErr)     return { ok: false, error: cErr.message };
    if (!company) return { ok: false, error: 'Create a company profile first' };

    const payload: JobPostInput =
      input instanceof FormData
        ? {
            title:           trim(input.get('title')),
            location:        trim(input.get('location')),
            description:     trim(input.get('description')),
            requirements:    trim(input.get('requirements')) || undefined,
            employment_type: trim(input.get('employment_type')) || undefined,
            remote:          input.get('remote') === 'on' || input.get('remote') === 'true',
            salary_min:      toNumOrNull(input.get('salary_min')),
            salary_max:      toNumOrNull(input.get('salary_max')),
            salary_currency: trim(input.get('salary_currency')) || undefined,
            url:             trim(input.get('url')) || undefined,
          }
        : input;

    if (!payload.title || !payload.location || !payload.description) {
      return { ok: false, error: 'Title, location, and description are required' };
    }

    // jobs.id is text — reuse the same prefix convention as scraper
    const id = `employer_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const row = {
      id,
      title:           payload.title,
      company:         company.name,        // denormalised for backwards-compat
      company_id:      company.id,
      location:        payload.location,
      country:         payload.location.split(',').slice(-1)[0]?.trim() || payload.location,
      description:     payload.description.slice(0, 5000),
      employment_type: payload.employment_type ?? '',
      remote:          payload.remote ?? false,
      url:             payload.url ?? '',
      source:          'employer_posted' as const,
      industry:        '',
      salary_min:      payload.salary_min ?? null,
      salary_max:      payload.salary_max ?? null,
      salary_currency: payload.salary_currency ?? null,
      posted_at:       now,
      fetched_at:      now,
      expires_at:      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    };

    const { error } = await supabase.from('jobs').insert(row);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/employers/dashboard');
    revalidatePath('/jobs');
    return { ok: true, data: { id } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Failed to post job' };
  }
}

// ─── 5. Get a single job (must belong to the current employer) ──────────────
export async function getMyJob(jobId: string): Promise<Job | null> {
  const { supabase, user } = await requireUser();

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('employer_id', user.id)
    .maybeSingle();
  if (!company) return null;

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .eq('source', 'employer_posted')
    .maybeSingle();

  if (error) {
    console.error('[getMyJob]', error.message);
    return null;
  }
  return (data as unknown as Job) ?? null;
}

// ─── 6. Update an existing job (employer-owned) ─────────────────────────────
export async function updateJob(
  jobId: string,
  input: JobPostInput | FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireUser();

    // Defence-in-depth: confirm the job belongs to the caller's company
    // before issuing the UPDATE. RLS would block it anyway, but failing
    // fast gives a clearer error message.
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('employer_id', user.id)
      .maybeSingle();
    if (!company) return { ok: false, error: 'No company profile' };

    const { data: existing, error: fetchErr } = await supabase
      .from('jobs')
      .select('id, company_id, source')
      .eq('id', jobId)
      .maybeSingle();
    if (fetchErr)                                     return { ok: false, error: fetchErr.message };
    if (!existing)                                    return { ok: false, error: 'Job not found' };
    if (existing.company_id !== company.id)           return { ok: false, error: 'Not authorised' };
    if (existing.source     !== 'employer_posted')    return { ok: false, error: 'Cannot edit scraped jobs' };

    const payload: JobPostInput =
      input instanceof FormData
        ? {
            title:           trim(input.get('title')),
            location:        trim(input.get('location')),
            description:     trim(input.get('description')),
            requirements:    trim(input.get('requirements')) || undefined,
            employment_type: trim(input.get('employment_type')) || undefined,
            remote:          input.get('remote') === 'on' || input.get('remote') === 'true',
            salary_min:      toNumOrNull(input.get('salary_min')),
            salary_max:      toNumOrNull(input.get('salary_max')),
            salary_currency: trim(input.get('salary_currency')) || undefined,
            url:             trim(input.get('url')) || undefined,
          }
        : input;

    if (!payload.title || !payload.location || !payload.description) {
      return { ok: false, error: 'Title, location, and description are required' };
    }

    const { error } = await supabase
      .from('jobs')
      .update({
        title:           payload.title,
        location:        payload.location,
        country:         payload.location.split(',').slice(-1)[0]?.trim() || payload.location,
        description:     payload.description.slice(0, 5000),
        employment_type: payload.employment_type ?? '',
        remote:          payload.remote ?? false,
        url:             payload.url ?? '',
        salary_min:      payload.salary_min ?? null,
        salary_max:      payload.salary_max ?? null,
        salary_currency: payload.salary_currency ?? null,
      })
      .eq('id', jobId)
      .eq('company_id', company.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/employers/dashboard');
    revalidatePath(`/employers/dashboard/edit/${jobId}`);
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${jobId}`);
    return { ok: true, data: { id: jobId } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Failed to update job' };
  }
}

// ─── 7. Delete a job posted by the current employer ─────────────────────────
export async function deleteJob(jobId: string): Promise<ActionResult<null>> {
  try {
    const { supabase } = await requireUser();
    // RLS guarantees we can only delete our own jobs.
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/employers/dashboard');
    return { ok: true, data: null };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Failed to delete job' };
  }
}
