// app/employers/dashboard/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, Briefcase, MapPin, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getMyCompany, listMyJobs } from '@/app/actions/employer';
import { CompanyForm } from '@/components/employers/CompanyForm';
import { JobPostForm } from '@/components/employers/JobPostForm';

export const dynamic = 'force-dynamic';

export default async function EmployerDashboard({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/employers/dashboard');

  const company = await getMyCompany();

  // ── Onboarding: no company yet → show the company form ────────────────────
  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <DashHeader email={user.email} />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-4">
              <Building2 className="w-6 h-6 text-primary-500" />
            </div>
            <h1 className="font-display text-3xl text-neutral-900 mb-2">
              Welcome — let&apos;s set up your company
            </h1>
            <p className="text-neutral-600">
              This appears on every job you post. You can edit it any time.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
            <CompanyForm />
          </div>
        </div>
      </div>
    );
  }

  // ── Has company → show jobs + post form ───────────────────────────────────
  const jobs = await listMyJobs();
  const showPostForm = searchParams?.new === '1';

  return (
    <div className="min-h-screen bg-gradient-warm">
      <DashHeader email={user.email} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Company strip */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-primary-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-neutral-900 truncate">{company.name}</div>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                {company.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <Link
            href="/employers/dashboard?edit=company"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Edit
          </Link>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl text-neutral-900">Your job postings</h2>
            <p className="text-sm text-neutral-600">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} live
            </p>
          </div>
          {!showPostForm && (
            <Link
              href="/employers/dashboard?new=1"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Post new job
            </Link>
          )}
        </div>

        {/* Inline post form */}
        {showPostForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 mb-8">
            <h3 className="font-semibold text-lg text-neutral-900 mb-1">New job posting</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Posted as <span className="font-medium text-neutral-800">{company.name}</span>
            </p>
            <JobPostForm />
          </div>
        )}

        {/* Jobs list */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
            <Briefcase className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">
              No jobs posted yet. Your first listing goes live instantly — for free.
            </p>
            {!showPostForm && (
              <Link
                href="/employers/dashboard?new=1"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg"
              >
                <Plus className="w-4 h-4" /> Post your first job
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-neutral-900 truncate">{job.title}</div>
                    <div className="text-sm text-neutral-600 inline-flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                      {job.remote && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">Remote</span>}
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 whitespace-nowrap"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DashHeader({ email }: { email?: string | null }) {
  return (
    <header className="px-6 py-4 border-b border-neutral-200 bg-white/70 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/employers" className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-neutral-800">Employer Portal</span>
        </Link>
        <span className="text-xs text-neutral-500 truncate max-w-[180px]">{email}</span>
      </div>
    </header>
  );
}
