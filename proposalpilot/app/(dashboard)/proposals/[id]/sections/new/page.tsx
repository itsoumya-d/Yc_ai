import { notFound } from 'next/navigation';
import { getProposal } from '@/lib/actions/proposals';
import { PageHeader } from '@/components/layout/page-header';
import { ProposalSectionEditor } from '@/components/proposals/proposal-section-editor';

export const dynamic = 'force-dynamic';

export default async function NewSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: proposal, error } = await getProposal(id);
  if (error || !proposal) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Add Section" description={`Adding section to "${proposal.title}"`} />
      <ProposalSectionEditor proposalId={id} />
    </div>
  );
}
