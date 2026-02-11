import { ProposalCard } from './proposal-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import type { ProposalWithClient } from '@/types/database';

interface ProposalListProps {
  proposals: ProposalWithClient[];
}

export function ProposalList({ proposals }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No proposals yet"
        description="Create your first proposal to start winning new business."
        action={{ label: 'New Proposal', href: '/proposals/new' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}
