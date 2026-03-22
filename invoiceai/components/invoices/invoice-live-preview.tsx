'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import type { InvoiceItemInput } from '@/lib/actions/invoices';

interface InvoiceLivePreviewProps {
  invoiceNumber?: string;
  clientName?: string;
  clientEmail?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: number;
  items: InvoiceItemInput[];
  taxRate: number;
  notes?: string;
}

export function InvoiceLivePreview({
  invoiceNumber,
  clientName,
  clientEmail,
  issueDate,
  dueDate,
  paymentTerms,
  items,
  taxRate,
  notes,
}: InvoiceLivePreviewProps) {
  const validItems = items.filter((item) => item.description.trim());
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] dark:bg-[var(--card)]"
    >
      {/* Preview header bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-[var(--muted-foreground)]">Invoice Preview</span>
      </div>

      {/* Invoice document */}
      <div className="p-6 font-sans text-sm">
        {/* Invoice header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-[var(--foreground)]">Your Business</div>
            <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">yourname@example.com</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--foreground)]">INVOICE</div>
            <div className="mt-0.5 font-mono text-xs text-[var(--muted-foreground)]">
              {invoiceNumber || '#INV-XXXX'}
            </div>
          </div>
        </div>

        {/* Bill to + dates */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[var(--muted)] p-3">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Bill To
            </div>
            <div className="font-semibold text-[var(--foreground)]">
              {clientName || <span className="italic text-[var(--muted-foreground)]">Client name</span>}
            </div>
            {clientEmail && (
              <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">{clientEmail}</div>
            )}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Issue Date</span>
              <span className="font-medium text-[var(--foreground)]">{formatDisplayDate(issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Due Date</span>
              <span className="font-medium text-[var(--foreground)]">{formatDisplayDate(dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Terms</span>
              <span className="font-medium text-[var(--foreground)]">Net {paymentTerms}</span>
            </div>
          </div>
        </div>

        {/* Line items table */}
        <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="px-3 py-2 text-left font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Description
                </th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Qty
                </th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Rate
                </th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {validItems.length > 0 ? (
                validItems.map((item, i) => (
                  <tr key={i} className="bg-[var(--card)]">
                    <td className="px-3 py-2 text-[var(--foreground)]">{item.description}</td>
                    <td className="px-3 py-2 text-right text-[var(--muted-foreground)]">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-[var(--muted-foreground)]">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-[var(--foreground)]">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center italic text-[var(--muted-foreground)]">
                    Add line items to see them here
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-48 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Tax ({taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-1.5">
              <span className="font-bold text-[var(--foreground)]">Total Due</span>
              <span className="font-bold text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-4 rounded-lg bg-[var(--muted)] p-3">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Notes
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] text-[var(--muted-foreground)]">
          Thank you for your business!
        </div>
      </div>
    </motion.div>
  );
}
