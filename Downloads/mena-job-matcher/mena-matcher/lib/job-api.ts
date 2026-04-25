// lib/job-api.ts — MENA Final (High Volume, Bilingual, Smart Fallback)
import { Job, JobFilters } from './types';
import { getMockJobs } from './mock-data';

const JSEARCH_KEY  = process.env.JSEARCH_API_KEY;
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

// ─── Location normalisation ───────────────────────────────────────────────────
const LOCATION_ALIASES: Record<string, string> = {
  'ksa':'Saudi Arabia','saudi':'Saudi Arabia','united arab emirates':'UAE',
  'emirates':'UAE','الإمارات':'UAE','الكويت':'Kuwait','المملكة':'Saudi Arabia',
  'مصر':'Egypt','قطر':'Qatar','البحرين':'Bahrain','عمان':'Oman','الأردن':'Jordan',
};
const CANONICAL = new Set([
  'Saudi Arabia','UAE','Egypt','Qatar','Kuwait','Bahrain','Oman',
  'Jordan','Lebanon','Iraq','Morocco','Tunisia','Libya','Algeria',
]);
export function normaliseLocation(loc: string): string {
  if (!loc) return '';
  const l = loc.toLowerCase().trim();
  if (LOCATION_ALIASES[l]) return LOCATION_ALIASES[l];
  for (const c of CANONICAL) if (l === c.toLowerCase()) return c;
  return loc.trim();
}

// ─── MENA detection ───────────────────────────────────────────────────────────
const MENA_SIGNALS = [
  'ae','uae','dubai','abu dhabi','sharjah','al ain','emirates',
  'sa','sau','saudi','riyadh','jeddah','dammam','ksa',
  'kw','kwt','kuwait','kuwait city',
  'eg','egy','egypt','cairo','alexandria',
  'qa','qat','qatar','doha',
  'bh','bhr','bahrain','manama',
  'om','omn','oman','muscat',
  'jo','jor','jordan','amman',
  'lb','lbn','lebanon','beirut',
  'ma','mar','morocco','casablanca',
  'iq','iraq','baghdad',
  'middle east','arab','gcc',
  'مصر','الإمارات','الكويت','قطر','السعودية','البحرين','عمان','الأردن','لبنان',
];
function isMena(job: Job): boolean {
  const loc = (job.location ?? '').toLowerCase();
  return MENA_SIGNALS.some(s => loc.includes(s));
}

// ─── Bilingual synonym brain ──────────────────────────────────────────────────
const BRAIN: Record<string, [string[], string[]]> = {
  marketing:   [
    ['Marketing','Digital Marketing','Social Media','Advertising','SEO','Brand Manager'],
    ['تسويق','تسويق رقمي','سوشيال ميديا','إعلانات'],
  ],
  sales:       [
    ['Sales','Business Development','Account Manager','Sales Executive'],
    ['مبيعات','تطوير أعمال','مندوب مبيعات'],
  ],
  tech:        [
    ['Software Engineer','Developer','IT','Data Science','Cybersecurity','Cloud'],
    ['مهندس برمجيات','مطور','دعم فني','أمن سيبراني'],
  ],
  finance:     [
    ['Finance','Accountant','Banking','Auditor','Investment','Fintech'],
    ['مالية','محاسب','بنوك','تدقيق','استثمار'],
  ],
  healthcare:  [
    ['Doctor','Nurse','Pharmacist','Medical','Hospital'],
    ['طبيب','ممرض','صيدلي','طبي','مستشفى'],
  ],
  engineering: [
    ['Civil Engineer','Mechanical','Electrical','Project Manager','Construction'],
    ['مهندس مدني','ميكانيك','كهرباء','مدير مشروع'],
  ],
  logistics:   [
    ['Supply Chain','Logistics','Warehouse','Procurement','Operations'],
    ['سلاسل الإمداد','لوجستيات','مستودعات','مشتريات'],
  ],
  energy:      [
    ['Oil','Gas','Petroleum','Energy','Renewable','Drilling'],
    ['نفط','غاز','بترول','طاقة','متجددة'],
  ],
  hr:          [
    ['HR','Human Resources','Talent','Recruiter'],
    ['موارد بشرية','توظيف'],
  ],
  consulting:  [
    ['Consultant','Advisor','Analyst','Strategy'],
    ['استشاري','محلل'],
  ],
  realestate:  [
    ['Real Estate','Property','Leasing'],
    ['عقارات','تأجير'],
  ],
  education:   [
    ['Teacher','Training','Academic','Professor'],
    ['معلم','تعليم','مدرب'],
  ],
  design:      [
    ['Designer','UX','UI','Graphic','Creative'],
    ['مصمم','تصميم'],
  ],
};

const AR_TO_EN: Record<string, string> = {
  'تسويق':'Marketing','مهندس':'Engineer','مطور':'Developer','محاسب':'Accountant',
  'مالية':'Finance','مبيعات':'Sales','مدير':'Manager','محلل':'Analyst',
  'موارد بشرية':'HR','تصميم':'Design','استشاري':'Consultant',
  'لوجستيات':'Logistics','نفط':'Oil','غاز':'Gas','طبيب':'Doctor',
};

function arToEn(text: string): string {
  for (const [ar, en] of Object.entries(AR_TO_EN)) if (text.includes(ar)) return en;
  return '';
}

function detectIndustry(kw: string): string | null {
  const k = kw.toLowerCase();
  const map: [string, string[]][] = [
    ['marketing',   ['marketing','تسويق','social media','brand','seo','advertising','digital']],
    ['sales',       ['sales','مبيعات','business development']],
    ['tech',        ['software','developer','مطور','devops','it ','data','cloud','cyber']],
    ['finance',     ['finance','محاسب','accountant','banking','audit','tax','investment']],
    ['engineering', ['engineer','civil','mechanical','electrical','construction','مهندس']],
    ['hr',          ['hr ','human resources','talent','recruiter','موارد بشرية']],
    ['logistics',   ['logistics','supply chain','لوجستيات','procurement','warehouse']],
    ['healthcare',  ['doctor','medical','nurse','طبيب','hospital','pharmacist']],
    ['energy',      ['oil','gas','petroleum','نفط','غاز','energy','aramco','drilling']],
    ['realestate',  ['real estate','عقارات','property','leasing']],
    ['education',   ['teacher','معلم','training','professor']],
    ['consulting',  ['consultant','استشاري','advisor','strategy','analyst']],
    ['design',      ['designer','مصمم','ux ','ui ','graphic','creative']],
  ];
  for (const [cat, sigs] of map) if (sigs.some(s => k.includes(s))) return cat;
  return null;
}

// Returns [enQueries[], arQueries[]] — more terms = more volume
function buildQueries(keywords: string, filters?: JobFilters): [string[], string[]] {
  if (filters?.industry && BRAIN[filters.industry]) {
    const [en, ar] = BRAIN[filters.industry];
    return [en.slice(0, 2), ar.slice(0, 2)]; // top 2 EN + 2 AR
  }
  const hasAr  = /[\u0600-\u06FF]/.test(keywords);
  const baseEn = hasAr ? arToEn(keywords) : keywords.replace(/[\u0600-\u06FF]+/g, '').trim();
  const ind    = detectIndustry(hasAr ? keywords : baseEn);
  if (ind && BRAIN[ind]) return [BRAIN[ind][0].slice(0,2), BRAIN[ind][1].slice(0,2)];
  const clean = baseEn.split(/\s+/).slice(0, 2).join(' ') || 'Manager';
  return [[clean], ['']];
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const cache = new Map<string, { jobs: Job[]; ts: number }>();
const TTL   = 5 * 60 * 1000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Smart dedup: id + fuzzy title+company ────────────────────────────────────
function dedup(jobs: Job[]): Job[] {
  const byId    = new Map<string, Job>();
  const byTitle = new Map<string, Job>();
  for (const j of jobs) {
    if (byId.has(j.id)) continue;
    // Normalise title: remove location suffixes like "- Dubai", "(UAE)" etc.
    const normTitle = j.title
      .toLowerCase()
      .replace(/[-–(].*$/, '')  // strip "- Dubai" or "(UAE)"
      .replace(/\s+/g, ' ')
      .trim();
    const sig = `${normTitle}|${j.company?.toLowerCase().trim()}`;
    if (byTitle.has(sig)) continue;
    byId.set(j.id, j);
    byTitle.set(sig, j);
  }
  return Array.from(byId.values());
}

// ─── JSearch fetch ────────────────────────────────────────────────────────────
async function fetchJSearch(query: string, locSuffix: string, filters?: JobFilters): Promise<Job[]> {
  if (!query.trim()) return [];
  const ck  = `js|${query}|${locSuffix}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.ts < TTL) {
    console.log(`[job-api] Cache: "${query} ${locSuffix}"`);
    return hit.jobs;
  }

  const q = locSuffix ? `${query} ${locSuffix}` : query;
  const params = new URLSearchParams({ query: q, page: '1', num_pages: '3', date_posted: 'all' });

  // Set country param to override JSearch's US default
  const SUFFIX_TO_ISO: Record<string,string> = {
    'uae':'ae','saudi arabia':'sa','kuwait':'kw','egypt':'eg',
    'qatar':'qa','jordan':'jo','bahrain':'bh','oman':'om',
    'middle east':'ae','gcc':'ae', // broad — use AE as proxy
  };
  const countryIso = SUFFIX_TO_ISO[locSuffix.toLowerCase()] ?? null;
  if (countryIso) params.set('country', countryIso);
  if (filters?.remote) params.set('remote_jobs_only', 'true');
  if (filters?.employmentType) {
    const m: Record<string, string> = {
      'full-time': 'FULLTIME', 'part-time': 'PARTTIME',
      'contract': 'CONTRACTOR', 'freelance': 'CONTRACTOR',
    };
    if (m[filters.employmentType]) params.set('employment_types', m[filters.employmentType]);
  }

  console.log(`[job-api] → "${q}"`);
  let res: Response;
  try {
    res = await fetch(`https://${JSEARCH_HOST}/search?${params}`, {
      headers: { 'X-RapidAPI-Key': JSEARCH_KEY!, 'X-RapidAPI-Host': JSEARCH_HOST },
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err: any) {
    console.error(`[job-api] Fetch error: ${err.message}`);
    return [];
  }

  console.log(`[job-api] HTTP ${res.status} for "${q}"`);
  if (res.status === 429) {
    const msg = await res.text().catch(() => '');
    console.error(`[job-api] QUOTA EXCEEDED — stop all requests`);
    throw new Error('RATE_LIMIT');
  }
  if (!res.ok) { console.warn(`[job-api] HTTP ${res.status}`); return []; }

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { return []; }

  console.log(`[job-api] status="${data.status}" | count=${Array.isArray(data.data) ? data.data.length : 'N/A'}`);

  if (!Array.isArray(data.data) || data.data.length === 0) return [];

  const jobs: Job[] = data.data.map((r: any): Job => ({
    id:             r.job_id ?? `${r.job_title}-${r.employer_name}`,
    title:          r.job_title ?? '',
    company:        r.employer_name ?? '',
    location:       [r.job_city, r.job_country].filter(Boolean).join(', '),
    description:    r.job_description ?? '',
    salary:         r.job_min_salary && r.job_max_salary
                      ? { min: r.job_min_salary, max: r.job_max_salary, currency: r.job_salary_currency ?? 'USD' }
                      : undefined,
    employmentType: ({ FULLTIME: 'full-time', PARTTIME: 'part-time', CONTRACTOR: 'contract', INTERN: 'internship' } as any)[r.job_employment_type] ?? r.job_employment_type?.toLowerCase(),
    remote:         r.job_is_remote ?? false,
    url:            r.job_apply_link ?? r.job_google_link ?? '#',
    postedDate:     r.job_posted_at_datetime_utc,
    source:         'jsearch',
    isArabic:       /[\u0600-\u06FF]/.test(r.job_title ?? ''),
  } as Job & { isArabic: boolean }));

  cache.set(ck, { jobs, ts: Date.now() });
  return jobs;
}

function localScore(job: Job, kw: string): number {
  const words = kw.toLowerCase().split(/\s+/).filter(Boolean);
  const title = job.title.toLowerCase();
  const desc  = (job.description ?? '').toLowerCase().slice(0, 500);
  let s = 0;
  for (const w of words) {
    if (title.includes(w)) s += 4;
    else if (desc.includes(w)) s += 1;
  }
  return s;
}

// ─── Supabase RPC search ─────────────────────────────────────────────────────
function dbRowToJob(r: any): Job {
  return {
    id:             r.id,
    title:          r.title ?? '',
    company:        r.company ?? '',
    location:       r.location ?? '',
    description:    r.description ?? '',
    salary:         r.salary_min && r.salary_max
                      ? { min: r.salary_min, max: r.salary_max, currency: r.salary_currency ?? 'USD' }
                      : undefined,
    employmentType: r.employment_type,
    remote:         r.remote ?? false,
    url:            r.url ?? '#',
    postedDate:     r.posted_at,
    source:         'supabase' as const,
    isArabic:       r.is_arabic ?? false,
  };
}

async function searchSupabase(keywords: string, normLoc: string, filters?: JobFilters): Promise<Job[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const ISO_MAP: Record<string,string> = {
      'uae':'ae','saudi arabia':'sa','kuwait':'kw','egypt':'eg',
      'qatar':'qa','jordan':'jo','bahrain':'bh','oman':'om',
    };
    const iso = ISO_MAP[normLoc.toLowerCase()] ?? 'all';

    // Build search text: include industry synonym if detected
    const hasAr = /[\u0600-\u06FF]/.test(keywords);
    const baseKw = hasAr ? arToEn(keywords) : keywords.replace(/[\u0600-\u06FF]+/g,'').trim();
    const detectedIndustry = filters?.industry ?? detectIndustry(hasAr ? keywords : baseKw);
    // Use industry name as search text if keyword is too specific
    const queryText = detectedIndustry ?? baseKw.split(/\s+/)[0] ?? keywords;

    console.log(`[job-api] Supabase RPC | query_text="${queryText}" | country="${iso}" | industry="${detectedIndustry ?? 'none'}"`);

    const { data, error } = await sb.rpc('search_jobs', {
      query_text:     queryText,
      country_filter: iso,
    });

    if (error) { console.warn('[job-api] RPC error:', error.message); return []; }
    if (!data?.length) return [];

    console.log(`[job-api] Supabase RPC: ${data.length} jobs`);
    return (data as any[]).map(dbRowToJob);
  } catch (err) {
    console.warn('[job-api] Supabase search failed:', err);
    return [];
  }
}

// ─── Save JSearch results to Supabase in the background ──────────────────────
async function saveJobsToSupabase(jobs: Job[], industry: string | null, countryIso: string): Promise<void> {
  if (!jobs.length) return;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    // Use service role key to bypass RLS for writes
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const rows = jobs.map(j => ({
      id:              j.id,
      title:           j.title,
      company:         j.company ?? '',
      location:        j.location ?? '',
      country:         countryIso || null,
      description:     (j.description ?? '').slice(0, 2000),
      salary_min:      j.salary?.min ?? null,
      salary_max:      j.salary?.max ?? null,
      salary_currency: j.salary?.currency ?? null,
      employment_type: j.employmentType ?? null,
      remote:          j.remote ?? false,
      url:             j.url ?? '#',
      source:          'jsearch',
      industry:        industry ?? null,
      is_arabic:       /[\u0600-\u06FF]/.test(j.title),
      posted_at:       j.postedDate ?? null,
      fetched_at:      new Date().toISOString(),
      expires_at:      expires,
    }));

    const { error } = await sb
      .from('jobs')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

    if (error) console.warn(`[job-api] Save-on-fetch error: ${error.message}`);
    else console.log(`[job-api] Saved ${rows.length} JSearch jobs to Supabase`);
  } catch (err: any) {
    console.warn(`[job-api] Save-on-fetch failed (non-blocking): ${err.message}`);
  }
}

// ─── Latest jobs from Supabase (no-search fallback) ──────────────────────────
async function getLatestJobs(normLoc: string, maxResults: number): Promise<Job[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const ISO_MAP: Record<string,string> = {
      'uae':'ae','saudi arabia':'sa','kuwait':'kw','egypt':'eg',
      'qatar':'qa','jordan':'jo','bahrain':'bh','oman':'om',
    };
    const iso = ISO_MAP[normLoc.toLowerCase()] ?? null;
    let q = sb.from('jobs').select('*').gt('expires_at', new Date().toISOString());
    if (iso) q = q.eq('country', iso);
    q = q.order('posted_at', { ascending: false }).limit(maxResults);
    const { data } = await q;
    if (!data?.length) return [];
    console.log(`[job-api] Latest jobs from Supabase: ${data.length}`);
    return (data as any[]).map(dbRowToJob);
  } catch { return []; }
}

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// ─── SerpApi fetch ────────────────────────────────────────────────────────────
async function fetchSerpApi(query: string, location: string): Promise<Job[]> {
  if (!SERPAPI_KEY) return [];
  const ck  = `serp|${query}|${location}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.ts < TTL) {
    console.log(`[job-api] Cache (SerpApi): "${query} ${location}"`);
    return hit.jobs;
  }

  const params = new URLSearchParams({
    engine:   'google_jobs',
    q:        `${query} ${location}`,
    hl:       'en',
    api_key:  SERPAPI_KEY,
  });

  console.log(`[job-api] SerpApi → "${query} ${location}"`);
  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) { console.warn(`[job-api] SerpApi HTTP ${res.status}`); return []; }
    const data = await res.json();
    const raw: any[] = Array.isArray(data.jobs_results) ? data.jobs_results : [];

    const jobs: Job[] = raw.map((r: any) => ({
      id:             'serp_' + Buffer.from(`${r.title}|${r.company_name}|${r.location}`).toString('base64').slice(0, 16),
      title:          r.title ?? '',
      company:        r.company_name ?? '',
      location:       r.location ?? location,
      description:    r.description ?? '',
      salary:         undefined,
      employmentType: r.detected_extensions?.schedule_type?.toLowerCase() ?? undefined,
      remote:         /remote/i.test(r.location ?? '') || /remote/i.test(r.description ?? ''),
      url:            r.share_link ?? r.related_links?.[0]?.link ?? '#',
      postedDate:     undefined,
      source:         'serp' as any,
      isArabic:       /[\u0600-\u06FF]/.test(r.title ?? ''),
    }));

    cache.set(ck, { jobs, ts: Date.now() });
    console.log(`[job-api] SerpApi: ${jobs.length} jobs`);
    return jobs;
  } catch (err: any) {
    console.warn(`[job-api] SerpApi error: ${err.message}`);
    return [];
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function searchJobs(keywords: string, filters?: JobFilters, maxResults = 30): Promise<Job[]> {
  if (!JSEARCH_KEY && !SERPAPI_KEY) return getMockJobs(keywords, filters, maxResults);

  const reqLoc  = filters?.location?.trim() ?? '';
  const normLoc = normaliseLocation(reqLoc);
  const effectiveLoc = normLoc || 'Saudi Arabia';

  // ── Step 1: Try Supabase RPC first ────────────────────────────────────────
  const dbJobs = await searchSupabase(keywords, effectiveLoc, filters);
  if (dbJobs.length >= 10) {
    console.log(`[job-api] Serving ${dbJobs.length} jobs from Supabase cache`);
    return dbJobs
      .map(j => ({ j, s: localScore(j, keywords) }))
      .sort((a, b) => b.s - a.s)
      .map(x => x.j)
      .slice(0, maxResults);
  }

  console.log(`[job-api] Supabase: ${dbJobs.length} (< 10) → live fetch`);

  const [enQs, arQs] = buildQueries(keywords, filters);
  const hasAr = /[\u0600-\u06FF]/.test(keywords);
  const baseKw = hasAr ? arToEn(keywords) : keywords.replace(/[\u0600-\u06FF]+/g,'').trim();
  const detectedIndustry = filters?.industry ?? detectIndustry(hasAr ? keywords : baseKw);
  const ISO_MAP: Record<string,string> = {
    'uae':'ae','saudi arabia':'sa','kuwait':'kw','egypt':'eg',
    'qatar':'qa','jordan':'jo','bahrain':'bh','oman':'om',
  };
  const countryIso = ISO_MAP[effectiveLoc.toLowerCase()] ?? '';

  // ── Step 2: Randomized provider — 50/50 JSearch vs SerpApi ───────────────
  const useJSearchFirst = Math.random() < 0.5 || !SERPAPI_KEY;
  const provider1 = useJSearchFirst ? 'JSearch' : 'SerpApi';
  const provider2 = useJSearchFirst ? 'SerpApi' : 'JSearch';
  console.log(`[job-api] Live fetch order: ${provider1} → ${provider2}`);

  const suffixes = [effectiveLoc, 'Middle East'];
  let pool: Job[] = [...dbJobs];
  const freshJobs: Job[] = [];

  for (const suffix of suffixes) {
    let batchJobs: Job[] = [];

    // ── Provider 1 ──────────────────────────────────────────────────────────
    try {
      if (useJSearchFirst && JSEARCH_KEY) {
        const fns = [
          ...arQs.filter(Boolean).map(q => () => fetchJSearch(q, suffix, filters).catch(() => [] as Job[])),
          ...enQs.filter(Boolean).map(q => () => fetchJSearch(q, suffix, filters).catch(() => [] as Job[])),
        ];
        for (let i = 0; i < fns.length; i += 2) {
          const b = await Promise.all(fns.slice(i, i + 2).map(fn => fn()));
          batchJobs.push(...b.flat());
          if (i + 2 < fns.length) await sleep(200);
        }
      } else if (!useJSearchFirst && SERPAPI_KEY) {
        const serpJobs = await fetchSerpApi(enQs[0], suffix);
        batchJobs.push(...serpJobs);
      }
    } catch (e: any) {
      console.warn(`[job-api] ${provider1} failed: ${e.message}`);
    }

    // ── Provider 2 fallback if < 5 results ──────────────────────────────────
    if (batchJobs.length < 5) {
      console.log(`[job-api] ${provider1} got ${batchJobs.length} — trying ${provider2}`);
      try {
        if (!useJSearchFirst && JSEARCH_KEY) {
          const b = await fetchJSearch(enQs[0], suffix, filters).catch(() => [] as Job[]);
          batchJobs.push(...b);
        } else if (useJSearchFirst && SERPAPI_KEY) {
          const b = await fetchSerpApi(enQs[0], suffix);
          batchJobs.push(...b);
        }
      } catch (e: any) {
        console.warn(`[job-api] ${provider2} also failed: ${e.message}`);
      }
    }

    freshJobs.push(...batchJobs);
    const merged   = dedup([...pool, ...batchJobs]);
    const filtered = merged.filter(j =>
      j.location.toLowerCase().includes(effectiveLoc.toLowerCase()) || isMena(j)
    );
    pool = filtered;
    console.log(`[job-api] suffix="${suffix}" → pool=${pool.length}`);

    if (pool.length >= 20) break;
    if (suffix !== suffixes[suffixes.length - 1]) await sleep(300);
  }

  console.log(`[job-api] Final: ${pool.length} jobs`);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (pool.length === 0) {
    const latest = await getLatestJobs(effectiveLoc, maxResults);
    if (latest.length > 0) return latest;
  }

  // ── Save fresh jobs to Supabase in background ────────────────────────────
  if (freshJobs.length > 0) {
    saveJobsToSupabase(dedup(freshJobs), detectedIndustry, countryIso).catch(() => {});
  }

  return pool
    .map(j => ({ j, s: localScore(j, keywords) }))
    .sort((a, b) => b.s - a.s)
    .map(x => x.j)
    .slice(0, maxResults);
}