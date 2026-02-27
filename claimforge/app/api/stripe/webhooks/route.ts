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
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organization_id;
      const plan = (session.metadata?.plan ?? 'starter') as string;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (organizationId) {
        const planLimits: Record<string, { caseLimit: number; documentLimit: number }> = {
          starter: { caseLimit: 3, documentLimit: 50 },
          professional: { caseLimit: 25, documentLimit: 500 },
          enterprise: { caseLimit: -1, documentLimit: -1 },
        };
        const limits = planLimits[plan] ?? planLimits.starter;

        await supabase.from('subscriptions').upsert({
          organization_id: organizationId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: 'active',
          case_limit: limits.caseLimit,
          document_limit: limits.documentLimit,
        }, { onConflict: 'organization_id' });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const organizationId = sub.metadata?.organization_id;
      const subBilling = sub as unknown as { current_period_end?: number };
      if (organizationId) {
        await supabase.from('subscriptions').update({
          status: sub.status,
          current_period_end: subBilling.current_period_end
            ? new Date(subBilling.current_period_end * 1000).toISOString()
            : null,
        }).eq('stripe_subscription_id', sub.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions').update({
        status: 'canceled',
        plan: 'starter',
        stripe_subscription_id: null,
      }).eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer as string);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
