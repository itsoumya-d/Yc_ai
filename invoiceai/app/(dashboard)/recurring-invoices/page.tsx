import { getRecurringInvoices } from '@/lib/actions/recurring-invoices';
import { getClients } from '@/lib/actions/clients';
import { RecurringInvoiceList } from '@/components/recurring/recurring-invoice-list';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Recurring Invoices',
};

export default async function RecurringInvoicesPage() {
  const [{ data: recurringInvoices }, { clients }] = await Promise.all([
    getRecurringInvoices(),
    getClients(),
  ]);

  return (
    <RecurringInvoiceList
      initialInvoices={recurringInvoices ?? []}
      clients={clients ?? []}
    />
  );
}
