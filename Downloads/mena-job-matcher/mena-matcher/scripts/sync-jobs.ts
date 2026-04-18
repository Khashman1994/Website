// scripts/sync-jobs.ts
// Multi-sector job sync: 1x JSearch + 2x SerpApi with key rotation
// Run: npx tsx scripts/sync-jobs.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── API Key Pools ─────────────────────────────────────────────────────────────
const JSEARCH_KEYS  = [process.env.JSEARCH_API_KEY].filter(Boolean) as string[];
const SERPAPI_KEYS  = [
  process.env.SERPAPI_KEY,
  process.env.SERPAPI_KEY_2,
].filter(Boolean) as string[];

let jsearchIdx = 0;
let serpIdx    = 0;

function getJSearchKey(): string  { return JSEARCH_KEYS[jsearchIdx]; }
function getSerpKey(): string     { return SERPAPI_KEYS[serpIdx]; }
function rotateJSearch(): boolean {
  if (jsearchIdx < JSEARCH_KEYS.length - 1) { jsearchIdx++; console.log('[keys] JSearch rotated'); return true; }
  return false;
}
function rotateSerpApi(): boolean {
  if (serpIdx < SERPAPI_KEYS.length - 1) { serpIdx++; console.log('[keys] SerpApi rotated to key 2'); return true; }
  return false;
}

// ── Search Queries (54 total, 7 sectors) ──────────────────────────────────────
const QUERIES: { query: string; location: string; sector: string; api: 'jsearch' | 'serp' }[] = [
  // Construction — SerpApi
  { query: 'Site Engineer NEOM',          location: 'Saudi Arabia', sector: 'Construction', api: 'serp' },
  { query: 'Construction Project Manager',location: 'UAE',          sector: 'Construction', api: 'serp' },
  { query: 'Electrician jobs Gulf',        location: 'Dubai',        sector: 'Construction', api: 'serp' },
  { query: 'HSE Officer',                  location: 'Saudi Arabia', sector: 'Construction', api: 'serp' },
  { query: 'Civil Engineer',               location: 'Qatar',        sector: 'Construction', api: 'serp' },
  { query: 'Site Supervisor',              location: 'Abu Dhabi',    sector: 'Construction', api: 'serp' },
  { query: 'Quantity Surveyor',            location: 'Saudi Arabia', sector: 'Construction', api: 'serp' },
  { query: 'Plumber jobs Gulf',            location: 'UAE',          sector: 'Construction', api: 'serp' },

  // Hospitality — SerpApi
  { query: 'Hotel Receptionist',           location: 'Dubai',        sector: 'Hospitality',  api: 'serp' },
  { query: 'Chef de Partie',               location: 'Saudi Arabia', sector: 'Hospitality',  api: 'serp' },
  { query: 'F&B Manager',                  location: 'UAE',          sector: 'Hospitality',  api: 'serp' },
  { query: 'Housekeeping Supervisor',      location: 'Qatar',        sector: 'Hospitality',  api: 'serp' },
  { query: 'Restaurant Manager',           location: 'Riyadh',       sector: 'Hospitality',  api: 'serp' },
  { query: 'Barista jobs Dubai',           location: 'Dubai',        sector: 'Hospitality',  api: 'serp' },
  { query: 'Hotel Manager',                location: 'UAE',          sector: 'Hospitality',  api: 'serp' },
  { query: 'Waiter jobs Gulf',             location: 'Saudi Arabia', sector: 'Hospitality',  api: 'serp' },

  // Healthcare — SerpApi
  { query: 'Registered Nurse',             location: 'Saudi Arabia', sector: 'Healthcare',   api: 'serp' },
  { query: 'Pharmacist jobs',              location: 'UAE',          sector: 'Healthcare',   api: 'serp' },
  { query: 'Medical Laboratory Technician',location: 'Saudi Arabia', sector: 'Healthcare',   api: 'serp' },
  { query: 'Physiotherapist',              location: 'Dubai',        sector: 'Healthcare',   api: 'serp' },
  { query: 'General Practitioner Doctor',  location: 'UAE',          sector: 'Healthcare',   api: 'serp' },
  { query: 'ICU Nurse',                    location: 'Qatar',        sector: 'Healthcare',   api: 'serp' },
  { query: 'Dentist jobs Gulf',            location: 'UAE',          sector: 'Healthcare',   api: 'serp' },
  { query: 'Radiologist',                  location: 'Saudi Arabia', sector: 'Healthcare',   api: 'serp' },

  // Logistics — SerpApi
  { query: 'Delivery Driver',              location: 'Dubai',        sector: 'Logistics',    api: 'serp' },
  { query: 'Warehouse Manager',            location: 'Saudi Arabia', sector: 'Logistics',    api: 'serp' },
  { query: 'Fleet Manager',                location: 'UAE',          sector: 'Logistics',    api: 'serp' },
  { query: 'Forklift Operator',            location: 'Dubai',        sector: 'Logistics',    api: 'serp' },
  { query: 'Supply Chain Manager',         location: 'Saudi Arabia', sector: 'Logistics',    api: 'serp' },
  { query: 'Truck Driver Gulf',            location: 'UAE',          sector: 'Logistics',    api: 'serp' },

  // Education — JSearch
  { query: 'English Teacher',              location: 'Saudi Arabia', sector: 'Education',    api: 'jsearch' },
  { query: 'Primary School Teacher',       location: 'UAE',          sector: 'Education',    api: 'jsearch' },
  { query: 'Math Teacher international',   location: 'Qatar',        sector: 'Education',    api: 'jsearch' },
  { query: 'Special Education Teacher',    location: 'UAE',          sector: 'Education',    api: 'jsearch' },
  { query: 'School Administrator',         location: 'Saudi Arabia', sector: 'Education',    api: 'jsearch' },
  { query: 'Arabic Teacher',               location: 'UAE',          sector: 'Education',    api: 'jsearch' },

  // Retail — JSearch
  { query: 'Sales Associate mall',         location: 'Dubai',        sector: 'Retail',       api: 'jsearch' },
  { query: 'Store Manager retail',         location: 'Saudi Arabia', sector: 'Retail',       api: 'jsearch' },
  { query: 'Visual Merchandiser',          location: 'UAE',          sector: 'Retail',       api: 'jsearch' },
  { query: 'Cashier jobs Gulf',            location: 'Dubai',        sector: 'Retail',       api: 'jsearch' },
  { query: 'Retail Supervisor',            location: 'Qatar',        sector: 'Retail',       api: 'jsearch' },
  { query: 'Fashion Retail jobs',          location: 'UAE',          sector: 'Retail',       api: 'jsearch' },

  // Technology — JSearch
  { query: 'Software Engineer',            location: 'Dubai',        sector: 'Technology',   api: 'jsearch' },
  { query: 'Data Scientist',               location: 'Saudi Arabia', sector: 'Technology',   api: 'jsearch' },
  { query: 'Product Manager',              location: 'UAE',          sector: 'Technology',   api: 'jsearch' },
  { query: 'DevOps Engineer',              location: 'UAE',          sector: 'Technology',   api: 'jsearch' },
  { query: 'UX Designer',                  location: 'Dubai',        sector: 'Technology',   api: 'jsearch' },
  { query: 'Cybersecurity Analyst',        location: 'Saudi Arabia', sector: 'Technology',   api: 'jsearch' },

  // Finance — JSearch
  { query: 'Financial Analyst',            location: 'Dubai',        sector: 'Finance',      api: 'jsearch' },
  { query: 'Accountant jobs',              location: 'Saudi Arabia', sector: 'Finance',      api: 'jsearch' },
  { query: 'Banking Relationship Manager', location: 'UAE',          sector: 'Finance',      api: 'jsearch' },
  { query: 'Audit Manager',                location: 'Dubai',        sector: 'Finance',      api: 'jsearch' },
];

// ── JSearch Fetch ─────────────────────────────────────────────────────────────
async function fetchJSearch(query: string, location: string): Promise<any[]> {
  for (let attempt = 0; attempt <= JSEARCH_KEYS.length; attempt++) {
    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.set('query', `${query} in ${location}`);
    url.searchParams.set('page', '1');
    url.searchParams.set('num_pages', '2');
    url.searchParams.set('date_posted', 'month');

    const res = await fetch(url.toString(), {
      headers: { 'X-RapidAPI-Key': getJSearchKey(), 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
    });
    if (res.status === 429 || res.status === 403) {
      if (!rotateJSearch()) throw new Error('JSearch keys exhausted');
      await sleep(1000);
      continue;
    }
    const data = await res.json();
    return data.data ?? [];
  }
  return [];
}

// ── SerpApi Fetch ─────────────────────────────────────────────────────────────
async function fetchSerpApi(query: string, location: string): Promise<any[]> {
  for (let attempt = 0; attempt <= SERPAPI_KEYS.length; attempt++) {
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine',   'google_jobs');
    url.searchParams.set('q',        `${query} ${location}`);
    url.searchParams.set('location', location);
    url.searchParams.set('hl',       'en');
    url.searchParams.set('api_key',  getSerpKey());

    const res  = await fetch(url.toString());
    const data = await res.json();

    if (data.error?.includes('rate') || data.error?.includes('limit') || res.status === 429) {
      console.warn(`[serp] Key ${serpIdx + 1} rate limited`);
      if (!rotateSerpApi()) throw new Error('SerpApi keys exhausted');
      await sleep(1000);
      continue;
    }
    return data.jobs_results ?? [];
  }
  return [];
}

// ── Map results to Supabase row ───────────────────────────────────────────────
const expires = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString(); };

function mapJSearch(j: any, sector: string) {
  return {
    id:              `jsearch_${j.job_id}`,
    title:           j.job_title ?? '',
    company:         j.employer_name ?? '',
    location:        `${j.job_city ?? ''}, ${j.job_country ?? ''}`.replace(/^,\s*/, ''),
    country:         j.job_country ?? '',
    description:     (j.job_description ?? '').slice(0, 5000),
    employment_type: j.job_employment_type ?? '',
    remote:          j.job_is_remote ?? false,
    url:             j.job_apply_link ?? '',
    source:          'jsearch',
    industry:        sector,
    salary_min:      j.job_min_salary ?? null,
    salary_max:      j.job_max_salary ?? null,
    salary_currency: j.job_salary_currency ?? null,
    posted_at:       j.job_posted_at_datetime_utc ?? new Date().toISOString(),
    fetched_at:      new Date().toISOString(),
    expires_at:      expires(),
  };
}

function mapSerpApi(j: any, sector: string, location: string) {
  const id = `serp_${Buffer.from((j.title ?? '') + (j.company_name ?? '') + location).toString('base64').slice(0, 32)}`;
  return {
    id,
    title:           j.title ?? '',
    company:         j.company_name ?? '',
    location:        `${j.location ?? location}`,
    country:         location,
    description:     (j.description ?? j.detected_extensions?.description ?? '').slice(0, 5000),
    employment_type: j.detected_extensions?.work_from_home ? 'Remote' : (j.detected_extensions?.schedule_type ?? ''),
    remote:          j.detected_extensions?.work_from_home ?? false,
    url:             j.related_links?.[0]?.link ?? j.link ?? '',
    source:          'serp',
    industry:        sector,
    salary_min:      null,
    salary_max:      null,
    salary_currency: null,
    posted_at:       j.detected_extensions?.posted_at ? new Date(j.detected_extensions.posted_at).toISOString() : new Date().toISOString(),
    fetched_at:      new Date().toISOString(),
    expires_at:      expires(),
  };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Upsert to Supabase with deduplication ─────────────────────────────────────
async function upsertJobs(jobs: any[]): Promise<{ inserted: number; skipped: number }> {
  if (!jobs.length) return { inserted: 0, skipped: 0 };

const { error, data } = await sb
    .from('jobs')
    .upsert(jobs, { onConflict: 'id', ignoreDuplicates: true })
    .select('id');

  if (error) { console.error('  DB error:', error.message); return { inserted: 0, skipped: jobs.length }; }
  const inserted = data?.length ?? 0;
  return { inserted, skipped: jobs.length - inserted };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nMenaJob AI — Multi-Sector Sync`);
  console.log(`JSearch keys: ${JSEARCH_KEYS.length} | SerpApi keys: ${SERPAPI_KEYS.length}`);
  console.log(`Total queries: ${QUERIES.length}\n`);

  let totalInserted = 0;
  let totalSkipped  = 0;
  let totalErrors   = 0;

  for (const { query, location, sector, api } of QUERIES) {
    try {
      process.stdout.write(`[${sector}] "${query}" (${api})... `);

      let raw: any[] = [];
      if (api === 'jsearch' && JSEARCH_KEYS.length > 0) {
        raw = await fetchJSearch(query, location);
      } else if (api === 'serp' && SERPAPI_KEYS.length > 0) {
        raw = await fetchSerpApi(query, location);
      } else {
        console.log('SKIPPED (no key)');
        continue;
      }

      const jobs = api === 'jsearch'
        ? raw.map(j => mapJSearch(j, sector))
        : raw.map(j => mapSerpApi(j, sector, location));

      const { inserted, skipped } = await upsertJobs(jobs);
      totalInserted += inserted;
      totalSkipped  += skipped;
      console.log(`${raw.length} found → +${inserted} new, ${skipped} dupes`);

      await sleep(700); // rate limit buffer
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      totalErrors++;
    }
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Done: +${totalInserted} inserted | ${totalSkipped} skipped | ${totalErrors} errors`);
}

main().catch(console.error);