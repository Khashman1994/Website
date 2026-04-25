// app/employers/page.tsx
// Server shell: decides CTA targets from auth state and delegates rendering
// (and i18n via useLang) to the client view.

import { createServerSupabaseClient } from '@/lib/supabase';
import { EmployerLandingView } from '@/components/employers/EmployerLandingView';

export const metadata = {
  title: 'For Employers — Post Jobs Free | MENA Job Matcher',
  description:
    'Reach pre-qualified MENA talent. Post unlimited jobs for free, get AI-matched candidates, and grow your team faster.',
};

export const dynamic = 'force-dynamic';

export default async function EmployersLandingPage() {
  // If the visitor is already logged in, skip the auth funnel and send them
  // straight to the employer dashboard. The dashboard handles the
  // "no company yet" case by rendering the CompanyForm, which on submit
  // promotes profile.role → 'employer' via the upsertCompany Server Action.
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const primaryCta   = user ? '/employers/dashboard' : '/signup?role=employer&redirectTo=/employers/dashboard';
  const secondaryCta = user ? '/employers/dashboard' : '/login?redirectTo=/employers/dashboard';

  return (
    <EmployerLandingView
      loggedIn={!!user}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
    />
  );
}
