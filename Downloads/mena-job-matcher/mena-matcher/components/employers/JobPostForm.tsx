'use client';
// components/employers/JobPostForm.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { postJob, updateJob } from '@/app/actions/employer';
import { useLang } from '@/lib/i18n/LanguageContext';
import { LocationSelector } from '@/components/ui/LocationSelector';
import type { Job } from '@/lib/types';

const EMPLOYMENT_TYPES = [
  { en: 'Full-time',  ar: 'دوام كامل' },
  { en: 'Part-time',  ar: 'دوام جزئي' },
  { en: 'Contract',   ar: 'عقد' },
  { en: 'Freelance',  ar: 'عمل حر' },
  { en: 'Internship', ar: 'تدريب' },
];
const CURRENCIES = ['USD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD', 'EUR'];

interface Props {
  /** Pass an existing job to switch the form into edit mode. */
  initialJob?: Job;
}

export function JobPostForm({ initialJob }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const isEdit = !!initialJob;

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Single combined "City, Country" string — owned here, populated by LocationSelector
  const [location, setLocation] = useState(initialJob?.location ?? '');

  const T = isAr
    ? {
        title:           'المسمى الوظيفي',
        titlePh:         'مهندس واجهة أمامية أول',
        emp:             'نوع التوظيف',
        desc:            'الوصف',
        descPh:          'تعريف عن الدور، المسؤوليات اليومية، الفريق، الرسالة…',
        req:             'المتطلبات',
        reqHint:         'المهارات، مستوى الخبرة، الشهادات، اللغات، إلخ.',
        reqPh:           '• ٥+ سنوات في React\n• إتقان TypeScript\n• تفضّل اللغة العربية',
        salary:          'نطاق الراتب',
        salaryOpt:       '(اختياري)',
        min:             'الحد الأدنى',
        max:             'الحد الأقصى',
        url:             'رابط التقديم أو البريد الإلكتروني',
        urlHint:         'رابط صفحة التوظيف أو بريد إلكتروني لاستلام الطلبات',
        urlPh:           'https://... أو hr@company.com',
        remote:          'متاح عن بُعد',
        publish:         'نشر الوظيفة',
        save:            'حفظ التغييرات',
        cancel:          'إلغاء',
        successPost:     'تم نشر الوظيفة — جارٍ التحويل…',
        successUpdate:   'تم تحديث الوظيفة — جارٍ التحويل…',
        errLocation:     'يرجى اختيار الدولة والمدينة.',
      }
    : {
        title:           'Job title',
        titlePh:         'Senior Frontend Engineer',
        emp:             'Employment type',
        desc:            'Description',
        descPh:          'What the role is about, day-to-day responsibilities, team, mission…',
        req:             'Requirements',
        reqHint:         'Skills, experience level, certifications, languages, etc.',
        reqPh:           '• 5+ years React\n• Strong TypeScript\n• Arabic preferred',
        salary:          'Salary range',
        salaryOpt:       '(optional)',
        min:             'Min',
        max:             'Max',
        url:             'Application Link or Email',
        urlHint:         'Link to your careers page or an HR email address',
        urlPh:           'https://... or hr@company.com',
        remote:          'Remote-friendly',
        publish:         'Publish job',
        save:            'Save changes',
        cancel:          'Cancel',
        successPost:     'Job posted — redirecting…',
        successUpdate:   'Job updated — redirecting…',
        errLocation:     'Please select a country and city.',
      };

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    // location must include at least "City, Country" — country alone won't fly
    if (!location || !location.includes(',')) {
      return setError(T.errLocation);
    }

    formData.set('location', location);

    startTransition(async () => {
      const res = isEdit
        ? await updateJob(initialJob!.id, formData)
        : await postJob(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/employers/dashboard');
        router.refresh();
      }, 700);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <Field label={T.title} required>
        <input
          name="title"
          required
          defaultValue={initialJob?.title ?? ''}
          placeholder={T.titlePh}
          className="input"
        />
      </Field>

      {/* Country / City — shared cascading selector */}
      <LocationSelector value={location} onChange={setLocation} />

      {/* Hidden field — actual value sent to the Server Action */}
      <input type="hidden" name="location" value={location} />

      <div className="grid md:grid-cols-2 gap-5">
        <Field label={T.emp}>
          <select
            name="employment_type"
            defaultValue={initialJob?.employmentType ?? 'Full-time'}
            className="input"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.en} value={t.en}>{isAr ? t.ar : t.en}</option>
            ))}
          </select>
        </Field>

        <label className="inline-flex items-center gap-2 mt-7 select-none">
          <input
            type="checkbox"
            name="remote"
            defaultChecked={initialJob?.remote ?? false}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">{T.remote}</span>
        </label>
      </div>

      <Field label={T.desc} required>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={initialJob?.description ?? ''}
          placeholder={T.descPh}
          className="input resize-y"
        />
      </Field>

      <Field label={T.req} hint={T.reqHint}>
        <textarea
          name="requirements"
          rows={4}
          defaultValue={initialJob?.requirements ?? ''}
          placeholder={T.reqPh}
          className="input resize-y"
        />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-neutral-700 mb-1.5">
          {T.salary} <span className="text-neutral-400 font-normal">{T.salaryOpt}</span>
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="salary_min"
            type="number"
            min={0}
            defaultValue={initialJob?.salary?.min ?? ''}
            placeholder={T.min}
            className="input"
          />
          <input
            name="salary_max"
            type="number"
            min={0}
            defaultValue={initialJob?.salary?.max ?? ''}
            placeholder={T.max}
            className="input"
          />
          <select
            name="salary_currency"
            defaultValue={initialJob?.salary?.currency ?? 'USD'}
            className="input"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <Field label={T.url} hint={T.urlHint}>
        <input
          name="url"
          type="text"
          defaultValue={initialJob?.url ?? ''}
          placeholder={T.urlPh}
          className="input"
          dir="ltr"
        />
      </Field>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {isEdit ? T.successUpdate : T.successPost}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || success}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? T.save : T.publish}
        </button>
        <button
          type="button"
          onClick={() => router.push('/employers/dashboard')}
          className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 font-medium rounded-lg transition-colors"
        >
          {T.cancel}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid rgb(212 212 216);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px rgb(249 115 22 / 0.5);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
