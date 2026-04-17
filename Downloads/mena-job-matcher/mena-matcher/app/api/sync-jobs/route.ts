// app/api/sync-jobs/route.ts
// Sync JSearch jobs into Supabase — call manually or via cron
// POST /api/sync-jobs  (protected by x-sync-secret header)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const JSEARCH_KEY  = process.env.JSEARCH_API_KEY!;
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
const SYNC_SECRET  = process.env.SYNC_SECRET ?? 'sync-secret-change-me';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Achte darauf, dass hier wirklich SYNC_TARGETS steht!
const SYNC_TARGETS: [string, string, string][] = [
  ['محاسب', 'finance', 'jo'],
  ['مندوب مبيعات', 'sales', 'jo'],
  ['خدمة عملاء', 'admin', 'lb'],
  ['كاشير', 'sales', 'jo'],
  ['مدخل بيانات', 'admin', 'lb'],
  ['فني صيانه', 'engineering', 'iq'],
  ['كهربائي', 'engineering', 'iq'],
  ['عامل مطبخ', 'hospitality', 'lb'],
  ['نجار', 'engineering', 'iq'],
  ['سائق توصil', 'logistics', 'jo'],
  ['موظف استقبال', 'admin', 'jo']
];
const ISO_TO_NAME: Record<string,string> = {
  'ae':'UAE','sa':'Saudi Arabia','kw':'Kuwait','eg':'Egypt',
  'qa':'Qatar','jo':'Jordan','bh':'Bahrain','om':'Oman',
};

async function fetchJSearch(query: string, iso: string): Promise<any[]> {
  const loc = ISO_TO_NAME[iso] ?? iso;
  const params = new URLSearchParams({
    query: `${query} ${loc}`, page: '1', num_pages: '3', date_posted: 'all',
  });
  const res = await fetch(`https://${JSEARCH_HOST}/search?${params}`, {
    headers: { 'X-RapidAPI-Key': JSEARCH_KEY, 'X-RapidAPI-Host': JSEARCH_HOST },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 429) { console.warn('[sync] Rate limit hit'); return []; }
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret');
  if (secret !== SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!JSEARCH_KEY) {
    return NextResponse.json({ error: 'JSEARCH_API_KEY not set' }, { status: 500 });
  }

  const supabase = getSupabase();
  let upserted = 0, deleted = 0;
  const errors: string[] = [];

  // Cleanup expired jobs
  const { count } = await supabase
    .from('jobs').delete({ count: 'exact' }).lt('expires_at', new Date().toISOString());
  deleted = count ?? 0;
  console.log(`[sync] Deleted ${deleted} expired jobs`);

  // Fetch + upsert each target
  for (const [query, industry, iso] of SYNC_TARGETS) {
    try {
      const raw = await fetchJSearch(query, iso);
      console.log(`[sync] "${query}" (${iso}): ${raw.length} jobs`);
      if (!raw.length) continue;

      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const rows = raw.map((r: any) => ({
        id:              r.job_id,
        title:           r.job_title ?? '',
        company:         r.employer_name ?? '',
        location:        [r.job_city, r.job_country].filter(Boolean).join(', '),
        country:         iso,
        description:     (r.job_description ?? '').slice(0, 2000),
        salary_min:      r.job_min_salary ?? null,
        salary_max:      r.job_max_salary ?? null,
        salary_currency: r.job_salary_currency ?? null,
        employment_type: r.job_employment_type?.toLowerCase() ?? null,
        remote:          r.job_is_remote ?? false,
        url:             r.job_apply_link ?? r.job_google_link ?? '#',
        source:          'jsearch',
        industry,
        is_arabic:       /[\u0600-\u06FF]/.test(r.job_title ?? ''),
        posted_at:       r.job_posted_at_datetime_utc ?? null,
        fetched_at:      new Date().toISOString(),
        expires_at:      expires,
      }));

      const { error } = await supabase
        .from('jobs').upsert(rows, { onConflict: 'id', ignoreDuplicates: false });
      if (error) { errors.push(`${query}: ${error.message}`); }
      else { upserted += rows.length; }

      await new Promise(r => setTimeout(r, 2000)); // rate-limit pause
    } catch (err: any) {
      errors.push(`${query}: ${err.message}`);
    }
  }

  return NextResponse.json({ success: true, upserted, deleted, errors: errors.length ? errors : undefined });
}

export async function GET() {
  const supabase = getSupabase();
  const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  const { data: byCountry } = await supabase
    .from('jobs').select('country').order('country');
  const countryCounts: Record<string, number> = {};
  for (const row of byCountry ?? []) {
    countryCounts[row.country] = (countryCounts[row.country] ?? 0) + 1;
  }
  return NextResponse.json({ total: count ?? 0, by_country: countryCounts });
}