'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  cancelRecurringInvoice,
  deleteRecurringInvoice,
} from '@/lib/actions/recurring-invoices';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Client, RecurringInvoiceWithClient } from '@/types/database';

interface RecurringInvoiceListProps {
  initialInvoices: RecurringInvoiceWithClient[];
  clients: Client[];
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannual: 'Every 6 Months',
  annual: 'Annually',
};

const statusVariants: Record<string, 'paid' | 'overdue' | 'pending' | 'draft' | 'sent' | 'viewed' | 'partial' | 'cancelled'> = {
  active: 'paid',
  paused: 'partial',
  cancelled: 'cancelled',
  completed: 'sent',
};

export function RecurringInvoiceList({ initialInvoices, clients }: RecurringInvoiceListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');

  const filtered = invoices.filter((inv) =>
    statusFilter === 'all' ? true : inv.status === statusFilter
  );

  // Stats
  const activeCount = invoices.filter((i) => i.status === 'active').length;
  const pausedCount = invoices.filter((i) => i.status === 'paused').length;
  const totalMonthlyValue = invoices
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => {
      const total = (i.invoice_template as any)?.total ?? 0;
      const freq = i.frequency;
      // Normalize to monthly value
      const multipliers: Record<string, number> = {
        weekly: 4.33,
        biweekly: 2.17,
        monthly: 1,
        quarterly: 1 / 3,
        semiannual: 1 / 6,
        annual: 1 / 12,
      };
      return sum + total * (multipliers[freq] ?? 1);
    }, 0);

  const handlePause = async (id: string) => {
    setLoadingId(id);
    const result = await pauseRecurringInvoice(id);
    setLoadingId(null);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: 'paused' } : inv))
      );
      toast({ title: 'Recurring invoice paused', variant: 'success' });
    }
  };

  const handleResume = async (id: string) => {
    setLoadingId(id);
    const result = await resumeRecurringInvoice(id);
    setLoadingId(null);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: 'active' } : inv))
      );
      toast({ title: 'Recurring invoice resumed', variant: 'success' });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this recurring invoice? This cannot be undone.')) return;
    setLoadingId(id);
    const result = await cancelRecurringInvoice(id);
    setLoadingId(null);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: 'cancelled' } : inv))
      );
      toast({ title: 'Recurring invoice cancelled', variant: 'success' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recurring invoice permanently?')) return;
    setLoadingId(id);
    const result = await deleteRecurringInvoice(id);
    setLoadingId(null);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast({ title: 'Recurring invoice deleted', variant: 'success' });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Recurring Invoices
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Automate your invoicing on a schedule.
          </p>
        </div>
        <Button onClick={() => router.push('/recurring-invoices/new')}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Recurring Invoice
        </Button>
      </div>

      {/* Stats */}
      {invoices.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Active</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">recurring schedules</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Paused</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pausedCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">need attention</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Monthly Revenue</p>
            <p className="mt-1 font-amount text-2xl font-bold text-[var(--foreground)]">
              {formatCurrency(totalMonthlyValue)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">from active schedules</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-[var(--muted)] p-1 w-fit">
        {(['all', 'active', 'paused', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
              statusFilter === status
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            }
            title={statusFilter === 'all' ? 'No recurring invoices' : `No ${statusFilter} recurring invoices`}
            description={
              statusFilter === 'all'
                ? 'Set up automatic invoicing to save time and ensure consistent billing.'
                : `You have no ${statusFilter} recurring invoices.`
            }
            action={
              statusFilter === 'all' ? (
                <Button onClick={() => router.push('/recurring-invoices/new')}>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Recurring Invoice
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">
                    Next Invoice
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--muted-foreground)]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((invoice) => {
                  const template = invoice.invoice_template as any;
                  const amount = template?.total ?? 0;
                  const isLoading = loadingId === invoice.id;

                  return (
                    <tr
                      key={invoice.id}
                      className="transition-colors hover:bg-[var(--muted)]/30"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {invoice.client?.name ?? 'Unknown Client'}
                          </p>
                          {invoice.client?.company && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {invoice.client.company}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-[var(--foreground)]">
                          {frequencyLabels[invoice.frequency] ?? invoice.frequency}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {invoice.status === 'active' && invoice.next_invoice_date ? (
                          <span className="text-sm text-[var(--foreground)]">
                            {formatDate(invoice.next_invoice_date)}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-amount font-medium text-[var(--foreground)]">
                          {formatCurrency(amount)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariants[invoice.status] ?? 'draft'}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                        {invoice.status === 'paused' && invoice.paused_reason && (
                          <p className="mt-1 text-xs text-amber-600">{invoice.paused_reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={isLoading}
                              className="h-8 w-8"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {invoice.status === 'active' && (
                              <DropdownMenuItem onClick={() => handlePause(invoice.id)}>
                                Pause
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'paused' && (
                              <DropdownMenuItem onClick={() => handleResume(invoice.id)}>
                                Resume
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'cancelled' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleCancel(invoice.id)}>
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(invoice.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
