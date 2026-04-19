// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const BASE_URL   = process.env.MYFATOORAH_BASE_URL   ?? 'https://apitest.myfatoorah.com';
const API_KEY    = process.env.MYFATOORAH_API_KEY;

const PLANS: Record<string, { value: number; description: string; credits: number }> = {
  pro_monthly: { value: 19.99, description: 'MENA Matcher Pro — 500 Stars', credits: 500 },
  coins_50:    { value: 10.00, description: 'MENA Matcher — 50 Stars',       credits: 50  },
};

export async function POST(req: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: 'Payment not configured' }, { status: 503 });

  try {
    const { planId } = await req.json();
    const plan = PLANS[planId];
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    // Get current user
    const sb = createServerSupabaseClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const body = {
      PaymentMethodId:    2,          // 2 = KNET (Kuwait) | use 1 for credit card
      CustomerName:       user.email?.split('@')[0] ?? 'Customer',
      DisplayCurrencyIso: 'KWD',
      MobileCountryCode:  '+965',
      CustomerMobile:     '00000000',
      CustomerEmail:      user.email ?? '',
      InvoiceValue:       plan.value,
      CallBackUrl:        `${appUrl}/api/payments/callback?planId=${planId}&userId=${user.id}`,
      ErrorUrl:           `${appUrl}/pricing?error=payment_failed`,
      Language:           'en',
      CustomerReference:  user.id,
      CustomerCivilId:    '',
      UserDefinedField:   JSON.stringify({ planId, userId: user.id }),
      ExpiryDate:         '',
      NotificationOption: 'LNK',
      InvoiceItems: [{
        ItemName:    plan.description,
        Quantity:    1,
        UnitPrice:   plan.value,
      }],
    };

    const res = await fetch(`${BASE_URL}/v2/ExecutePayment`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.IsSuccess) {
      console.error('[myfatoorah] ExecutePayment error:', data.Message, data.ValidationErrors);
      return NextResponse.json({ error: data.Message ?? 'Payment initiation failed' }, { status: 400 });
    }

    const paymentUrl = data.Data?.PaymentURL;
    const invoiceId  = data.Data?.InvoiceId;
    console.log(`[myfatoorah] Invoice created: ${invoiceId} | URL: ${paymentUrl}`);

    return NextResponse.json({ paymentUrl, invoiceId });

  } catch (err: any) {
    console.error('[myfatoorah] Error:', err);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
