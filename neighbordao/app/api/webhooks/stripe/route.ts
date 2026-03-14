import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const plan = sub.metadata?.plan ?? 'community';
      if (userId) {
        const s = sub as unknown as { current_period_end?: number };
        await supabase.from('subscriptions').upsert(
          { user_id: userId, stripe_customer_id: sub.customer as string, stripe_subscription_id: sub.id, plan, status: sub.status === 'canceled' ? 'cancelled' : sub.status as 'active' | 'past_due' | 'trialing', current_period_end: s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null },
          { onConflict: 'user_id' }
        );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) await supabase.from('subscriptions').update({ status: 'cancelled', plan: 'free', stripe_subscription_id: null }).eq('user_id', userId);
      break;
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice;
      await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', inv.customer as string);
      break;
    }
  }
  return NextResponse.json({ received: true });
}
