// app/jobs/[id]/page.tsx
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building2, ExternalLink, ArrowLeft, Briefcase } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
              ?? process.env.NEXT_PUBLIC_APP_URL
              ?? 'https://www.menajob-ai.com';

// ── Supabase server client (no auth needed — public job data) ─────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Fetch single job ──────────────────────────────────────────────────────────
async function getJob(id: string) {
  const { data, error } = await getSupabase()
    .from('jobs')
    .select('id, title, company, location, description, url, employment_type, remote, salary_min, salary_max, salary_currency, posted_at')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
}

// ── generateMetadata — Social Media Preview ───────────────────────────────────
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const job = await getJob(decodeURIComponent(params.id));

  if (!job) {
    return {
      title: 'Job Not Found | MenaJob AI',
      description: 'This job listing is no longer available.',
    };
  }

  const title       = `${job.title} at ${job.company} in ${job.location} | MenaJob AI`;
  const description = (job.description ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 155) + (job.description?.length > 155 ? '...' : '');
  const pageUrl     = `${BASE_URL}/jobs/${job.id}`;
  const ogImage     = `${BASE_URL}/api/og?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:       pageUrl,
      siteName:  'MenaJob AI',
      type:      'article',
      images: [{
        url:    ogImage,
        width:  1200,
        height: 630,
        alt:    title,
      }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [ogImage],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// ── Employment type mapper ────────────────────────────────────────────────────
function toSchemaEmploymentType(type?: string): string {
  const map: Record<string, string> = {
    'full-time':  'FULL_TIME',
    'fulltime':   'FULL_TIME',
    'part-time':  'PART_TIME',
    'parttime':   'PART_TIME',
    'contract':   'CONTRACTOR',
    'contractor': 'CONTRACTOR',
    'freelance':  'CONTRACTOR',
    'temporary':  'TEMPORARY',
    'intern':     'INTERN',
    'volunteer':  'VOLUNTEER',
  };
  return map[type?.toLowerCase() ?? ''] ?? 'FULL_TIME';
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJob(decodeURIComponent(params.id));
  if (!job) notFound();

  const salary = job.salary_min
    ? `${job.salary_min.toLocaleString()} – ${job.salary_max?.toLocaleString()} ${job.salary_currency ?? ''}`
    : null;

  // ── JSON-LD: Schema.org JobPosting ────────────────────────────────────────
  const jsonLd = {
    '@context':       'https://schema.org',
    '@type':          'JobPosting',
    title:            job.title,
    description:      job.description ?? job.title,
    datePosted:       job.posted_at
                        ? new Date(job.posted_at).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
    validThrough:     new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    employmentType:   toSchemaEmploymentType(job.employment_type),
    jobLocationType:  job.remote ? 'TELECOMMUTE' : undefined,
    url:              `${BASE_URL}/jobs/${job.id}`,
    hiringOrganization: {
      '@type': 'Organization',
      name:    job.company,
    },
    jobLocation: {
      '@type':  'Place',
      address: {
        '@type':           'PostalAddress',
        addressLocality:   job.location?.split(',')[0]?.trim() ?? job.location,
        addressCountry:    job.location?.toLowerCase().includes('uae') ? 'AE'
                         : job.location?.toLowerCase().includes('saudi') ? 'SA'
                         : job.location?.toLowerCase().includes('kuwait') ? 'KW'
                         : job.location?.toLowerCase().includes('qatar') ? 'QA'
                         : job.location?.toLowerCase().includes('egypt') ? 'EG'
                         : job.location?.toLowerCase().includes('jordan') ? 'JO'
                         : 'AE',
      },
    },
    ...(job.salary_min && {
      baseSalary: {
        '@type':    'MonetaryAmount',
        currency:   job.salary_currency ?? 'USD',
        value: {
          '@type':    'QuantitativeValue',
          minValue:   job.salary_min,
          maxValue:   job.salary_max ?? job.salary_min,
          unitText:   'MONTH',
        },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* JSON-LD Structured Data for Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />{job.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />{job.location}
            </span>
            {job.employment_type && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />{job.employment_type}
              </span>
            )}
            {job.remote && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                Remote
              </span>
            )}
          </div>
          {salary && (
            <p className="mt-3 text-orange-300 font-semibold">{salary}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-6">
          <h2 className="font-semibold text-slate-900 text-lg mb-4">Job Description</h2>
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {job.description ?? 'No description available.'}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href={job.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-200 active:scale-95">
            <ExternalLink className="w-5 h-5" />
            Apply for this Job
          </a>
          <p className="text-slate-400 text-xs mt-3">
            Opens the original job posting
          </p>
        </div>

        {/* AI Match CTA */}
        <div className="mt-8 p-6 bg-orange-50 border border-orange-100 rounded-2xl text-center">
          <p className="font-semibold text-slate-800 mb-1">
            🤖 Want to know how well this job matches your profile?
          </p>
          <p className="text-slate-500 text-sm mb-4">
            Upload your CV and get an AI-powered match score in seconds.
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm">
            Get Your Match Score — Free
          </Link>
        </div>
      </div>
    </div>
  );
}