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
  }

  return NextResponse.json({ received: true });
}
