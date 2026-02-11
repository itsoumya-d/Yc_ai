'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatRelativeTime, getStatusLabel, getPricingLabel } from '@/lib/utils';
import { FileText, Building2, DollarSign, Clock } from 'lucide-react';
import type { ProposalWithClient, ProposalStatus, PricingModel } from '@/types/database';

interface ProposalCardProps {
  proposal: ProposalWithClient;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Link href={`/proposals/${proposal.id}`}>
      <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-[var(--foreground)] truncate">{proposal.title}</h3>
              {proposal.clients && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-[var(--muted-foreground)]" />
                  <span className="text-sm text-[var(--muted-foreground)] truncate">
                    {proposal.clients.name}{proposal.clients.company ? ` · ${proposal.clients.company}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={proposal.status as ProposalStatus}>{getStatusLabel(proposal.status)}</Badge>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-mono-pricing">{formatCurrency(proposal.value, proposal.currency)}</span>
          </div>
          <Badge variant={proposal.pricing_model as PricingModel} className="text-xs">{getPricingLabel(proposal.pricing_model)}</Badge>
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatRelativeTime(proposal.updated_at)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
