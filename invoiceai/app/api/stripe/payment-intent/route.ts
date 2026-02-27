import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch invoice (portal access — no user auth needed, public invoice)
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        id, invoice_number, amount_due, currency, status, portal_token,
        client:clients(name, email),
        user:users(stripe_connect_account_id, business_name)
      `)
      .or(`portal_token.eq.${invoiceId},id.eq.${invoiceId}`)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (['paid', 'cancelled'].includes(invoice.status)) {
      return NextResponse.json({ error: 'Invoice already paid or cancelled' }, { status: 400 });
    }

    const stripe = getStripe();
    const inv = invoice as Record<string, unknown>;
    const user = inv.user as { stripe_connect_account_id?: string; business_name?: string } | null;
    const client = inv.client as { name: string; email: string } | null;

    // Create PaymentIntent (with optional Stripe Connect transfer)
    const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
      amount: Math.round((inv.amount_due as number) * 100),
      currency: ((inv.currency as string) || 'usd').toLowerCase(),
      metadata: {
        invoice_id: inv.id as string,
        invoice_number: inv.invoice_number as string,
      },
      receipt_email: client?.email,
      description: `Invoice ${inv.invoice_number as string} from ${user?.business_name ?? 'InvoiceAI'}`,
    };

    // Route payment to connected Stripe account if available
    if (user?.stripe_connect_account_id) {
      const platformFeePercent = 0.01; // 1% platform fee
      const feeAmount = Math.round((inv.amount_due as number) * 100 * platformFeePercent);
      paymentIntentParams.application_fee_amount = Math.max(50, feeAmount); // min 50 cents
      paymentIntentParams.transfer_data = {
        destination: user.stripe_connect_account_id,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      invoiceNumber: inv.invoice_number,
      amount: inv.amount_due,
      currency: inv.currency,
    });
  } catch (err) {
    console.error('Payment intent creation failed:', err);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
