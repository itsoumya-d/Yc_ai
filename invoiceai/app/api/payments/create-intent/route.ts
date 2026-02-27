import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch invoice by portal_token or id (public — no auth needed for portal)
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, user_id, amount_due, currency, invoice_number, status')
      .or(`portal_token.eq.${invoiceId},id.eq.${invoiceId}`)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    if (invoice.amount_due <= 0) {
      return NextResponse.json({ error: 'No amount due on this invoice' }, { status: 400 });
    }

    // Fetch user's Stripe Connect account
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_onboarded')
      .eq('id', invoice.user_id)
      .single();

    if (!profile?.stripe_connect_account_id || !profile.stripe_connect_onboarded) {
      return NextResponse.json(
        { error: 'Online payments are not available for this invoice. Please contact the sender.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create PaymentIntent on the connected account
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(invoice.amount_due * 100), // convert to cents
        currency: invoice.currency.toLowerCase(),
        metadata: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
        },
        automatic_payment_methods: { enabled: true },
      },
      { stripeAccount: profile.stripe_connect_account_id }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      connectedAccountId: profile.stripe_connect_account_id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
