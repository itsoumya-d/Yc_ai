import Link from 'next/link';
import { getProposals } from '@/lib/actions/proposals';
import { PageHeader } from '@/components/layout/page-header';
import { ProposalList } from '@/components/proposals/proposal-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  const { data: proposals } = await getProposals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        description="Manage your proposals and track their status."
        action={<Link href="/proposals/new"><Button><Plus className="w-4 h-4 mr-1" />New Proposal</Button></Link>}
      />
      <ProposalList proposals={proposals ?? []} />
    </div>
  );
}
