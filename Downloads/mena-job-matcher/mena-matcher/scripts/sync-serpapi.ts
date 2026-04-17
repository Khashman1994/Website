// scripts/sync-serpapi.ts — Safety Brake Edition
// Run: npx tsx scripts/sync-serpapi.ts
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SERPAPI_KEY  = process.env.SERPAPI_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SERPAPI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing: SERPAPI_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Safety limits ────────────────────────────────────────────────────────────
const MAX_API_CALLS = 230; // hard ceiling — leaves 10 buffer from 240 remaining
const MAX_PAGES     = 3;
const DELAY_MS      = 1300;
const delay         = (ms: number) => new Promise(r => setTimeout(r, ms));

let totalApiCalls = 0; // global counter

// ─── Top 15 titles ────────────────────────────────────────────────────────────
const TITLES: { query: string; industry: string }[] = [
  { query: 'Software Engineer',   industry: 'tech'        },
  { query: 'Data Scientist',      industry: 'tech'        },
  { query: 'Marketing Manager',   industry: 'marketing'   },
  { query: 'Digital Marketing',   industry: 'marketing'   },
  { query: 'Sales Manager',       industry: 'sales'       },
  { query: 'Finance Manager',     industry: 'finance'     },
  { query: 'Accountant',          industry: 'finance'     },
  { query: 'Civil Engineer',      industry: 'engineering' },
  { query: 'Project Manager',     industry: 'engineering' },
  { query: 'HR Manager',          industry: 'hr'          },
  { query: 'Supply Chain',        industry: 'logistics'   },
  { query: 'Doctor',              industry: 'healthcare'  },
  { query: 'Nurse',               industry: 'healthcare'  },
  { query: 'مهندس برمجيات',       industry: 'tech'        },
  { query: 'تسويق رقمي',          industry: 'marketing'   },
];

// ─── Top 5 MENA hubs ─────────────────────────────────────────────────────────
const LOCATIONS: { city: string; country: string }[] = [
  { city: 'Dubai',    country: 'ae' },
  { city: 'Abu Dhabi',country: 'ae' },
  { city: 'Riyadh',   country: 'sa' },
  { city: 'Doha',     country: 'qa' },
  { city: 'Cairo',    country: 'eg' },
];
// 15 × 5 × 3 = 225 calls — fits perfectly under MAX_API_CALLS=230

// ─── ID + mapping ─────────────────────────────────────────────────────────────
function makeId(title: string, company: string, location: string): string {
  const raw = `${title}|${company}|${location}`.toLowerCase().trim();
  return 'serp_' + crypto.createHash('md5').update(raw).digest('hex').slice(0, 16);
}

function mapJob(job: any, industry: string, country: string): Record<string, any> {
  const title   = job.title        ?? '';
  const company = job.company_name ?? '';
  const loc     = job.location     ?? '';
  const url     = job.share_link   ?? job.related_links?.[0]?.link ?? job.apply_options?.[0]?.link ?? '#';
  return {
    id:              makeId(title, company, loc),
    title, company, location: loc, country,
    description:     (job.description ?? '').slice(0, 2000),
    salary_min: null, salary_max: null, salary_currency: null,
    employment_type: job.detected_extensions?.schedule_type?.toLowerCase() ?? null,
    remote:          /remote/i.test(loc) || /remote/i.test(job.description ?? ''),
    url,
    source:          job.apply_options?.[0]?.title ?? 'Google Jobs',
    industry,
    is_arabic:       /[\u0600-\u06FF]/.test(title),
    posted_at:       null,
    fetched_at:      new Date().toISOString(),
    expires_at:      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ─── Single page fetch ────────────────────────────────────────────────────────
async function fetchPage(query: string, location: string, start: number): Promise<any[]> {
  const params = new URLSearchParams({
    engine: 'google_jobs', q: `${query} ${location}`,
    hl: 'en', start: String(start), api_key: SERPAPI_KEY,
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn(`\n    HTTP ${res.status} — ${body.slice(0, 100)}`);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data.jobs_results) ? data.jobs_results : [];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const combos = TITLES.length * LOCATIONS.length;
  const maxPossible = combos * MAX_PAGES;
  console.log(`\n🚀 SerpApi Sync — Safety Brake Edition`);
  console.log(`   ${TITLES.length} titles × ${LOCATIONS.length} locations = ${combos} combos`);
  console.log(`   Max possible calls: ${maxPossible} | Hard limit: ${MAX_API_CALLS}`);
  console.log(`   Started: ${new Date().toLocaleString()}\n`);

  const { count: deleted } = await supabase
    .from('jobs').delete({ count: 'exact' }).lt('expires_at', new Date().toISOString());
  console.log(`🗑  Deleted ${deleted ?? 0} expired jobs\n`);

  let totalFetched  = 0;
  let totalUpserted = 0;
  let combo         = 0;
  let brakeTriggered = false;

  outer: for (const loc of LOCATIONS) {
    for (const title of TITLES) {
      combo++;
      const label = `[${combo}/${combos}] "${title.query}" @ ${loc.city}`;
      process.stdout.write(`${label} `);

      const allRows: Record<string, any>[] = [];

      for (let page = 0; page < MAX_PAGES; page++) {
        // ── Safety brake ────────────────────────────────────────────────────
        if (totalApiCalls >= MAX_API_CALLS) {
          process.stdout.write(`\n🛑 Safety brake: ${totalApiCalls}/${MAX_API_CALLS} calls reached\n`);
          brakeTriggered = true;
          break outer; // exit all loops immediately
        }

        try {
          const raw = await fetchPage(title.query, loc.city, page * 10);
          totalApiCalls++;

          if (raw.length === 0) break; // no more pages
          allRows.push(...raw.map(j => mapJob(j, title.industry, loc.country)));
          totalFetched += raw.length;
          process.stdout.write(`p${page + 1}:${raw.length} `);

          await delay(DELAY_MS);
        } catch (err: any) {
          console.warn(`\n    ⚠ p${page + 1} error: ${err.message}`);
          totalApiCalls++; // count failed calls too
          break;
        }
      }

      if (allRows.length > 0) {
        // Deduplicate by id — SerpApi sometimes returns the same job across pages
        const uniqueRows = Array.from(new Map(allRows.map(r => [r.id, r])).values());
        const { error } = await supabase
          .from('jobs')
          .upsert(uniqueRows, { onConflict: 'id', ignoreDuplicates: false });
        if (error) {
          process.stdout.write(`✗ ${error.message}\n`);
        } else {
          totalUpserted += uniqueRows.length;
          process.stdout.write(`✓ (${uniqueRows.length}/${allRows.length})\n`);
        }
      } else {
        process.stdout.write(`(no results)\n`);
      }
    }
    await delay(400);
  }

  const { count: dbTotal } = await supabase
    .from('jobs').select('*', { count: 'exact', head: true });

  const remaining = MAX_API_CALLS - totalApiCalls;
  console.log('\n' + '─'.repeat(50));
  console.log(brakeTriggered ? '🛑 Stopped by safety brake' : '✅ Completed normally');
  console.log(`   API calls used:  ${totalApiCalls} / ${MAX_API_CALLS}`);
  console.log(`   Calls remaining: ${remaining} (buffer preserved)`);
  console.log(`   Jobs fetched:    ${totalFetched}`);
  console.log(`   Jobs upserted:   ${totalUpserted}`);
  console.log(`   DB total:        ${dbTotal ?? 0}`);
  console.log(`   Finished:        ${new Date().toLocaleString()}`);
}

main().catch(console.error);