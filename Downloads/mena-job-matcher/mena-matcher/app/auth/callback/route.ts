// app/auth/callback/route.ts
// Handles both Google OAuth redirect and email confirmation links
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  // OAuth error from Google
  if (error) {
    console.error('[auth/callback] OAuth error:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Exchange error:', exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Ensure profile row exists (new Google OAuth users have no row yet)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          await supabase.from('profiles').insert({
            user_id:          user.id,
            email:            user.email ?? '',
            full_name:        user.user_metadata?.full_name ?? '',
            tier:             'free',
            credits:          0,
            free_matches_used: 0,
            last_reset_date:  new Date().toISOString(),
          });
          console.log('[auth/callback] Created profile for new OAuth user:', user.email);
        }
      }
    } catch (profileErr) {
      // Non-blocking — user can still use the app, profile created lazily
      console.warn('[auth/callback] Profile upsert warning:', profileErr);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code and no error — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}