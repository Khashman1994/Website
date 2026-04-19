// app/api/payments/callback/route.ts
// MyFatoorah redirects user HERE after payment — verifies + credits + logs
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.MYFATOORAH_BASE_URL ?? 'https://api.myfatoorah.com';
const TOKEN    = process.env.MYFATOORAH_TOKEN ?? process.env.MYFATOORAH_API_KEY ?? '';
const APP_URL  = process.env.NEXT_PUBLIC_SITE_URL
              ?? process.env.NEXT_PUBLIC_APP_URL
              ?? 'https://www.menajob-ai.com';

// Credits granted per plan
const PLAN_CREDITS: Record<string, { credits: number; tier: string; amount: number }> = {
  coins_25:    { credits: 25,  tier: 'free', amount: 4.99  },
  coins_50:    { credits: 50,  tier: 'free', amount: 9.99 },
  pro_monthly: { credits: 500, tier: 'pro',  amount: 19.99 },
};

// Admin client — bypasses RLS for secure server-side DB writes
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId');
  const planId    = searchParams.get('planId')    ?? '';
  const userId    = searchParams.get('userId')    ?? '';

  console.log(`[callback] paymentId=${paymentId} planId=${planId} userId=${userId}`);

  // ── Missing params ─────────────────────────────────────────────────────────
  if (!paymentId || !userId || !planId) {
    console.error('[callback] Missing required params');
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed&reason=missing_params`);
  }

  const sb = adminClient();

  // ── Step 1: Idempotency check — prevent double-crediting ───────────────────
  const { data: existing } = await sb
    .from('payments')
    .select('id, status')
    .eq('myfatoorah_payment_id', paymentId)
    .maybeSingle();

  if (existing) {
    console.log(`[callback] Payment ${paymentId} already processed (status: ${existing.status})`);
    // Already credited — redirect to success silently
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=success`);
  }

  // ── Step 2: Verify with MyFatoorah server-to-server ───────────────────────
  let invoiceStatus = '';
  let invoiceValue  = 0;
  try {
    const res = await fetch(`${BASE_URL}/v2/GetPaymentStatus`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ Key: paymentId, KeyType: 'PaymentId' }),
    });
    const data = await res.json();
    console.log(`[callback] MyFatoorah status response: IsSuccess=${data.IsSuccess} Status=${data.Data?.InvoiceStatus}`);

    if (!data.IsSuccess) {
      throw new Error(`MyFatoorah error: ${data.Message}`);
    }
    invoiceStatus = data.Data?.InvoiceStatus ?? '';
    invoiceValue  = data.Data?.InvoiceValue  ?? 0;
  } catch (err: any) {
    console.error('[callback] Verification failed:', err.message);
    // Log failed attempt
    try { await sb.from('payments').insert({
      user_id:               userId,
      myfatoorah_payment_id: paymentId,
      amount:                0,
      credits_added:         0,
      status:                'verification_failed',
    }); } catch {}
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed&reason=verification_failed`);
  }

  // ── Step 3: Check payment status ──────────────────────────────────────────
  if (invoiceStatus !== 'Paid') {
    console.warn(`[callback] Payment not paid — status: ${invoiceStatus}`);
    try { await sb.from('payments').insert({
      user_id:               userId,
      myfatoorah_payment_id: paymentId,
      amount:                invoiceValue,
      credits_added:         0,
      status:                invoiceStatus.toLowerCase(),
    }); } catch {}
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed&reason=${invoiceStatus.toLowerCase()}`);
  }

  // ── Step 4: Credit the user ────────────────────────────────────────────────
  const plan = PLAN_CREDITS[planId] ?? { credits: 5, tier: 'free', amount: invoiceValue };

  try {
    // Get current credits
    const { data: profile } = await sb
      .from('profiles')
      .select('credits, tier')
      .eq('user_id', userId)
      .single();

    const currentCredits = profile?.credits ?? 0;
    const newCredits     = currentCredits + plan.credits;

    // Update profile
    const updateData: any = { credits: newCredits };
    if (planId === 'pro_monthly') {
      updateData.tier            = 'pro';
      updateData.last_reset_date = new Date().toISOString();
    }

    const { error: updateErr } = await sb
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (updateErr) throw new Error(`Profile update failed: ${updateErr.message}`);

    // Log payment
    await sb.from('payments').insert({
      user_id:               userId,
      myfatoorah_payment_id: paymentId,
      amount:                invoiceValue || plan.amount,
      credits_added:         plan.credits,
      status:                'paid',
    });

    console.log(`[callback] ✓ Credited ${plan.credits} stars to user ${userId} | new balance: ${newCredits}`);

    return NextResponse.redirect(`${APP_URL}/payment-success?credits=${plan.credits}`);

  } catch (err: any) {
    console.error('[callback] DB error:', err.message);
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed&reason=db_error`);
  }
}