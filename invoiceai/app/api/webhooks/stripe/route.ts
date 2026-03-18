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
        // Idempotency: skip if we already processed this payment intent
        const { data: existing } = await supabase
          .from('payments')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .maybeSingle();

        if (!existing) {
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

          // Atomic update: increment amount_paid in a single UPDATE to avoid race conditions
          const paymentAmount = paymentIntent.amount / 100;
          await supabase.rpc('apply_payment', {
            p_invoice_id: invoiceId,
            p_amount: paymentAmount,
          });
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
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.supabase_user_id;
      if (userId) {
        const plan = sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free';
        await supabase.from('profiles').update({
          plan,
          plan_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_subscription_id: sub.id,
        }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.supabase_user_id;
      if (userId) {
        await supabase.from('profiles').update({
          plan: 'free',
          plan_expires_at: null,
          stripe_subscription_id: null,
        }).eq('id', userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      console.error('[Stripe] invoice.payment_failed', {
        customerId: stripeInvoice.customer,
        invoiceId: stripeInvoice.id,
        attemptCount: stripeInvoice.attempt_count,
      });
      break;
    }

    case 'invoice.payment_succeeded': {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      if (stripeInvoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(stripeInvoice.subscription as string);
        const userId = sub.metadata.supabase_user_id;
        if (userId) {
          const plan = sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free';
          await supabase.from('profiles').update({
            plan,
            plan_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
            stripe_subscription_id: sub.id,
          }).eq('id', userId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
