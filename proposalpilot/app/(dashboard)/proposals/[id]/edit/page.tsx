import { notFound } from 'next/navigation';
import { getProposal } from '@/lib/actions/proposals';
import { getClients } from '@/lib/actions/clients';
import { PageHeader } from '@/components/layout/page-header';
import { ProposalForm } from '@/components/proposals/proposal-form';

export const dynamic = 'force-dynamic';

export default async function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [proposalRes, clientsRes] = await Promise.all([getProposal(id), getClients()]);
  if (proposalRes.error || !proposalRes.data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Proposal" description={`Editing "${proposalRes.data.title}"`} />
      <ProposalForm proposal={proposalRes.data} clients={clientsRes.data ?? []} />
    </div>
  );
}
