// app/api/payments/callback/route.ts
// MyFatoorah redirects the user HERE after payment (success redirect in browser)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.MYFATOORAH_BASE_URL  ?? 'https://apitest.myfatoorah.com';
const API_KEY  = process.env.MYFATOORAH_API_KEY;
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL  ?? 'http://localhost:3000';

const PLAN_CREDITS: Record<string, { credits: number; tier: string }> = {
  pro_monthly: { credits: 500, tier: 'pro' },
  coins_50:    { credits: 50,  tier: 'free' },
};

async function verifyAndActivate(paymentId: string, planId: string, userId: string) {
  // Verify payment with MyFatoorah
  const res = await fetch(`${BASE_URL}/v2/GetPaymentStatus`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Key: paymentId, KeyType: 'PaymentId' }),
  });
  const data = await res.json();

  if (!data.IsSuccess || data.Data?.InvoiceStatus !== 'Paid') {
    console.warn('[myfatoorah/callback] Payment not confirmed:', data.Data?.InvoiceStatus);
    return false;
  }

  // Activate plan in Supabase
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const plan = PLAN_CREDITS[planId];
  if (!plan) return false;

  if (planId === 'pro_monthly') {
    await sb.from('profiles').update({
      tier:            'pro',
      credits:         500,
      last_reset_date: new Date().toISOString(),
    }).eq('user_id', userId);
  } else {
    const { data: prof } = await sb.from('profiles').select('credits').eq('user_id', userId).single();
    await sb.from('profiles').update({
      credits: (prof?.credits ?? 0) + 50,
    }).eq('user_id', userId);
  }

  console.log(`[myfatoorah/callback] Activated ${planId} for ${userId}`);
  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId');
  const planId    = searchParams.get('planId')    ?? '';
  const userId    = searchParams.get('userId')    ?? '';

  if (!paymentId || !planId || !userId) {
    return NextResponse.redirect(`${APP_URL}/pricing?error=missing_params`);
  }

  try {
    const success = await verifyAndActivate(paymentId, planId, userId);
    if (success) {
      return NextResponse.redirect(`${APP_URL}/dashboard?upgraded=true`);
    }
    return NextResponse.redirect(`${APP_URL}/pricing?error=payment_not_verified`);
  } catch (err) {
    console.error('[myfatoorah/callback] Error:', err);
    return NextResponse.redirect(`${APP_URL}/pricing?error=server_error`);
  }
}
