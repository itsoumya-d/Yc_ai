import { notFound } from 'next/navigation';
import { getClient } from '@/lib/actions/clients';
import { ClientDetail } from '@/components/clients/client-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getClient(id);
  if (!result.success || !result.data) {
    return { title: 'Client Not Found' };
  }
  return { title: result.data.name };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getClient(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ClientDetail client={result.data} />;
}
