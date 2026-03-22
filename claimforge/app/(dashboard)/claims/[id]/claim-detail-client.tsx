'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import type { Claim } from '@/types/database';
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  User,
  MessageSquare,
  Scale,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-bg-surface-raised text-text-tertiary', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-primary-muted text-primary-light', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-warning-muted text-warning', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-verified-green-muted text-verified-green', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-fraud-red-muted text-fraud-red', icon: XCircle },
  appealed: { label: 'Appealed', color: 'bg-accent-muted text-accent', icon: AlertCircle },
};

const tabs = ['Overview', 'Documents', 'Status History', 'Carrier'];

interface ClaimDetailClientProps {
  claim: Claim | null;
  error?: string;
}

export function ClaimDetailClient({ claim, error }: ClaimDetailClientProps) {
  const [activeTab, setActiveTab] = useState('Overview');

  if (error || !claim) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Claim Not Found" subtitle="Unable to load claim details">
          <Link
            href="/claims"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </PageHeader>
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-fraud-red/20 bg-fraud-red-muted p-6 text-center">
            <p className="text-sm text-fraud-red">{error || 'Claim not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const cfg = (STATUS_CONFIG[claim.status] ?? STATUS_CONFIG['submitted'])!;
  const Icon = cfg.icon;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={claim.claim_number}
        subtitle={`${claim.claim_type.charAt(0).toUpperCase() + claim.claim_type.slice(1)} Claim · ${claim.claimant}`}
      >
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.color}`}>
          <Icon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
        <Link
          href={`/claims/${claim.id}/export`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light/90"
        >
          <Scale className="h-4 w-4" />
          Court Export
        </Link>
        <Link
          href="/claims"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-default px-6 py-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              activeTab === tab
                ? 'bg-bg-surface-hover text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'Overview' && (
          <div className="space-y-5 max-w-3xl">
            {/* Amount cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Claimed Amount</div>
                <div className="financial-figure text-xl font-semibold text-text-primary">${claim.estimated_amount.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved Amount</div>
                <div className="financial-figure text-xl font-semibold text-verified-green">${(claim.approved_amount ?? 0).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1">Policy Number</div>
                <div className="font-mono text-sm font-semibold text-text-primary">{claim.policy_number || 'N/A'}</div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
              <h3 className="legal-heading text-sm text-text-primary">Incident Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-text-tertiary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-tertiary">Incident Date</div>
                    <div className="text-text-primary">{claim.incident_date}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-text-tertiary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-tertiary">Location</div>
                    <div className="text-text-primary">{claim.incident_location || 'Not specified'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-text-tertiary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-tertiary">Assigned Adjuster</div>
                    <div className="text-text-primary">{claim.adjuster || 'Pending assignment'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-text-tertiary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-tertiary">Submitted</div>
                    <div className="text-text-primary">{claim.created_at?.split('T')[0] ?? claim.created_at}</div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border-muted pt-4">
                <div className="text-[10px] text-text-tertiary mb-1">Description</div>
                <p className="text-sm text-text-secondary leading-relaxed">{claim.description}</p>
              </div>
              {claim.witnesses && (
                <div className="border-t border-border-muted pt-4">
                  <div className="text-[10px] text-text-tertiary mb-1">Witnesses</div>
                  <p className="text-sm text-text-secondary leading-relaxed">{claim.witnesses}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="max-w-3xl space-y-4">
            <button className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border-default px-5 py-3 text-sm text-text-secondary hover:border-border-emphasis transition-colors">
              <Upload className="h-4 w-4" />
              Upload additional documents
            </button>
            <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-text-tertiary mb-2" />
              <p className="text-sm text-text-tertiary">No documents uploaded yet</p>
              <p className="text-xs text-text-tertiary mt-1">Upload supporting files such as photos, receipts, or reports</p>
            </div>
          </div>
        )}

        {activeTab === 'Status History' && (
          <div className="max-w-2xl space-y-1">
            {/* Current status entry based on claim data */}
            <div className="flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${cfg.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 w-px bg-border-muted my-1" />
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-text-primary">{cfg.label}</span>
                  <span className="text-xs text-text-tertiary">{claim.updated_at?.split('T')[0] ?? claim.updated_at}</span>
                </div>
                <p className="text-xs text-text-secondary">Claim status updated to {cfg.label.toLowerCase()}.</p>
              </div>
            </div>

            {/* Creation entry */}
            {claim.status !== 'submitted' && (
              <div className="flex gap-4 pb-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-primary-light">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 w-px bg-border-muted my-1" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-text-primary">Submitted</span>
                    <span className="text-xs text-text-tertiary">{claim.created_at?.split('T')[0] ?? claim.created_at}</span>
                  </div>
                  <p className="text-xs text-text-secondary">Claim submitted successfully. Reference number {claim.claim_number} issued.</p>
                  <p className="text-[10px] text-text-tertiary mt-1">by {claim.claimant}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-surface-raised text-text-tertiary">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-text-primary">Created</span>
                  <span className="text-xs text-text-tertiary">{claim.created_at?.split('T')[0] ?? claim.created_at}</span>
                </div>
                <p className="text-xs text-text-secondary">Claim created.</p>
                <p className="text-[10px] text-text-tertiary mt-1">by {claim.claimant}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Carrier' && (
          <div className="max-w-3xl">
            <div className="rounded-xl border border-border-default bg-bg-surface p-6 text-center">
              <Scale className="mx-auto h-8 w-8 text-primary-light mb-2" />
              <h3 className="text-sm font-medium text-text-primary mb-1">Carrier Communication</h3>
              <p className="text-xs text-text-secondary mb-4">
                Submit this claim to an insurance carrier, track ACORD-formatted communications, and manage responses.
              </p>
              <Link
                href={`/claims/${claim.id}/carrier`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
              >
                <MessageSquare className="h-4 w-4" />
                Open Carrier Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
