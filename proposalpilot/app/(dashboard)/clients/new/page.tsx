import { PageHeader } from '@/components/layout/page-header';
import { ClientForm } from '@/components/clients/client-form';

export const dynamic = 'force-dynamic';

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Client" description="Add a new client to your list." />
      <ClientForm />
    </div>
  );
}
