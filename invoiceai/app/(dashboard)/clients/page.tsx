import { getClients } from '@/lib/actions/clients';
import { ClientList } from '@/components/clients/client-list';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Clients',
};

export default async function ClientsPage() {
  const { clients, total } = await getClients();

  return <ClientList initialClients={clients} totalCount={total} />;
}
