import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const PLAN_LIMITS: Record<string, number> = {
    free: 3,
    basic: 20,
    premium: 999999,
  };

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const planName = (subscription.metadata?.plan ?? 'basic') as string;
      const userId = subscription.metadata?.supabase_user_id;

      const stripeStatus = subscription.status;
      const mappedStatus = stripeStatus === 'canceled' ? 'cancelled' : stripeStatus as 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';

      if (userId) {
        await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan: planName,
              status: mappedStatus,
              current_period_end: (() => { const s = subscription as unknown as { current_period_end?: number }; return s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null; })(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancelled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
              pet_limit: PLAN_LIMITS[planName] ?? 20,
            },
            { onConflict: 'user_id' }
          );
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          plan: 'free',
          cancelled_at: new Date().toISOString(),
          pet_limit: PLAN_LIMITS.free,
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (stripeInvoice as unknown as { subscription?: string }).subscription ?? null;
      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
