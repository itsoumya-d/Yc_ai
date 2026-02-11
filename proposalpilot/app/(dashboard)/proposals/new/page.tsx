import { getClients } from '@/lib/actions/clients';
import { PageHeader } from '@/components/layout/page-header';
import { ProposalForm } from '@/components/proposals/proposal-form';

export const dynamic = 'force-dynamic';

export default async function NewProposalPage() {
  const { data: clients } = await getClients();

  return (
    <div className="space-y-6">
      <PageHeader title="New Proposal" description="Create a new proposal for a client." />
      <ProposalForm clients={clients ?? []} />
    </div>
  );
}
