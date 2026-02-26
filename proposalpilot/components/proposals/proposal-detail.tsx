'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { deleteProposal } from '@/lib/actions/proposals';
import { generateShareToken, revokeShareToken } from '@/lib/actions/sharing';
import { saveProposalAsTemplate } from '@/lib/actions/templates';
import { ProposalSectionList } from './proposal-section-list';
import { ProposalAnalytics } from './proposal-analytics';
import { formatCurrency, formatDate, getStatusLabel, getPricingLabel } from '@/lib/utils';
import { Edit, Trash2, Plus, Building2, Calendar, DollarSign, Send, Download, Share2, Copy, Check, LinkIcon, X, FileText, Loader2 } from 'lucide-react';
import type { ProposalWithDetails, ProposalStatus, PricingModel, ProposalAnalytics as AnalyticsData } from '@/types/database';

interface ProposalDetailProps {
  proposal: ProposalWithDetails;
  analytics?: AnalyticsData;
}

export function ProposalDetail({ proposal, analytics }: ProposalDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareToken, setShareToken] = useState(proposal.share_token);
  const [copied, setCopied] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this proposal? This action cannot be undone.')) return;
    setDeleting(true);
    const result = await deleteProposal(proposal.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Proposal deleted' });
    router.push('/proposals');
  }

  async function handleShare() {
    if (shareToken) {
      setShowSharePanel(true);
      return;
    }
    setSharing(true);
    const result = await generateShareToken(proposal.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setSharing(false);
      return;
    }
    setShareToken(result.data!);
    setShowSharePanel(true);
    setSharing(false);
    toast({ title: 'Share link created' });
  }

  async function handleRevoke() {
    const result = await revokeShareToken(proposal.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    setShareToken(null);
    setShowSharePanel(false);
    toast({ title: 'Share link revoked' });
  }

  function handleCopy() {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveAsTemplate() {
    const name = prompt('Template name:', proposal.title);
    if (!name) return;
    setSavingTemplate(true);
    const result = await saveProposalAsTemplate(proposal.id, name);
    setSavingTemplate(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Saved as template' });
    router.refresh();
  }

  const shareUrl = shareToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareToken}` : '';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{proposal.title}</h1>
            <Badge variant={proposal.status as ProposalStatus}>{getStatusLabel(proposal.status)}</Badge>
          </div>
          {proposal.clients && (
            <div className="flex items-center gap-1 mt-1 text-[var(--muted-foreground)]">
              <Building2 className="w-4 h-4" />
              <span>{proposal.clients.name}{proposal.clients.company ? ` · ${proposal.clients.company}` : ''}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing}>
            <Share2 className="w-4 h-4 mr-1" />{sharing ? 'Creating...' : shareToken ? 'Share Link' : 'Share'}
          </Button>
          <Link href={`/proposals/${proposal.id}/edit`}>
            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" />Edit</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleSaveAsTemplate} disabled={savingTemplate}>
            {savingTemplate ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
            {savingTemplate ? 'Saving...' : 'Save as Template'}
          </Button>
          <a href={`/api/proposals/${proposal.id}/pdf`} download>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />PDF</Button>
          </a>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-1" />{deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Share Panel */}
      {showSharePanel && shareToken && (
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium text-[var(--foreground)]">Share Link</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSharePanel(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-sm bg-white border border-[var(--border)] rounded-md px-3 py-1.5 text-[var(--foreground)]"
            />
            <Button size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[var(--muted-foreground)]">
              Anyone with this link can view the proposal. Status auto-updates to &quot;Viewed&quot; when opened.
            </p>
            <Button variant="ghost" size="sm" onClick={handleRevoke} className="text-xs text-red-600 hover:text-red-700">
              Revoke Link
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <DollarSign className="w-4 h-4" />
            <span>Value</span>
          </div>
          <p className="mt-1 text-lg font-semibold font-mono-pricing text-[var(--foreground)]">{formatCurrency(proposal.value, proposal.currency)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Send className="w-4 h-4" />
            <span>Pricing</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            <Badge variant={proposal.pricing_model as PricingModel}>{getPricingLabel(proposal.pricing_model)}</Badge>
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Calendar className="w-4 h-4" />
            <span>Created</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{formatDate(proposal.created_at)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Calendar className="w-4 h-4" />
            <span>Valid Until</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{proposal.valid_until ? formatDate(proposal.valid_until) : 'No deadline'}</p>
        </Card>
      </div>

      {proposal.notes && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Notes</h3>
          <p className="text-sm text-[var(--foreground)]">{proposal.notes}</p>
        </Card>
      )}

      {/* Analytics */}
      {analytics && (
        <ProposalAnalytics analytics={analytics} />
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Sections</h2>
          <Link href={`/proposals/${proposal.id}/sections/new`}>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Section</Button>
          </Link>
        </div>
        <ProposalSectionList sections={proposal.proposal_sections} proposalId={proposal.id} />
      </div>
    </div>
  );
}
