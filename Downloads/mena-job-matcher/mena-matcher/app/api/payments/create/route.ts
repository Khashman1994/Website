// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const BASE_URL = process.env.MYFATOORAH_BASE_URL  ?? 'https://apitest.myfatoorah.com';
const TOKEN    = process.env.MYFATOORAH_TOKEN      // ← matches MYFATOORAH_TOKEN in .env.local
              ?? process.env.MYFATOORAH_API_KEY;   // fallback for old key name

const PLANS: Record<string, { value: number; description: string }> = {
  starter:     { value: 1.00,  description: 'MENA Matcher Starter — 5 Stars' },
  coins_50:    { value: 10.00, description: 'MENA Matcher — 50 Stars'         },
  pro_monthly: { value: 19.99, description: 'MENA Matcher Pro — 500 Stars'    },
};

export async function POST(req: NextRequest) {
  // ── Env check ─────────────────────────────────────────────────────────────
  if (!TOKEN) {
    console.error('[myfatoorah] ❌ MYFATOORAH_TOKEN is not set in .env.local');
    return NextResponse.json({ error: 'Payment not configured (missing token)' }, { status: 503 });
  }
  console.log(`[myfatoorah] BASE_URL="${BASE_URL}" | TOKEN="${TOKEN.slice(0,12)}..."`);

  try {
    const { planId } = await req.json();
    const plan = PLANS[planId];
    if (!plan) return NextResponse.json({ error: `Invalid planId: "${planId}"` }, { status: 400 });

    // Get current user
    const sb = createServerSupabaseClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized — not logged in' }, { status: 401 });

    // Dynamic base URL — never falls back to localhost in production
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
                 ?? process.env.NEXT_PUBLIC_APP_URL
                 ?? `https://${req.headers.get('host')}`;

    console.log(`[myfatoorah] siteUrl="${siteUrl}"`);

    const body = {
      PaymentMethodId:    2,             // 2 = KNET | 1 = Visa/MC | remove for all methods
      CustomerName:       user.email?.split('@')[0] ?? 'Customer',
      DisplayCurrencyIso: 'USD',
      MobileCountryCode:  '+1',
      CustomerMobile:     '00000000',
      CustomerEmail:      user.email ?? '',
      InvoiceValue:       plan.value,
      CallBackUrl:        `${siteUrl}/api/payments/callback?planId=${planId}&userId=${user.id}`,
      ErrorUrl:           `${siteUrl}/pricing?error=payment_failed`,
      Language:           'en',
      CustomerReference:  user.id,
      UserDefinedField:   JSON.stringify({ planId, userId: user.id }),
      NotificationOption: 'LNK',
      InvoiceItems: [{
        ItemName:  plan.description,
        Quantity:  1,
        UnitPrice: plan.value,
      }],
    };

    // ── Debug: log full request ──────────────────────────────────────────────
    console.log('[myfatoorah] → Request body:', JSON.stringify(body, null, 2));

    const res = await fetch(`${BASE_URL}/v2/ExecutePayment`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      body: JSON.stringify(body),
    });

    // ── Debug: log raw response ──────────────────────────────────────────────
    const rawText = await res.text();
    console.log(`[myfatoorah] ← HTTP ${res.status} | Body: ${rawText.slice(0, 500)}`);

    let data: any;
    try { data = JSON.parse(rawText); }
    catch { return NextResponse.json({ error: `MyFatoorah returned non-JSON: ${rawText.slice(0,200)}` }, { status: 502 }); }

    if (!data.IsSuccess) {
      console.error('[myfatoorah] ❌ IsSuccess=false | Message:', data.Message);
      console.error('[myfatoorah] ValidationErrors:', JSON.stringify(data.ValidationErrors));
      return NextResponse.json({
        error:            data.Message ?? 'Payment initiation failed',
        validationErrors: data.ValidationErrors,
      }, { status: 400 });
    }

    const paymentUrl = data.Data?.PaymentURL;
    const invoiceId  = data.Data?.InvoiceId;
    console.log(`[myfatoorah] ✓ Invoice=${invoiceId} | PaymentURL=${paymentUrl}`);

    return NextResponse.json({ paymentUrl, invoiceId });

  } catch (err: any) {
    console.error('[myfatoorah] Unexpected error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}