import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { RecurringInvoiceForm } from '@/components/recurring/recurring-invoice-form';

export default async function NewRecurringInvoicePage() {
  const { clients } = await getClients({ status: 'active' });

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/recurring-invoices"
          className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Back to recurring invoices"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            New Recurring Invoice
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Set up automatic billing for a client
          </p>
        </div>
      </div>

      <RecurringInvoiceForm clients={clients} />
    </div>
  );
}
