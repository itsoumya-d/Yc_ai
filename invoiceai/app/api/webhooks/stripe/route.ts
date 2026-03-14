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

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata?.invoice_id;

      if (invoiceId) {
        // Create payment record
        await supabase.from('payments').insert({
          invoice_id: invoiceId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          payment_method: 'card',
          stripe_payment_intent_id: paymentIntent.id,
          status: 'succeeded',
          client_email: paymentIntent.receipt_email,
        });

        // Update invoice status
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total, amount_paid')
          .eq('id', invoiceId)
          .single();

        if (invoice) {
          const newAmountPaid = (invoice.amount_paid ?? 0) + paymentIntent.amount / 100;
          const newAmountDue = invoice.total - newAmountPaid;
          const newStatus = newAmountDue <= 0 ? 'paid' : 'partial';

          await supabase
            .from('invoices')
            .update({
              amount_paid: newAmountPaid,
              amount_due: Math.max(0, newAmountDue),
              status: newStatus,
              paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            })
            .eq('id', invoiceId);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata?.invoice_id;

      if (invoiceId) {
        await supabase.from('payments').insert({
          invoice_id: invoiceId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          payment_method: 'card',
          stripe_payment_intent_id: paymentIntent.id,
          status: 'failed',
          failure_reason: paymentIntent.last_payment_error?.message ?? 'Payment failed',
        });
      }
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      if (account.details_submitted) {
        await supabase
          .from('users')
          .update({ stripe_connect_onboarded: true })
          .eq('stripe_connect_account_id', account.id);
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const planName = (subscription.metadata?.plan ?? 'pro') as 'free' | 'pro' | 'business';
      const userId = subscription.metadata?.supabase_user_id;

      const PLAN_LIMITS: Record<string, number> = {
        free: 5,
        starter: 20,
        pro: 100,
        business: 999999,
      };

      const stripeStatus = subscription.status;
      const mappedStatus = stripeStatus === 'canceled' ? 'cancelled' : stripeStatus as 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';

      if (userId) {
        // Access billing period fields via type assertion (moved in Stripe API clover)
        const subBilling = subscription as unknown as { current_period_start?: number; current_period_end?: number };
        await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan: planName,
              status: mappedStatus,
              current_period_start: subBilling.current_period_start ? new Date(subBilling.current_period_start * 1000).toISOString() : null,
              current_period_end: subBilling.current_period_end ? new Date(subBilling.current_period_end * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancelled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              invoice_limit: PLAN_LIMITS[planName] ?? 100,
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
          invoice_limit: 5,
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
