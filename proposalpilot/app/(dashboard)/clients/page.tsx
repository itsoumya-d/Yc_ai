import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { PageHeader } from '@/components/layout/page-header';
import { ClientList } from '@/components/clients/client-list';
import { ImportClientsButton } from '@/components/clients/import-clients-button';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const t = await getTranslations('clients');
  const { data: clients } = await getClients();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <div className="flex items-center gap-2">
            <ImportClientsButton />
            <Link href="/clients/new"><Button><Plus className="w-4 h-4 mr-1" />{t('add')}</Button></Link>
          </div>
        }
      />
      <ClientList clients={clients ?? []} />
    </div>
  );
}
