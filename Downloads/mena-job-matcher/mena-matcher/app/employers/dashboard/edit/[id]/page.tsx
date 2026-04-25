// app/employers/dashboard/edit/[id]/page.tsx
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getMyJob } from '@/app/actions/employer';
import { JobPostForm } from '@/components/employers/JobPostForm';

export const dynamic = 'force-dynamic';

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirectTo=/employers/dashboard/edit/${params.id}`);
  }

  const job = await getMyJob(params.id);
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-gradient-warm">
      <header className="px-6 py-4 border-b border-neutral-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/employers/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to dashboard</span>
          </Link>
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-neutral-800">Employer Portal</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
          <JobPostForm initialJob={job} />
        </div>
      </main>
    </div>
  );
}
