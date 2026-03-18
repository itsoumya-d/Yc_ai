'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { bulkDeleteInvoicesAction, bulkUpdateStatusAction } from '@/lib/actions/invoices';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { InvoiceWithDetails } from '@/types/database';
import { PresenceAvatars } from '@/components/PresenceAvatars';
import { createClient } from '@/lib/supabase/client';

interface InvoiceListProps {
  initialInvoices: InvoiceWithDetails[];
  totalCount: number;
}

type StatusFilter = 'all' | 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Viewed', value: 'viewed' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export function InvoiceList({ initialInvoices, totalCount }: InvoiceListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
        });
      }
    });
  }, []);

  const filteredInvoices = initialInvoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.client?.name.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  // Summary stats
  const totalOutstanding = initialInvoices
    .filter((inv) => ['sent', 'viewed', 'partial', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount_due, 0);

  const totalOverdue = initialInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount_due, 0);

  const totalPaid = initialInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  // Selection helpers
  const allFilteredIds = filteredInvoices.map((inv) => inv.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredIds));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedInvoices = filteredInvoices.filter((inv) => selectedIds.has(inv.id));
  const selectedDraftIds = selectedInvoices.filter((inv) => inv.status === 'draft').map((inv) => inv.id);

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.size} invoice(s)? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await bulkDeleteInvoicesAction(Array.from(selectedIds));
      if (result.success) {
        toast({ title: `${result.deletedCount} invoice(s) deleted`, variant: 'success' });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleBulkMarkPaid = () => {
    startTransition(async () => {
      const result = await bulkUpdateStatusAction(Array.from(selectedIds), 'paid');
      if (result.success) {
        toast({ title: `${result.updatedCount} invoice(s) marked as paid`, variant: 'success' });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleBulkSend = () => {
    if (selectedDraftIds.length === 0) {
      toast({ title: 'No draft invoices selected', variant: 'destructive' });
      return;
    }
    startTransition(async () => {
      const result = await bulkUpdateStatusAction(selectedDraftIds, 'sent');
      if (result.success) {
        toast({ title: `${result.updatedCount} invoice(s) marked as sent`, variant: 'success' });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {totalCount} invoice{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <PresenceAvatars channelId="invoices-room" currentUser={currentUser} />
          )}
          <Button onClick={() => router.push('/invoices/new')}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      {totalCount > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Outstanding</p>
            <p className="mt-1 font-amount text-xl font-bold text-amber-600">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Overdue</p>
            <p className="mt-1 font-amount text-xl font-bold text-red-600">
              {formatCurrency(totalOverdue)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Collected</p>
            <p className="mt-1 font-amount text-xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => { setStatusFilter(filter.value); setSelectedIds(new Set()); }}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            {selectedDraftIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleBulkSend} disabled={isPending}>
                Mark Sent ({selectedDraftIds.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleBulkMarkPaid} disabled={isPending}>
              Mark Paid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="text-red-600 hover:text-red-700"
            >
              Delete ({selectedIds.size})
            </Button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            }
            title={search ? 'No invoices found' : 'No invoices yet'}
            description={
              search
                ? 'Try adjusting your search or filters.'
                : 'Create your first invoice to start getting paid.'
            }
            action={
              !search ? (
                <Button onClick={() => router.push('/invoices/new')}>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Your First Invoice
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Due
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Balance
                    </th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={cn(
                        'transition-colors hover:bg-[var(--muted)]',
                        selectedIds.has(inv.id) && 'bg-[var(--muted)]'
                      )}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inv.id)}
                          onChange={() => toggleSelect(inv.id)}
                          className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                          aria-label={`Select invoice ${inv.invoice_number}`}
                        />
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3 text-sm"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{inv.invoice_number}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {inv.client?.name ?? 'No client'}
                          </p>
                        </div>
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3 text-sm"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 flex-shrink-0 rounded-full ${
                              inv.status === 'paid'
                                ? 'bg-green-500'
                                : inv.status === 'overdue'
                                ? 'bg-red-500'
                                : inv.status === 'sent' || inv.status === 'viewed'
                                ? 'bg-blue-500'
                                : inv.status === 'partial'
                                ? 'bg-amber-500'
                                : 'bg-[var(--muted-foreground)] opacity-50'
                            }`}
                          />
                          <Badge variant={inv.status as 'paid' | 'overdue' | 'pending' | 'draft' | 'sent' | 'viewed' | 'partial' | 'cancelled'}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </Badge>
                        </div>
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3 text-sm"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <span className="text-[var(--muted-foreground)]">{formatDate(inv.issue_date)}</span>
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3 text-sm"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <span className="text-[var(--muted-foreground)]">{formatDate(inv.due_date)}</span>
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3 text-right text-sm"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <span className="font-amount font-medium">{formatCurrency(inv.total)}</span>
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3 text-right text-sm"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <span className={`font-amount ${inv.amount_due > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          {formatCurrency(inv.amount_due)}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                              </svg>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}`)}>
                              View
                            </DropdownMenuItem>
                            {inv.status === 'draft' && (
                              <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}/edit`)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => window.open(`/api/invoices/${inv.id}/pdf`, '_blank')}>
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/invoices/${inv.id}`)}
                              className="text-[var(--muted-foreground)]"
                            >
                              Duplicate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
