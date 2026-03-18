'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProposalCard } from './proposal-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import type { ProposalWithClient, ProposalStatus } from '@/types/database';

interface ProposalListProps {
  proposals: ProposalWithClient[];
}

const STATUS_FILTERS: { label: string; value: ProposalStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

export function ProposalList({ proposals }: ProposalListProps) {
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | 'all'>('all');

  const filtered =
    activeFilter === 'all'
      ? proposals
      : proposals.filter((p) => p.status === activeFilter);

  const countFor = (status: ProposalStatus | 'all') =>
    status === 'all' ? proposals.length : proposals.filter((p) => p.status === status).length;

  return (
    <div className="space-y-4">
      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => {
          const isActive = activeFilter === value;
          const count = countFor(value);
          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="status-pill-indicator"
                  className="absolute inset-0 rounded-full bg-[var(--foreground)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
              {count > 0 && (
                <span
                  className={`relative z-10 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Proposals */}
      {filtered.length === 0 ? (
        proposals.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No proposals yet"
            description="Create your first proposal to start winning new business."
            action={{ label: 'New Proposal', href: '/proposals/new' }}
          />
        ) : (
          <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">
            No <span className="font-medium capitalize">{activeFilter}</span> proposals.
          </div>
        )
      ) : (
        <div className="space-y-3">
          {filtered.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}
