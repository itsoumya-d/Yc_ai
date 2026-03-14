import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, PLANS, type PlanKey } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await request.json() as { plan: PlanKey };
  const planConfig = PLANS[plan];
  if (!planConfig?.priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // Get user's org
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id, email, full_name')
    .eq('id', user.id)
    .single();

  if (!userData?.organization_id) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 });
  }

  // Get or check existing subscription
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', userData.organization_id)
    .single();

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006';

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?subscription=success`,
    cancel_url: `${appUrl}/settings?subscription=canceled`,
    metadata: {
      supabase_user_id: user.id,
      organization_id: userData.organization_id,
      plan,
    },
    subscription_data: {
      metadata: { supabase_user_id: user.id, organization_id: userData.organization_id, plan },
    },
  };

  if (existingSub?.stripe_customer_id) {
    sessionParams.customer = existingSub.stripe_customer_id;
  } else {
    sessionParams.customer_email = user.email;
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
