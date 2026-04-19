// app/auth/callback/route.ts
// Handles OAuth redirect, email confirmation, and password recovery
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'recovery' for password reset
  const error = searchParams.get('error');

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

    // ── Password recovery flow → redirect to update-password page ─────────
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/update-password`);
    }

    // ── New OAuth user: create profile row ────────────────────────────────
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
            user_id:           user.id,
            email:             user.email ?? '',
            full_name:         user.user_metadata?.full_name ?? '',
            tier:              'free',
            credits:           0,
            free_matches_used: 0,
            last_reset_date:   new Date().toISOString(),
          });
          console.log('[auth/callback] Created profile for new OAuth user:', user.email);
        }
      }
    } catch (profileErr) {
      console.warn('[auth/callback] Profile upsert warning:', profileErr);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
