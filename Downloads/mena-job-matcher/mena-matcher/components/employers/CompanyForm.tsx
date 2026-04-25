'use client';
// components/employers/CompanyForm.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { upsertCompany } from '@/app/actions/employer';
import type { Company } from '@/lib/types';

interface Props {
  initial?: Partial<Company>;
}

export function CompanyForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await upsertCompany(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <Field label="Company name" required>
        <input
          name="name"
          required
          defaultValue={initial?.name ?? ''}
          placeholder="Acme MENA Holdings"
          className="input"
        />
      </Field>

      <Field label="Website">
        <input
          name="website"
          type="url"
          defaultValue={initial?.website ?? ''}
          placeholder="https://acme.com"
          className="input"
        />
      </Field>

      <Field label="Logo URL" hint="Paste a public image URL (we'll add upload later)">
        <input
          name="logo_url"
          type="url"
          defaultValue={initial?.logo_url ?? ''}
          placeholder="https://…/logo.png"
          className="input"
        />
      </Field>

      <Field label="About the company">
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ''}
          placeholder="One short paragraph candidates will see on your job listings."
          className="input resize-y"
        />
      </Field>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {initial?.id ? 'Save changes' : 'Create company profile'}
      </button>

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
