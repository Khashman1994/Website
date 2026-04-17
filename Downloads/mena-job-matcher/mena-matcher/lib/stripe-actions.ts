// lib/stripe-actions.ts

export type PlanId = 'coins_50' | 'pro_monthly';

// Stars granted per plan
export const PLAN_CREDITS: Record<PlanId, number> = {
  coins_50:    50,
  pro_monthly: 500,
  // TODO: monthly replenishment via Stripe webhook (invoice.paid event):
  // await supabase.from('profiles').update({ credits: 500, last_reset_date: new Date() })
  //               .eq('user_id', userId)
};

export interface CheckoutResult { url?: string; error?: string; }

export async function createCheckoutSession(planId: PlanId, userId: string): Promise<CheckoutResult> {
  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    console.log(`[stripe] Plan="${planId}" | Stars=${PLAN_CREDITS[planId]} | User="${userId}"`);
    return { url: '/pricing?intent=' + planId };
  }
  /*
  const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
  const PRICE_IDS: Record<PlanId, string> = {
    coins_50:    process.env.STRIPE_PRICE_COINS_50!,
    pro_monthly: process.env.STRIPE_PRICE_PRO!,        // $19.99/mo subscription
  };
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode:        planId === 'pro_monthly' ? 'subscription' : 'payment',
    line_items:  [{ price: PRICE_IDS[planId], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata:    { userId, planId, credits: String(PLAN_CREDITS[planId]) },
  });
  return { url: session.url ?? '/pricing' };
  */
  return { url: '/pricing?intent=' + planId };
}

// Called from Stripe webhook (POST /api/webhooks/stripe) after successful payment
export async function handleStripeSuccess(planId: PlanId, userId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  if (planId === 'pro_monthly') {
    // Activate Pro: tier='pro' + 500 stars
    await sb.from('profiles').update({
      tier:            'pro',
      credits:         500,
      last_reset_date: new Date().toISOString(),
    }).eq('user_id', userId);
    console.log(`[stripe] Pro activated for ${userId} — 500 stars`);
  } else if (planId === 'coins_50') {
    // Add 50 stars to balance
    const { data } = await sb.from('profiles').select('credits').eq('user_id', userId).single();
    const current = data?.credits ?? 0;
    await sb.from('profiles').update({ credits: current + 50 }).eq('user_id', userId);
    console.log(`[stripe] +50 stars for ${userId} — balance: ${current + 50}`);
  }
}