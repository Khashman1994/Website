// app/jobs/location/[country]/page.tsx
// Programmatic SEO: /jobs/location/saudi-arabia → "Jobs in Saudi Arabia"
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, Building2, ChevronRight, ExternalLink } from 'lucide-react';

export const revalidate    = 3600; // refresh every hour
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.menajob-ai.com';

// Slug → country code mapping
const SLUG_TO_CODE: Record<string, string> = {
  'saudi-arabia':       'sa',
  'uae':                'ae',
  'united-arab-emirates': 'ae',
  'kuwait':             'kw',
  'qatar':              'qa',
  'bahrain':            'bh',
  'oman':               'om',
  'egypt':              'eg',
  'jordan':             'jo',
  'lebanon':            'lb',
  'iraq':               'iq',
  'morocco':            'ma',
  'tunisia':            'tn',
};

// Slug → display name
function slugToLabel(slug: string): string {
  const map: Record<string, string> = {
    'saudi-arabia':         'Saudi Arabia',
    'uae':                  'UAE',
    'united-arab-emirates': 'United Arab Emirates',
    'kuwait':               'Kuwait',
    'qatar':                'Qatar',
    'bahrain':              'Bahrain',
    'oman':                 'Oman',
    'egypt':                'Egypt',
    'jordan':               'Jordan',
    'lebanon':              'Lebanon',
    'iraq':                 'Iraq',
    'morocco':              'Morocco',
    'tunisia':              'Tunisia',
  };
  return map[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getJobsByCountry(slug: string) {
  const countryCode = SLUG_TO_CODE[slug];
  const sb = getSupabase();

  let q = sb
    .from('jobs')
    .select('id, title, company, location, description, url, employment_type, posted_at')
    .gt('expires_at', new Date().toISOString())
    .order('posted_at', { ascending: false })
    .limit(50);

  if (countryCode) {
    q = q.eq('country', countryCode);
  } else {
    // Fallback: location contains the country name
    q = q.ilike('location', `%${slugToLabel(slug)}%`);
  }

  const { data } = await q;
  return data ?? [];
}

// ── generateMetadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { country: string } }
): Promise<Metadata> {
  const country = slugToLabel(params.country);
  const title   = `Jobs in ${country} | MenaJob AI`;
  const desc    = `Browse the latest job openings in ${country}. Find full-time, part-time, and remote jobs with MenaJob AI — the MENA region's smart job board.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url:         `${BASE_URL}/jobs/location/${params.country}`,
      siteName:    'MenaJob AI',
      type:        'website',
    },
    alternates: {
      canonical: `${BASE_URL}/jobs/location/${params.country}`,
    },
  };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function LocationJobsPage(
  { params }: { params: { country: string } }
) {
  const country = slugToLabel(params.country);
  const jobs    = await getJobsByCountry(params.country);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-orange-400 text-sm font-medium mb-3">
            <MapPin className="w-4 h-4" />
            <span>{country}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Find the best Jobs in {country}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {jobs.length} open positions · Updated daily
          </p>
          {/* AI Upsell */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all text-sm shadow-lg shadow-orange-900/30"
          >
            ✨ Get AI Match Score for {country} Jobs
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-400 mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-slate-600">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-slate-600">Jobs</Link>
          <span>/</span>
          <span className="text-slate-600">{country}</span>
        </nav>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">No jobs found in {country} right now.</p>
            <Link href="/jobs" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              Browse all MENA jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-bold text-slate-900 hover:text-orange-500 transition-colors line-clamp-1"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Building2 className="w-3 h-3" />{job.company}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />{job.location}
                      </span>
                      {job.employment_type && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {job.employment_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {job.description?.slice(0, 120)}...
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Internal links to other countries — great for SEO */}
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4 text-sm">Browse Jobs by Country</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SLUG_TO_CODE).map(([slug]) => (
              <Link
                key={slug}
                href={`/jobs/location/${slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  slug === params.country
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {slugToLabel(slug)}
              </Link>
            ))}
          </div>
        </div>

        {/* JSON-LD for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'JobPosting',
              'name':     `Jobs in ${country}`,
              'description': `Find the best job opportunities in ${country} with MenaJob AI.`,
              'hiringOrganization': { '@type': 'Organization', 'name': 'MenaJob AI' },
              'jobLocation': { '@type': 'Place', 'address': { '@type': 'PostalAddress', 'addressCountry': country } },
            })
          }}
        />
      </div>
    </div>
  );
}
