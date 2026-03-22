import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const supabase = await createClient();

  // Try to find the invoice by payment reference
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(name, company, email)')
    .eq('id', paymentId)
    .single();

  const paid_at = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Success card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        {/* Animated checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="font-heading text-2xl font-bold text-green-600">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Your payment has been processed and confirmed.
        </p>
      </div>

      {/* Receipt details */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="font-heading text-base font-semibold text-[var(--foreground)]">
          Receipt Details
        </h2>

        <div className="space-y-3 text-sm">
          {invoice ? (
            <>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Invoice</span>
                <span className="font-medium text-[var(--foreground)]">
                  {invoice.invoice_number}
                </span>
              </div>
              {invoice.client && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Billed To</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {(invoice.client as { name: string }).name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Amount Paid</span>
                <span className="font-amount font-bold text-green-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: invoice.currency || 'USD',
                  }).format(invoice.amount_due / 100)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Reference</span>
              <span className="font-mono text-xs text-[var(--foreground)]">
                {paymentId}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Date</span>
            <span className="font-medium text-[var(--foreground)]">{paid_at}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Status</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Paid
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--muted-foreground)]">
          A confirmation has been sent to your email address.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => window.print()}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Print Receipt
        </button>
        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Powered by InvoiceAI &middot; Secure payments via Stripe
        </p>
      </div>
    </div>
  );
}
