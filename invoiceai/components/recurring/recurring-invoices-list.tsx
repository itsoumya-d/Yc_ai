'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  cancelRecurringInvoice,
  deleteRecurringInvoice,
} from '@/lib/actions/recurring-invoices';
import type { RecurringInvoiceWithClient } from '@/types/database';

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannual: 'Every 6 Months',
  annual: 'Annually',
  custom: 'Custom',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
};

interface RecurringInvoicesListProps {
  initialInvoices: RecurringInvoiceWithClient[];
}

export function RecurringInvoicesList({ initialInvoices }: RecurringInvoicesListProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  function optimisticUpdate(id: string, patch: Partial<RecurringInvoiceWithClient>) {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv))
    );
  }

  async function handlePause(id: string) {
    setActionId(id);
    startTransition(async () => {
      const result = await pauseRecurringInvoice(id);
      if (!result.error) {
        optimisticUpdate(id, { status: 'paused', paused_at: new Date().toISOString() });
      }
      setActionId(null);
    });
  }

  async function handleResume(id: string) {
    setActionId(id);
    startTransition(async () => {
      const result = await resumeRecurringInvoice(id);
      if (!result.error) {
        optimisticUpdate(id, { status: 'active', paused_at: null, paused_reason: null });
      }
      setActionId(null);
    });
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this recurring invoice? No future invoices will be generated.')) return;
    setActionId(id);
    startTransition(async () => {
      const result = await cancelRecurringInvoice(id);
      if (!result.error) {
        optimisticUpdate(id, { status: 'cancelled', cancelled_at: new Date().toISOString() });
      }
      setActionId(null);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recurring invoice? This cannot be undone.')) return;
    setActionId(id);
    startTransition(async () => {
      const result = await deleteRecurringInvoice(id);
      if (!result.error) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
      setActionId(null);
    });
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No recurring invoices yet</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Set up recurring invoices to automatically bill clients on a schedule.
        </p>
        <Link
          href="/recurring-invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Recurring Invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const isLoading = actionId === invoice.id && isPending;
        const template = invoice.invoice_template;

        return (
          <div
            key={invoice.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Client + frequency info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--foreground)] truncate">
                    {invoice.client?.name ?? 'Unknown Client'}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[invoice.status] ?? STATUS_STYLES.cancelled}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>

                {invoice.client?.company && (
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">{invoice.client.company}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    {FREQUENCY_LABELS[invoice.frequency] ?? invoice.frequency}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    Next: {formatDate(invoice.next_invoice_date, 'short')}
                  </span>
                  {invoice.end_date && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                      Ends: {formatDate(invoice.end_date, 'short')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                    {invoice.total_invoices_generated} invoices generated
                  </span>
                </div>

                {invoice.status === 'paused' && invoice.paused_reason && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
                    Paused: {invoice.paused_reason}
                  </p>
                )}
              </div>

              {/* Right: Amount + actions */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xl font-bold text-[var(--foreground)]">
                    {formatCurrency(template.total, template.currency)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">per invoice</p>
                </div>

                <div className="flex items-center gap-2">
                  {invoice.status === 'active' && (
                    <button
                      onClick={() => handlePause(invoice.id)}
                      disabled={isLoading}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? 'Pausing...' : 'Pause'}
                    </button>
                  )}

                  {invoice.status === 'paused' && (
                    <button
                      onClick={() => handleResume(invoice.id)}
                      disabled={isLoading}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? 'Resuming...' : 'Resume'}
                    </button>
                  )}

                  {(invoice.status === 'active' || invoice.status === 'paused') && (
                    <button
                      onClick={() => handleCancel(invoice.id)}
                      disabled={isLoading}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  {(invoice.status === 'cancelled' || invoice.status === 'completed') && (
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      disabled={isLoading}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
