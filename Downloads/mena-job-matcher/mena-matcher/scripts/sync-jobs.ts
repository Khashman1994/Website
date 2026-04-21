// scripts/sync-jobs.ts
// Parallel sync: JSearch + SerpApi gleichzeitig, auto-dedup, never stops
// Run: npx tsx scripts/sync-jobs.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── API Key Pools ─────────────────────────────────────────────────────────────
const JSEARCH_KEYS: string[] = (process.env.JSEARCH_API_KEYS ?? process.env.JSEARCH_API_KEY ?? '')
  .split(',').map(k => k.trim()).filter(Boolean);

const SERPAPI_KEYS: string[] = (
  process.env.SERPAPI_API_KEYS ??
  [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean).join(',')
).split(',').map(k => k.trim()).filter(Boolean);

let jIdx = 0;
let sIdx = 0;
let jDead = false;
let sDead = false;

// ── Location fix for SerpApi ──────────────────────────────────────────────────
const LOC_MAP: Record<string, string> = {
  'UAE': 'United Arab Emirates',
  'KSA': 'Saudi Arabia',
};
const fixLoc = (l: string) => LOC_MAP[l] ?? l;

// ── Rate limit detection ──────────────────────────────────────────────────────
const isRateLimit = (status: number, body: any) => {
  if ([429, 401, 403].includes(status)) return true;
  const m = (body?.message ?? body?.error ?? '').toLowerCase();
  return m.includes('exceeded') || m.includes('quota') ||
         m.includes('rate') || m.includes('out of searches');
};

// ── JSearch fetch with key rotation ──────────────────────────────────────────
async function fetchJSearch(query: string, location: string): Promise<any[]> {
  while (jIdx < JSEARCH_KEYS.length) {
    try {
      const url = new URL('https://jsearch.p.rapidapi.com/search');
      url.searchParams.set('query',       `${query} in ${location}`);
      url.searchParams.set('page',        '1');
      url.searchParams.set('num_pages',   '2');
      url.searchParams.set('date_posted', 'month');
      const res  = await fetch(url.toString(), {
        headers: {
          'X-RapidAPI-Key':  JSEARCH_KEYS[jIdx],
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });
      const data = await res.json();
      if (isRateLimit(res.status, data)) {
        jIdx++;
        await sleep(500);
        continue;
      }
      return data.data ?? [];
    } catch {
      jIdx++;
      await sleep(500);
    }
  }
  jDead = true;
  return [];
}

// ── SerpApi fetch with key rotation ──────────────────────────────────────────
async function fetchSerpApi(query: string, location: string): Promise<any[]> {
  const loc = fixLoc(location);
  while (sIdx < SERPAPI_KEYS.length) {
    try {
      const url = new URL('https://serpapi.com/search');
      url.searchParams.set('engine',   'google_jobs');
      url.searchParams.set('q',        `${query} ${loc}`);
      url.searchParams.set('location', loc);
      url.searchParams.set('hl',       'en');
      url.searchParams.set('api_key',  SERPAPI_KEYS[sIdx]);
      const res  = await fetch(url.toString());
      const data = await res.json();
      if (isRateLimit(res.status, data) ||
          (data.error?.includes('out of searches') || data.error?.includes('rate'))) {
        sIdx++;
        await sleep(500);
        continue;
      }
      if (data.error) return []; // location error etc — skip silently
      return data.jobs_results ?? [];
    } catch {
      sIdx++;
      await sleep(500);
    }
  }
  sDead = true;
  return [];
}

// ── Queries ───────────────────────────────────────────────────────────────────
const QUERIES: { query: string; location: string; sector: string }[] = [
  // Construction
  { query: 'Site Engineer',                location: 'Saudi Arabia',         sector: 'Construction' },
  { query: 'Construction Project Manager', location: 'United Arab Emirates', sector: 'Construction' },
  { query: 'Electrician',                  location: 'Dubai',                sector: 'Construction' },
  { query: 'HSE Officer',                  location: 'Saudi Arabia',         sector: 'Construction' },
  { query: 'Civil Engineer',               location: 'Qatar',                sector: 'Construction' },
  { query: 'Site Supervisor',              location: 'Abu Dhabi',            sector: 'Construction' },
  { query: 'Quantity Surveyor',            location: 'Saudi Arabia',         sector: 'Construction' },
  { query: 'Plumber',                      location: 'Dubai',                sector: 'Construction' },
  // Hospitality
  { query: 'Hotel Receptionist',           location: 'Dubai',                sector: 'Hospitality'  },
  { query: 'Chef de Partie',               location: 'Saudi Arabia',         sector: 'Hospitality'  },
  { query: 'F&B Manager',                  location: 'Dubai',                sector: 'Hospitality'  },
  { query: 'Housekeeping Supervisor',      location: 'Qatar',                sector: 'Hospitality'  },
  { query: 'Restaurant Manager',           location: 'Riyadh',               sector: 'Hospitality'  },
  { query: 'Barista',                      location: 'Dubai',                sector: 'Hospitality'  },
  { query: 'Hotel Manager',                location: 'Abu Dhabi',            sector: 'Hospitality'  },
  // Healthcare
  { query: 'Registered Nurse',             location: 'Saudi Arabia',         sector: 'Healthcare'   },
  { query: 'Pharmacist',                   location: 'Dubai',                sector: 'Healthcare'   },
  { query: 'Medical Laboratory Technician',location: 'Saudi Arabia',         sector: 'Healthcare'   },
  { query: 'Physiotherapist',              location: 'Dubai',                sector: 'Healthcare'   },
  { query: 'General Practitioner Doctor',  location: 'Abu Dhabi',            sector: 'Healthcare'   },
  { query: 'ICU Nurse',                    location: 'Qatar',                sector: 'Healthcare'   },
  { query: 'Dentist',                      location: 'Dubai',                sector: 'Healthcare'   },
  { query: 'Radiologist',                  location: 'Saudi Arabia',         sector: 'Healthcare'   },
  // Logistics
  { query: 'Delivery Driver',              location: 'Dubai',                sector: 'Logistics'    },
  { query: 'Warehouse Manager',            location: 'Saudi Arabia',         sector: 'Logistics'    },
  { query: 'Fleet Manager',                location: 'Dubai',                sector: 'Logistics'    },
  { query: 'Supply Chain Manager',         location: 'Saudi Arabia',         sector: 'Logistics'    },
  { query: 'Truck Driver',                 location: 'Dubai',                sector: 'Logistics'    },
  // Education
  { query: 'English Teacher',              location: 'Saudi Arabia',         sector: 'Education'    },
  { query: 'Primary School Teacher',       location: 'Dubai',                sector: 'Education'    },
  { query: 'Math Teacher',                 location: 'Qatar',                sector: 'Education'    },
  { query: 'Special Education Teacher',    location: 'Abu Dhabi',            sector: 'Education'    },
  { query: 'School Administrator',         location: 'Saudi Arabia',         sector: 'Education'    },
  // Retail
  { query: 'Sales Associate',              location: 'Dubai',                sector: 'Retail'       },
  { query: 'Store Manager',                location: 'Saudi Arabia',         sector: 'Retail'       },
  { query: 'Visual Merchandiser',          location: 'Dubai',                sector: 'Retail'       },
  { query: 'Cashier',                      location: 'Dubai',                sector: 'Retail'       },
  { query: 'Retail Supervisor',            location: 'Qatar',                sector: 'Retail'       },
  // Technology
  { query: 'Software Engineer',            location: 'Dubai',                sector: 'Technology'   },
  { query: 'Data Scientist',               location: 'Saudi Arabia',         sector: 'Technology'   },
  { query: 'Product Manager',              location: 'Dubai',                sector: 'Technology'   },
  { query: 'DevOps Engineer',              location: 'Dubai',                sector: 'Technology'   },
  { query: 'UX Designer',                  location: 'Dubai',                sector: 'Technology'   },
  { query: 'Cybersecurity Analyst',        location: 'Saudi Arabia',         sector: 'Technology'   },
  // Finance
  { query: 'Financial Analyst',            location: 'Dubai',                sector: 'Finance'      },
  { query: 'Accountant',                   location: 'Saudi Arabia',         sector: 'Finance'      },
  { query: 'Banking Relationship Manager', location: 'Dubai',                sector: 'Finance'      },
  { query: 'Audit Manager',                location: 'Dubai',                sector: 'Finance'      },
  // Blue-Collar
  { query: 'Delivery Driver',              location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Delivery Rider',               location: 'Riyadh',               sector: 'Blue-Collar'  },
  { query: 'Van Driver',                   location: 'Abu Dhabi',            sector: 'Blue-Collar'  },
  { query: 'Truck Driver',                 location: 'Jeddah',               sector: 'Blue-Collar'  },
  { query: 'Taxi Driver',                  location: 'Doha',                 sector: 'Blue-Collar'  },
  { query: 'Cleaner',                      location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Housekeeping staff',           location: 'Abu Dhabi',            sector: 'Blue-Collar'  },
  { query: 'Janitor',                      location: 'Riyadh',               sector: 'Blue-Collar'  },
  { query: 'Construction Worker',          location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Handyman',                     location: 'Abu Dhabi',            sector: 'Blue-Collar'  },
  { query: 'Electrician helper',           location: 'Riyadh',               sector: 'Blue-Collar'  },
  { query: 'AC Technician',                location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Security Guard',               location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Security Officer',             location: 'Riyadh',               sector: 'Blue-Collar'  },
  { query: 'CCTV Operator',                location: 'Abu Dhabi',            sector: 'Blue-Collar'  },
  { query: 'Waiter Waitress',              location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Cashier',                      location: 'Riyadh',               sector: 'Blue-Collar'  },
  { query: 'Kitchen Helper',               location: 'Abu Dhabi',            sector: 'Blue-Collar'  },
  { query: 'Barista',                      location: 'Jeddah',               sector: 'Blue-Collar'  },
  { query: 'Food Delivery',                location: 'Doha',                 sector: 'Blue-Collar'  },
  { query: 'Warehouse Worker',             location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Storekeeper',                  location: 'Riyadh',               sector: 'Blue-Collar'  },
  { query: 'Forklift Operator',            location: 'Jeddah',               sector: 'Blue-Collar'  },
  { query: 'Nanny Babysitter',             location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Sales Assistant',              location: 'Dubai',                sector: 'Blue-Collar'  },
  { query: 'Store Helper',                 location: 'Riyadh',               sector: 'Blue-Collar'  },
];

// ── Mappers ───────────────────────────────────────────────────────────────────
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
    location:        j.location ?? location,
    country:         location,
    description:     (j.description ?? '').slice(0, 5000),
    employment_type: j.detected_extensions?.work_from_home ? 'Remote' : (j.detected_extensions?.schedule_type ?? ''),
    remote:          j.detected_extensions?.work_from_home ?? false,
    url:             j.related_links?.[0]?.link ?? j.link ?? '',
    source:          'serp',
    industry:        sector,
    salary_min:      null,
    salary_max:      null,
    salary_currency: null,
    posted_at:       (() => {
      try {
        const raw = j.detected_extensions?.posted_at;
        if (!raw) return new Date().toISOString();
        const d = new Date(raw);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      } catch { return new Date().toISOString(); }
    })(),
    fetched_at:      new Date().toISOString(),
    expires_at:      expires(),
  };
}

// ── Upsert — ignoreDuplicates handles dedup automatically ─────────────────────
async function upsertJobs(jobs: any[]): Promise<{ inserted: number; skipped: number }> {
  if (!jobs.length) return { inserted: 0, skipped: 0 };
  // Remove in-batch duplicates by id before sending to DB
  const unique = Object.values(Object.fromEntries(jobs.map(j => [j.id, j])));
  const { error, data } = await sb
    .from('jobs')
    .upsert(unique, { onConflict: 'id', ignoreDuplicates: true })
    .select('id');
  if (error) { console.error('  DB error:', error.message); return { inserted: 0, skipped: unique.length }; }
  const inserted = data?.length ?? 0;
  return { inserted, skipped: unique.length - inserted };
}

// ── Process one query: fetch BOTH APIs in parallel, merge & upsert ────────────
async function processQuery(query: string, location: string, sector: string): Promise<{ inserted: number; skipped: number }> {
  const [jResult, sResult] = await Promise.allSettled([
    jDead ? Promise.resolve([]) : fetchJSearch(query, location),
    sDead ? Promise.resolve([]) : fetchSerpApi(query, location),
  ]);

  const jRaw = jResult.status === 'fulfilled' ? jResult.value : [];
  const sRaw = sResult.status === 'fulfilled' ? sResult.value : [];

  const jobs = [
    ...jRaw.map(j => mapJSearch(j, sector)),
    ...sRaw.map(j => mapSerpApi(j, sector, location)),
  ];

  return upsertJobs(jobs);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nMenaJob AI — Parallel Sync (JSearch + SerpApi simultaneously)');
  console.log(`JSearch keys: ${JSEARCH_KEYS.length} | SerpApi keys: ${SERPAPI_KEYS.length}`);
  console.log(`Total queries: ${QUERIES.length} | Concurrency: 3 at a time\n`);

  let totalInserted = 0;
  let totalSkipped  = 0;
  let totalErrors   = 0;

  // Process in batches of 3 to avoid overwhelming APIs
  const BATCH = 3;
  for (let i = 0; i < QUERIES.length; i += BATCH) {
    const batch = QUERIES.slice(i, i + BATCH);

    const results = await Promise.allSettled(
      batch.map(({ query, location, sector }) =>
        processQuery(query, location, sector).then(r => ({ query, location, sector, ...r }))
      )
    );

    for (const r of results) {
      if (r.status === 'fulfilled') {
        const { query, location, inserted, skipped } = r.value;
        console.log(`✓ "${query}" @ ${location} → +${inserted} new, ${skipped} dupes`);
        totalInserted += inserted;
        totalSkipped  += skipped;
      } else {
        console.log(`✗ Error: ${r.reason?.message ?? r.reason}`);
        totalErrors++;
      }
    }

    // Small pause between batches
    if (i + BATCH < QUERIES.length) await sleep(800);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done: +${totalInserted} inserted | ${totalSkipped} dupes | ${totalErrors} errors`);
  console.log(`JSearch key index: ${jIdx}/${JSEARCH_KEYS.length} | SerpApi key index: ${sIdx}/${SERPAPI_KEYS.length}`);
  if (jDead) console.log('⚠ JSearch: all keys exhausted this run');
  if (sDead) console.log('⚠ SerpApi: all keys exhausted this run');
}

main().catch(console.error);