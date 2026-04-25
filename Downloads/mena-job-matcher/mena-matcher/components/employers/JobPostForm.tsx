'use client';
// components/employers/JobPostForm.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { postJob } from '@/app/actions/employer';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const CURRENCIES = ['USD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD', 'EUR'];

export function JobPostForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await postJob(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      // Bounce back to the dashboard list after a beat
      setTimeout(() => {
        router.push('/employers/dashboard');
        router.refresh();
      }, 700);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <Field label="Job title" required>
        <input
          name="title"
          required
          placeholder="Senior Frontend Engineer"
          className="input"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Location" required>
          <input
            name="location"
            required
            placeholder="Dubai, United Arab Emirates"
            className="input"
          />
        </Field>

        <Field label="Employment type">
          <select name="employment_type" defaultValue="Full-time" className="input">
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" required>
        <textarea
          name="description"
          required
          rows={6}
          placeholder="What the role is about, day-to-day responsibilities, team, mission…"
          className="input resize-y"
        />
      </Field>

      <Field label="Requirements" hint="Skills, experience level, certifications, languages, etc.">
        <textarea
          name="requirements"
          rows={4}
          placeholder="• 5+ years React&#10;• Strong TypeScript&#10;• Arabic preferred"
          className="input resize-y"
        />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-neutral-700 mb-1.5">
          Salary range <span className="text-neutral-400 font-normal">(optional)</span>
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="salary_min"
            type="number"
            min={0}
            placeholder="Min"
            className="input"
          />
          <input
            name="salary_max"
            type="number"
            min={0}
            placeholder="Max"
            className="input"
          />
          <select name="salary_currency" defaultValue="USD" className="input">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="External application URL" hint="If candidates should apply on your site">
          <input
            name="url"
            type="url"
            placeholder="https://acme.com/careers/123"
            className="input"
          />
        </Field>

        <label className="inline-flex items-center gap-2 mt-7 select-none">
          <input
            type="checkbox"
            name="remote"
            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">Remote-friendly</span>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Job posted — redirecting…
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || success}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          Publish job
        </button>
        <button
          type="button"
          onClick={() => router.push('/employers/dashboard')}
          className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 font-medium rounded-lg transition-colors"
        >
          Cancel
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
