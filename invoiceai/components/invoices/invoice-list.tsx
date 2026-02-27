'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { bulkUpdateInvoiceStatus, bulkDeleteInvoices } from '@/lib/actions/invoices';
import type { InvoiceWithDetails } from '@/types/database';

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

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

  // Summary stats — group by currency
  const currencyTotals = initialInvoices.reduce<Record<string, { outstanding: number; overdue: number; paid: number }>>((acc, inv) => {
    const cur = inv.currency || 'USD';
    if (!acc[cur]) acc[cur] = { outstanding: 0, overdue: 0, paid: 0 };
    if (['sent', 'viewed', 'partial', 'overdue'].includes(inv.status)) acc[cur].outstanding += inv.amount_due;
    if (inv.status === 'overdue') acc[cur].overdue += inv.amount_due;
    if (inv.status === 'paid') acc[cur].paid += inv.total;
    return acc;
  }, {});

  const primaryCurrency = Object.keys(currencyTotals).sort((a, b) =>
    (currencyTotals[b].paid + currencyTotals[b].outstanding) - (currencyTotals[a].paid + currencyTotals[a].outstanding)
  )[0] || 'USD';

  const totalOutstanding = Object.entries(currencyTotals).reduce((sum, [, v]) => sum + v.outstanding, 0);
  const totalOverdue = Object.entries(currencyTotals).reduce((sum, [, v]) => sum + v.overdue, 0);
  const totalPaid = Object.entries(currencyTotals).reduce((sum, [, v]) => sum + v.paid, 0);

  // Selection helpers
  const allFilteredSelected = filteredInvoices.length > 0 && filteredInvoices.every((inv) => selectedIds.has(inv.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map((inv) => inv.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Bulk action handlers
  function handleBulkAction(action: 'mark_paid' | 'mark_sent' | 'delete') {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    startTransition(async () => {
      if (action === 'delete') {
        if (!confirm(`Delete ${ids.length} invoice${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
        await bulkDeleteInvoices(ids);
      } else {
        const status = action === 'mark_paid' ? 'paid' : 'sent';
        await bulkUpdateInvoiceStatus(ids, status);
      }
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allFilteredSelected}
          onChange={toggleSelectAll}
          className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
        />
      ),
      render: (inv: InvoiceWithDetails) => (
        <input
          type="checkbox"
          checked={selectedIds.has(inv.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(inv.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
        />
      ),
    },
    {
      key: 'invoice_number',
      header: 'Invoice',
      render: (inv: InvoiceWithDetails) => (
        <div>
          <p className="font-medium text-[var(--foreground)]">{inv.invoice_number}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {inv.client?.name ?? 'No client'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv: InvoiceWithDetails) => (
        <Badge variant={inv.status as 'paid' | 'overdue' | 'pending' | 'draft' | 'sent' | 'viewed' | 'partial' | 'cancelled'}>
          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'issue_date',
      header: 'Date',
      sortable: true,
      render: (inv: InvoiceWithDetails) => (
        <span className="text-sm text-[var(--muted-foreground)]">{formatDate(inv.issue_date)}</span>
      ),
    },
    {
      key: 'due_date',
      header: 'Due',
      sortable: true,
      render: (inv: InvoiceWithDetails) => (
        <span className="text-sm text-[var(--muted-foreground)]">{formatDate(inv.due_date)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      className: 'text-right',
      render: (inv: InvoiceWithDetails) => (
        <span className="font-amount font-medium">{formatCurrency(inv.total, inv.currency || 'USD')}</span>
      ),
    },
    {
      key: 'amount_due',
      header: 'Balance',
      sortable: true,
      className: 'text-right',
      render: (inv: InvoiceWithDetails) => (
        <span className={`font-amount ${inv.amount_due > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          {formatCurrency(inv.amount_due, inv.currency || 'USD')}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {totalCount} invoice{totalCount !== 1 ? 's' : ''} total
            {Object.keys(currencyTotals).length > 1 && (
              <span className="ml-1">
                in {Object.keys(currencyTotals).length} currencies
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => router.push('/invoices/new')}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Invoice
        </Button>
      </div>

      {/* Summary Bar */}
      {totalCount > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Outstanding</p>
            <p className="mt-1 font-amount text-xl font-bold text-amber-600">
              {formatCurrency(totalOutstanding, primaryCurrency)}
            </p>
            {Object.keys(currencyTotals).length > 1 && (
              <div className="mt-1 space-y-0.5">
                {Object.entries(currencyTotals).filter(([, v]) => v.outstanding > 0).map(([cur, v]) => (
                  <p key={cur} className="text-xs text-[var(--muted-foreground)]">
                    {formatCurrency(v.outstanding, cur)}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Overdue</p>
            <p className="mt-1 font-amount text-xl font-bold text-red-600">
              {formatCurrency(totalOverdue, primaryCurrency)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Collected</p>
            <p className="mt-1 font-amount text-xl font-bold text-green-600">
              {formatCurrency(totalPaid, primaryCurrency)}
            </p>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-3">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('mark_sent')}
              disabled={isPending}
              className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50"
            >
              Mark Sent
            </button>
            <button
              onClick={() => handleBulkAction('mark_paid')}
              disabled={isPending}
              className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50"
            >
              Mark Paid
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isPending}
              className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Clear selection
          </button>
          {isPending && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-transparent" />
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
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

      {/* Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(inv) => inv.id}
          onRowClick={(inv) => router.push(`/invoices/${inv.id}`)}
          emptyState={
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
          }
        />
      </div>
    </>
  );
}
