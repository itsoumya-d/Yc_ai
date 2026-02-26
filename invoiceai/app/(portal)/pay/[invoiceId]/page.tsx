import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PaymentForm } from './payment-form';
import type { InvoiceWithDetails } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function PaymentPortalPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const supabase = await createClient();

  // Look up invoice by portal_token or id
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(name, company, email), items:invoice_items(*)')
    .or(`portal_token.eq.${invoiceId},id.eq.${invoiceId}`)
    .single();

  if (!invoice) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <h1 className="font-heading text-xl font-semibold text-red-600">Invoice Not Found</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          This payment link may be invalid or expired.
        </p>
      </div>
    );
  }

  const inv = invoice as unknown as InvoiceWithDetails;

  // Mark as viewed if it's the first view
  if (!inv.viewed_at && inv.status === 'sent') {
    await supabase
      .from('invoices')
      .update({ viewed_at: new Date().toISOString(), status: 'viewed' })
      .eq('id', inv.id);
  }

  const isPaid = inv.status === 'paid';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Invoice Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold text-[var(--foreground)]">
              Invoice {inv.invoice_number}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Issued {formatDate(inv.issue_date, 'long')}
            </p>
          </div>
          <Badge variant={inv.status as 'paid' | 'overdue' | 'sent' | 'viewed'}>
            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-6 flex justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Bill To</p>
            <p className="mt-1 font-medium">{inv.client?.name}</p>
            {inv.client?.company && (
              <p className="text-sm text-[var(--muted-foreground)]">{inv.client.company}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Due Date</p>
            <p className="mt-1 font-medium">{formatDate(inv.due_date, 'long')}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {inv.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 text-sm">{item.description}</td>
                <td className="py-3 text-right text-sm font-amount">{item.quantity}</td>
                <td className="py-3 text-right text-sm font-amount">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-3 text-right text-sm font-amount font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Subtotal</span>
            <span className="font-amount">{formatCurrency(inv.subtotal)}</span>
          </div>
          {inv.tax_rate > 0 && (
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Tax ({inv.tax_rate}%)</span>
              <span className="font-amount">{formatCurrency(inv.tax_amount)}</span>
            </div>
          )}
          {inv.discount_amount > 0 && (
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Discount</span>
              <span className="font-amount text-green-600">-{formatCurrency(inv.discount_amount)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3">
            <span className="font-heading text-lg font-bold">Amount Due</span>
            <span className="font-amount text-lg font-bold">
              {formatCurrency(inv.amount_due)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        {isPaid ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-heading text-lg font-semibold text-green-600">Payment Received</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Thank you! This invoice has been paid in full.
            </p>
          </div>
        ) : (
          <PaymentForm
            invoiceId={invoiceId}
            amount={inv.amount_due}
            currency={inv.currency || 'USD'}
            invoiceNumber={inv.invoice_number}
          />
        )}
      </div>

      {/* Notes */}
      {inv.notes && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
            {inv.notes}
          </p>
        </div>
      )}
    </div>
  );
}
