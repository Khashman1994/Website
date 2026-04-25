'use client';
// components/employers/EmployerDashboardView.tsx

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, Briefcase, MapPin, ExternalLink, Plus, Sparkles,
  Pencil, Trash2, Loader2,
} from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { CompanyForm } from './CompanyForm';
import { JobPostForm } from './JobPostForm';
import { deleteJob } from '@/app/actions/employer';
import type { Company, Job } from '@/lib/types';

interface Props {
  email: string | null | undefined;
  company: Company | null;
  jobs: Job[];
  showPostForm: boolean;
}

export function EmployerDashboardView({ email, company, jobs, showPostForm }: Props) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const T = isAr
    ? {
        portal:        'لوحة أصحاب العمل',
        welcome:       'مرحباً — لنُعدّ ملف شركتك',
        welcomeSub:    'يظهر هذا الملف في كل وظيفة تنشرها. يمكنك تعديله في أي وقت.',
        editCompany:   'تعديل',
        yourJobs:      'وظائفك المنشورة',
        jobsLive:      (n: number) => (n === 1 ? 'وظيفة واحدة منشورة' : `${n} وظائف منشورة`),
        postNew:       'نشر وظيفة جديدة',
        newPostingH:   'وظيفة جديدة',
        postingAs:     'تُنشر باسم',
        emptyTitle:    'لم تنشر أي وظائف بعد. وظيفتك الأولى ستظهر فوراً — مجاناً.',
        emptyCta:      'انشر وظيفتك الأولى',
        view:          'عرض',
        edit:          'تعديل',
        del:           'حذف',
        confirmDelete: 'حذف هذه الوظيفة نهائياً؟',
        remoteTag:     'عن بُعد',
      }
    : {
        portal:        'Employer Portal',
        welcome:       "Welcome — let's set up your company",
        welcomeSub:    'This appears on every job you post. You can edit it any time.',
        editCompany:   'Edit',
        yourJobs:      'Your job postings',
        jobsLive:      (n: number) => `${n} ${n === 1 ? 'job' : 'jobs'} live`,
        postNew:       'Post new job',
        newPostingH:   'New job posting',
        postingAs:     'Posted as',
        emptyTitle:    'No jobs posted yet. Your first listing goes live instantly — for free.',
        emptyCta:      'Post your first job',
        view:          'View',
        edit:          'Edit',
        del:           'Delete',
        confirmDelete: 'Delete this job permanently?',
        remoteTag:     'Remote',
      };

  // ── No company yet → show creation form ────────────────────────────────────
  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-warm" dir={isAr ? 'rtl' : 'ltr'}>
        <DashHeader email={email} portalLabel={T.portal} />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-4">
              <Building2 className="w-6 h-6 text-primary-500" />
            </div>
            <h1 className="font-display text-3xl text-neutral-900 mb-2">{T.welcome}</h1>
            <p className="text-neutral-600">{T.welcomeSub}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
            <CompanyForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm" dir={isAr ? 'rtl' : 'ltr'}>
      <DashHeader email={email} portalLabel={T.portal} />

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
            {T.editCompany}
          </Link>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl text-neutral-900">{T.yourJobs}</h2>
            <p className="text-sm text-neutral-600">{T.jobsLive(jobs.length)}</p>
          </div>
          {!showPostForm && (
            <Link
              href="/employers/dashboard?new=1"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {T.postNew}
            </Link>
          )}
        </div>

        {showPostForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 mb-8">
            <h3 className="font-semibold text-lg text-neutral-900 mb-1">{T.newPostingH}</h3>
            <p className="text-sm text-neutral-600 mb-6">
              {T.postingAs} <span className="font-medium text-neutral-800">{company.name}</span>
            </p>
            <JobPostForm />
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
            <Briefcase className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">{T.emptyTitle}</p>
            {!showPostForm && (
              <Link
                href="/employers/dashboard?new=1"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg"
              >
                <Plus className="w-4 h-4" /> {T.emptyCta}
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} t={T} isAr={isAr} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function JobRow({
  job,
  t,
  isAr,
}: {
  job: Job;
  t: { view: string; edit: string; del: string; confirmDelete: string; remoteTag: string };
  isAr: boolean;
}) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();

  const onDelete = () => {
    if (!window.confirm(t.confirmDelete)) return;
    startDelete(async () => {
      const res = await deleteJob(job.id);
      if (!res.ok) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <li className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-neutral-900 truncate">{job.title}</div>
          <div className="text-sm text-neutral-600 inline-flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
            {job.remote && (
              <span className="ms-2 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">
                {t.remoteTag}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/employers/dashboard/edit/${job.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
            title={t.edit}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.edit}</span>
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
            title={t.del}
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{t.del}</span>
          </button>
          <Link
            href={`/jobs/${job.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 px-2"
          >
            {t.view}
          </Link>
        </div>
      </div>
    </li>
  );
}

function DashHeader({ email, portalLabel }: { email?: string | null; portalLabel: string }) {
  return (
    <header className="px-6 py-4 border-b border-neutral-200 bg-white/70 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/employers" className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-neutral-800">{portalLabel}</span>
        </Link>
        <span className="text-xs text-neutral-500 truncate max-w-[180px]">{email}</span>
      </div>
    </header>
  );
}
