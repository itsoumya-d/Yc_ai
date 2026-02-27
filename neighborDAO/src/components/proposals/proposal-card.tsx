'use client';

import Link from 'next/link';
import { MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, getStatusColor, getProposalTypeColor } from '@/lib/utils';
import type { Proposal } from '@/types';

interface ProposalCardProps {
  proposal: Proposal;
}

function VoteBar({ for: f, against, abstain }: { for: number; against: number; abstain: number }) {
  const total = f + against + abstain || 1;
  const forPct = (f / total) * 100;
  const againstPct = (against / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface">
        <div className="bg-green-500 transition-all" style={{ width: `${forPct}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${againstPct}%` }} />
        <div className="flex-1 bg-border" />
      </div>
      <div className="flex gap-3 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{f} for</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{against} against</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-border" />{abstain} abstain</span>
      </div>
    </div>
  );
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const statusColors: Record<string, string> = {
    active: 'success',
    passed: 'info',
    failed: 'error',
    draft: 'outline',
    pending: 'warning',
  };

  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={statusColors[proposal.status] as any}>{proposal.status}</Badge>
            <Badge variant="outline">{proposal.type.replace('_', ' ')}</Badge>
            {proposal.budget && (
              <Badge variant="info">${proposal.budget.toLocaleString()}</Badge>
            )}
          </div>
          <h3 className="font-semibold text-text-primary line-clamp-2">{proposal.title}</h3>
          <p className="mt-1 text-sm text-text-secondary line-clamp-2">{proposal.description}</p>
        </div>
      </div>

      {proposal.status === 'active' && (
        <div className="mt-4">
          <VoteBar
            for={proposal.votes_for}
            against={proposal.votes_against}
            abstain={proposal.votes_abstain}
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(proposal.deadline)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {proposal.discussion_count} comments
          </span>
        </div>
        <span>by {proposal.author}</span>
      </div>
    </Link>
  );
}
