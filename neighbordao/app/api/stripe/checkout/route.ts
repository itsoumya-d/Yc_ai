import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';

const PLAN_PRICES: Record<string, string> = {
  community: process.env.STRIPE_PRICE_COMMUNITY ?? '',
  hoa: process.env.STRIPE_PRICE_HOA ?? '',
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.formData().catch(() => null);
  const plan = body?.get('plan') as string ?? 'community';
  const priceId = PLAN_PRICES[plan];
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const stripe = getStripe();
  const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();

  let customerId = sub?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_user_id: user.id } });
    customerId = customer.id;
    await supabase.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, plan: 'free', status: 'active' }, { onConflict: 'user_id' });
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?success=1`,
    cancel_url: `${origin}/settings`,
    subscription_data: { metadata: { supabase_user_id: user.id, plan } },
  });

  return NextResponse.redirect(session.url!, 303);
}
