import Link from 'next/link';
import { getRecurringInvoices, getRecurringInvoiceStats } from '@/lib/actions/recurring-invoices';
import { RecurringInvoicesList } from '@/components/recurring/recurring-invoices-list';
import { formatCurrency } from '@/lib/utils';

export default async function RecurringInvoicesPage() {
  const [{ data: invoices = [] }, { data: stats }] = await Promise.all([
    getRecurringInvoices(),
    getRecurringInvoiceStats(),
  ]);

  const monthlyValue = stats?.total_monthly_value ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Recurring Invoices
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Automatically bill clients on a recurring schedule
          </p>
        </div>
        <Link
          href="/recurring-invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Recurring Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Active Schedules</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{stats?.active ?? 0}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Paused</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{stats?.paused ?? 0}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Monthly Recurring Revenue</p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            {formatCurrency(monthlyValue)}
          </p>
        </div>
      </div>

      {/* List */}
      <RecurringInvoicesList initialInvoices={invoices} />
    </div>
  );
}
