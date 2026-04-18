// app/api/payments/webhook/route.ts
// MyFatoorah server-to-server webhook (IPN) — fires independently of user browser
// Register this URL in MyFatoorah Dashboard → Webhook URL
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.MYFATOORAH_BASE_URL ?? 'https://api.myfatoorah.com';
const API_KEY  = process.env.MYFATOORAH_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[myfatoorah/webhook] Received:', JSON.stringify(body));

    const invoiceId = body.InvoiceId ?? body.Data?.InvoiceId;
    if (!invoiceId) return NextResponse.json({ ok: false }, { status: 400 });

    // Verify with MyFatoorah
    const res = await fetch(`${BASE_URL}/v2/GetPaymentStatus`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
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

    if (!userId || !planId) {
      // Fallback: try CustomerReference
      userId = data.Data?.CustomerReference ?? '';
    }

    if (!userId) {
      console.error('[webhook] No userId found in webhook payload');
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Update Supabase
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    if (planId === 'pro_monthly') {
      await sb.from('profiles').update({
        tier:            'pro',
        credits:         500,
        last_reset_date: new Date().toISOString(),
      }).eq('user_id', userId);
      console.log(`[webhook] Pro activated for ${userId}`);
    } else {
      const { data: prof } = await sb.from('profiles').select('credits').eq('user_id', userId).single();
      await sb.from('profiles').update({
        credits: (prof?.credits ?? 0) + 50,
      }).eq('user_id', userId);
      console.log(`[webhook] +50 credits for ${userId}`);
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[myfatoorah/webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}