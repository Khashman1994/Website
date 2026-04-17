// app/api/auth/signout/route.ts
// Lightweight endpoint called by sendBeacon on tab close
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch { /* best-effort */ }
  return new NextResponse(null, { status: 204 });
}