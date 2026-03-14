import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { invoiceId, token } = await request.json();

  if (!invoiceId && !token) {
    return NextResponse.json({ error: 'Invoice ID or token required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up invoice by portal_token or id (no auth required — public portal)
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, amount_due, currency, status,
      user:users(stripe_connect_account_id, stripe_connect_onboarded)
    `)
    .or(token ? `portal_token.eq.${token}` : `id.eq.${invoiceId}`)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
  }

  if (invoice.amount_due <= 0) {
    return NextResponse.json({ error: 'No amount due' }, { status: 400 });
  }

  const user = (invoice.user as unknown) as { stripe_connect_account_id: string | null; stripe_connect_onboarded: boolean } | null;

  const stripe = getStripe();
  const amountInCents = Math.round(invoice.amount_due * 100);
  const currency = (invoice.currency ?? 'USD').toLowerCase();

  const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
    amount: amountInCents,
    currency,
    metadata: {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
    },
    automatic_payment_methods: { enabled: true },
  };

  // Route to connected account if set up
  if (user?.stripe_connect_account_id && user.stripe_connect_onboarded) {
    const applicationFeePercent = 0.02; // 2% platform fee
    paymentIntentParams.application_fee_amount = Math.round(amountInCents * applicationFeePercent);
    paymentIntentParams.transfer_data = {
      destination: user.stripe_connect_account_id,
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create payment intent';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
