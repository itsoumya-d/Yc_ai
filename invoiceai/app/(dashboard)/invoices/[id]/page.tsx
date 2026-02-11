import { notFound } from 'next/navigation';
import { getInvoice } from '@/lib/actions/invoices';
import { InvoiceDetail } from '@/components/invoices/invoice-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getInvoice(id);
  if (!result.success || !result.data) {
    return { title: 'Invoice Not Found' };
  }
  return { title: `Invoice ${result.data.invoice_number}` };
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getInvoice(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <InvoiceDetail invoice={result.data} />;
}
