import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { PageHeader } from '@/components/layout/page-header';
import { ClientList } from '@/components/clients/client-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const { data: clients } = await getClients();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your clients and their contact information."
        action={<Link href="/clients/new"><Button><Plus className="w-4 h-4 mr-1" />Add Client</Button></Link>}
      />
      <ClientList clients={clients ?? []} />
    </div>
  );
}
