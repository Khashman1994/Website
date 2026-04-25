// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code       = searchParams.get('code');
  const type       = searchParams.get('type');
  const redirectTo = searchParams.get('redirectTo');
  const roleParam  = searchParams.get('role');                    // 'employer' | 'candidate' | null
  const error      = searchParams.get('error');

  // Whitelist role from query string — anything else is ignored
  const roleFromUrl: 'employer' | 'candidate' | null =
    roleParam === 'employer' ? 'employer'
    : roleParam === 'candidate' ? 'candidate'
    : null;

  if (error) {
    console.error('[auth/callback] OAuth error:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    // Build the response first so we can mutate its cookies
    const fallback = roleFromUrl === 'employer' ? '/employers/dashboard' : '/dashboard';
    const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : fallback;
    const response = NextResponse.redirect(`${origin}${destination}`);

    // Create SSR client that writes cookies directly to the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Exchange error:', exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Password recovery flow
    if (type === 'recovery') {
      const recoveryRes = NextResponse.redirect(`${origin}/update-password`);
      // Copy session cookies to recovery response
      response.cookies.getAll().forEach(cookie => {
        recoveryRes.cookies.set(cookie.name, cookie.value);
      });
      return recoveryRes;
    }

    // New user (OAuth or email-confirm): create profile row, persisting role
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('user_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        // Resolve role: URL param wins (explicit user intent on this hop),
        // then user_metadata.role (set during signUp), then default to candidate.
        const metadataRole = (user.user_metadata?.role as string | undefined);
        const resolvedRole: 'employer' | 'candidate' =
          roleFromUrl
          ?? (metadataRole === 'employer' || metadataRole === 'candidate' ? metadataRole : 'candidate');

        if (!existing) {
          await supabase.from('profiles').insert({
            user_id:           user.id,
            email:             user.email ?? '',
            full_name:         user.user_metadata?.full_name ?? '',
            role:              resolvedRole,
            tier:              'free',
            credits:           0,
            free_matches_used: 0,
            last_reset_date:   new Date().toISOString(),
          });
          console.log(`[auth/callback] Created profile (role=${resolvedRole}) for:`, user.email);
        } else if (
          // Promote existing 'candidate' → 'employer' if the user signed in
          // explicitly via the employer flow. Never silently demote.
          existing.role !== 'employer' &&
          roleFromUrl === 'employer'
        ) {
          await supabase
            .from('profiles')
            .update({ role: 'employer' })
            .eq('user_id', user.id);
          console.log('[auth/callback] Promoted existing user to employer:', user.email);
        }
      }
    } catch (profileErr) {
      console.warn('[auth/callback] Profile upsert warning:', profileErr);
    }

    // Return response with session cookies set
    return response;
  }

  return NextResponse.redirect(`${origin}/login`);
}
