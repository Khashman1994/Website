// app/employers/dashboard/layout.tsx
// Server-side role gate for the employer dashboard tree.
// Protects /employers/dashboard AND every nested route (e.g. /edit/[id]).
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/employers/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.role === 'candidate') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
