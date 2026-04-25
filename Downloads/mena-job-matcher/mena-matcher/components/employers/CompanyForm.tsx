'use client';
// components/employers/CompanyForm.tsx

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { upsertCompany } from '@/app/actions/employer';
import { useLang } from '@/lib/i18n/LanguageContext';
import type { Company } from '@/lib/types';

interface Props {
  initial?: Partial<Company>;
}

export function CompanyForm({ initial }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const T = isAr
    ? {
        nameLabel:    'اسم الشركة',
        namePh:       'شركة أكمي ميدل إيست',
        websiteLabel: 'الموقع الإلكتروني',
        websitePh:    'https://acme.com',
        logoLabel:    'رابط الشعار',
        logoHint:     'الصق رابط صورة عام (سنضيف الرفع لاحقاً)',
        logoPh:       'https://…/logo.png',
        aboutLabel:   'نبذة عن الشركة',
        aboutPh:      'فقرة قصيرة سيراها المرشحون في إعلانات وظائفك.',
        submitCreate: 'إنشاء ملف الشركة',
        submitSave:   'حفظ التغييرات',
        required:     '*',
      }
    : {
        nameLabel:    'Company name',
        namePh:       'Acme MENA Holdings',
        websiteLabel: 'Website',
        websitePh:    'https://acme.com',
        logoLabel:    'Logo URL',
        logoHint:     "Paste a public image URL (we'll add upload later)",
        logoPh:       'https://…/logo.png',
        aboutLabel:   'About the company',
        aboutPh:      'One short paragraph candidates will see on your job listings.',
        submitCreate: 'Create company profile',
        submitSave:   'Save changes',
        required:     '*',
      };

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
    <form action={handleSubmit} className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <Field label={T.nameLabel} required>
        <input
          name="name"
          required
          defaultValue={initial?.name ?? ''}
          placeholder={T.namePh}
          className="input"
        />
      </Field>

      <Field label={T.websiteLabel}>
        <input
          name="website"
          type="url"
          defaultValue={initial?.website ?? ''}
          placeholder={T.websitePh}
          className="input"
        />
      </Field>

      <Field label={T.logoLabel} hint={T.logoHint}>
        <input
          name="logo_url"
          type="url"
          defaultValue={initial?.logo_url ?? ''}
          placeholder={T.logoPh}
          className="input"
        />
      </Field>

      <Field label={T.aboutLabel}>
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ''}
          placeholder={T.aboutPh}
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
        {initial?.id ? T.submitSave : T.submitCreate}
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
