import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch the invoice with its owner's Stripe Connect account
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, amount_due, currency, invoice_number, user_id, client:clients(name, email)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.amount_due <= 0) {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Get the invoice owner's Stripe Connect account
    const { data: owner } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_onboarded')
      .eq('id', invoice.user_id)
      .single();

    if (!owner?.stripe_connect_account_id || !owner.stripe_connect_onboarded) {
      return NextResponse.json(
        { error: 'Payment not available. The business has not connected their payment account.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Calculate application fee (e.g., 2% for platform)
    const amountInCents = Math.round(invoice.amount_due * 100);
    const applicationFee = Math.round(amountInCents * 0.02);

    const client = invoice.client as unknown as { name: string; email: string } | null;

    // Create a PaymentIntent with destination charge to the connected account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: (invoice.currency ?? 'usd').toLowerCase(),
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
      },
      receipt_email: client?.email ?? undefined,
      description: `Payment for invoice ${invoice.invoice_number}`,
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: owner.stripe_connect_account_id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
