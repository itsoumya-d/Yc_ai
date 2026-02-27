import { getClients } from '@/lib/actions/clients';
import { RecurringInvoiceForm } from '@/components/recurring/recurring-invoice-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Recurring Invoice',
};

export default async function NewRecurringInvoicePage() {
  const { clients } = await getClients();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
          New Recurring Invoice
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Set up automatic invoicing on a recurring schedule.
        </p>
      </div>
      <RecurringInvoiceForm clients={clients ?? []} />
    </div>
  );
}
