import { getSharedProposal } from '@/lib/actions/sharing';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ViewTracker } from '@/components/proposals/view-tracker';
import { formatCurrency, formatDate, getStatusLabel, getPricingLabel } from '@/lib/utils';
import type { ProposalStatus, PricingModel, SectionType } from '@/types/database';

const sectionTypeLabels: Record<string, string> = {
  executive_summary: 'Executive Summary',
  scope: 'Scope of Work',
  timeline: 'Timeline',
  pricing: 'Pricing',
  team: 'Team',
  case_studies: 'Case Studies',
  terms: 'Terms & Conditions',
  custom: '',
};

export default async function SharedProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getSharedProposal(token);

  if (result.error || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Proposal Not Found</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{result.error || 'This link is invalid or has expired.'}</p>
        </Card>
      </div>
    );
  }

  const proposal = result.data;
  const profile = proposal.user_profile;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          {profile.business_name && (
            <p className="text-sm font-medium text-blue-600 mb-1">{profile.business_name}</p>
          )}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">{proposal.title}</h1>
            <Badge variant={proposal.status as ProposalStatus}>{getStatusLabel(proposal.status)}</Badge>
          </div>
          {profile.full_name && (
            <p className="text-sm text-[var(--muted-foreground)]">Prepared by {profile.full_name}</p>
          )}
        </div>

        {/* Client info */}
        {proposal.clients && (
          <Card className="p-4 mb-6 bg-blue-50/50">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Prepared For</p>
            <p className="text-lg font-semibold text-[var(--foreground)]">{proposal.clients.name}</p>
            {proposal.clients.company && (
              <p className="text-sm text-blue-600">{proposal.clients.company}</p>
            )}
          </Card>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Value</p>
            <p className="text-lg font-semibold font-mono text-[var(--foreground)]">{formatCurrency(proposal.value, proposal.currency)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Pricing</p>
            <p className="mt-1"><Badge variant={proposal.pricing_model as PricingModel}>{getPricingLabel(proposal.pricing_model)}</Badge></p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Date</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{formatDate(proposal.created_at)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Valid Until</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{proposal.valid_until ? formatDate(proposal.valid_until) : 'No deadline'}</p>
          </Card>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {proposal.proposal_sections.map((section) => (
            <Card key={section.id} id={`section-${section.id}`} className="p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3 border-b border-[var(--border)] pb-2">
                {section.section_type !== 'custom'
                  ? sectionTypeLabels[section.section_type] || section.title
                  : section.title}
              </h2>
              <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </Card>
          ))}
        </div>

        {/* Notes */}
        {proposal.notes && (
          <Card className="p-4 mt-6 border-l-4 border-l-amber-400 bg-amber-50/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">Notes</p>
            <p className="text-sm text-amber-900">{proposal.notes}</p>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            {proposal.title} — Generated on {formatDate(proposal.created_at)}
            {profile.business_name ? ` — ${profile.business_name}` : ''}
          </p>
        </div>

        {/* Engagement tracking */}
        <ViewTracker
          proposalId={proposal.id}
          sectionIds={proposal.proposal_sections.map((s) => s.id)}
        />
      </div>
    </div>
  );
}
