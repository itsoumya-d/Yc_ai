import { notFound } from 'next/navigation';
import { getClient } from '@/lib/actions/clients';
import { ClientDetail } from '@/components/clients/client-detail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getClient(id);
  return { title: data?.name ?? 'Client' };
}

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: client, error } = await getClient(id);
  if (error || !client) notFound();

  return <ClientDetail client={client} />;
}
