import { getInvoices } from '@/lib/actions/invoices';
import { InvoiceList } from '@/components/invoices/invoice-list';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Invoices',
};

export default async function InvoicesPage() {
  const { invoices, total } = await getInvoices();

  return <InvoiceList initialInvoices={invoices} totalCount={total} />;
}
