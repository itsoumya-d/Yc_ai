import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const plan = sub.metadata?.plan ?? 'starter';
      if (userId) {
        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: sub.customer as string,
            stripe_subscription_id: sub.id,
            plan,
            status: sub.status,
            current_period_end: (() => { const s = sub as unknown as { current_period_end?: number }; return s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null; })(),
          },
          { onConflict: 'user_id' }
        );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await supabase.from('subscriptions').update({ status: 'canceled', plan: 'free', stripe_subscription_id: null }).eq('user_id', userId);
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', invoice.customer as string);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
