// app/employers/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getMyCompany, listMyJobs } from '@/app/actions/employer';
import { EmployerDashboardView } from '@/components/employers/EmployerDashboardView';

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
  const jobs    = company ? await listMyJobs() : [];

  return (
    <EmployerDashboardView
      email={user.email}
      company={company}
      jobs={jobs}
      showPostForm={searchParams?.new === '1'}
    />
  );
}
