import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe-actions';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();
    const sb = createServerSupabaseClient();
    const { data: { user } } = await sb.auth.getUser();
    const result = await createCheckoutSession(planId, user?.id ?? 'guest');
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}