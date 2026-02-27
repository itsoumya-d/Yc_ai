import { notFound } from 'next/navigation';
import { getProposal } from '@/lib/actions/proposals';
import { getProposalAnalytics } from '@/lib/actions/analytics';
import { ProposalDetail } from '@/components/proposals/proposal-detail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getProposal(id);
  return { title: data?.title ?? 'Proposal' };
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [proposalResult, analyticsResult] = await Promise.all([
    getProposal(id),
    getProposalAnalytics(id),
  ]);
  if (proposalResult.error || !proposalResult.data) notFound();

  return (
    <ProposalDetail
      proposal={proposalResult.data}
      analytics={analyticsResult.data ?? undefined}
    />
  );
}
