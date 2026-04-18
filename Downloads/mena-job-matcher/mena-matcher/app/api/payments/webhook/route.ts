// app/api/payments/webhook/route.ts
// MyFatoorah server-to-server webhook (IPN)
// Register in MyFatoorah Dashboard → Webhook URL → https://www.menajob-ai.com/api/payments/webhook
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.MYFATOORAH_BASE_URL ?? 'https://api.myfatoorah.com';
const TOKEN    = process.env.MYFATOORAH_TOKEN ?? process.env.MYFATOORAH_API_KEY ?? '';

const PLAN_CREDITS: Record<string, { credits: number; tier?: string }> = {
  coins_25:    { credits: 25  },
  coins_50:    { credits: 50  },
  pro_monthly: { credits: 500, tier: 'pro' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[webhook] Received:', JSON.stringify(body));

    const invoiceId = body.InvoiceId ?? body.Data?.InvoiceId;
    if (!invoiceId) return NextResponse.json({ ok: false }, { status: 400 });

    // Verify with MyFatoorah
    const res = await fetch(`${BASE_URL}/v2/GetPaymentStatus`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Key: String(invoiceId), KeyType: 'InvoiceId' }),
    });
    const data = await res.json();

    if (!data.IsSuccess || data.Data?.InvoiceStatus !== 'Paid') {
      console.warn('[webhook] Not paid:', data.Data?.InvoiceStatus);
      return NextResponse.json({ ok: false });
    }

    // Extract userId + planId from UserDefinedField
    let userId = '';
    let planId = '';
    try {
      const udf = JSON.parse(data.Data?.UserDefinedField ?? '{}');
      userId = udf.userId ?? '';
      planId = udf.planId ?? '';
    } catch {}

    // Fallback to CustomerReference
    if (!userId) userId = data.Data?.CustomerReference ?? '';
    if (!userId) {
      console.error('[webhook] No userId in payload');
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const plan = PLAN_CREDITS[planId];
    const creditsToAdd = plan?.credits ?? 5;

    if (plan?.tier === 'pro') {
      await sb.from('profiles').update({
        tier:            'pro',
        credits:         500,
        last_reset_date: new Date().toISOString(),
      }).eq('user_id', userId);
      console.log(`[webhook] Pro activated for ${userId}`);
    } else {
      const { data: prof } = await sb
        .from('profiles').select('credits').eq('user_id', userId).single();
      await sb.from('profiles').update({
        credits: (prof?.credits ?? 0) + creditsToAdd,
      }).eq('user_id', userId);
      console.log(`[webhook] +${creditsToAdd} credits for ${userId}`);
    }

    // Log to payments table
    await sb.from('payments').insert({
      user_id:               userId,
      myfatoorah_payment_id: String(invoiceId),
      amount:                data.Data?.InvoiceValue ?? 0,
      credits_added:         creditsToAdd,
      status:                'paid',
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}