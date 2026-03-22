import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { invoiceId } = await req.json();
  if (!invoiceId) return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, amount_due, currency, invoice_number, client:clients(email, name)')
    .or(`portal_token.eq.${invoiceId},id.eq.${invoiceId}`)
    .single();

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  if (invoice.amount_due <= 0) return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(invoice.amount_due * 100),
    currency: (invoice.currency ?? 'usd').toLowerCase(),
    metadata: { invoice_id: invoice.id, invoice_number: invoice.invoice_number },
    receipt_email: (invoice.client as { email?: string } | null)?.email ?? undefined,
    description: `Payment for Invoice ${invoice.invoice_number}`,
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
