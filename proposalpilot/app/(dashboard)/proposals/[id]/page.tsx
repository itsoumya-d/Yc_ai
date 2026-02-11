import { notFound } from 'next/navigation';
import { getProposal } from '@/lib/actions/proposals';
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
  const { data: proposal, error } = await getProposal(id);
  if (error || !proposal) notFound();

  return <ProposalDetail proposal={proposal} />;
}
