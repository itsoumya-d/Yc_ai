'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import type { Claim } from '@/types/database';

type ClaimStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied' | 'appealed';

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-bg-surface-raised text-text-tertiary', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-primary-muted text-primary-light', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-warning-muted text-warning', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-verified-green-muted text-verified-green', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-fraud-red-muted text-fraud-red', icon: XCircle },
  appealed: { label: 'Appealed', color: 'bg-accent-muted text-accent', icon: AlertCircle },
};

interface ClaimsPageClientProps {
  claims: Claim[];
  error?: string;
}

export function ClaimsPageClient({ claims, error }: ClaimsPageClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');

  const filtered = claims.filter((c) => {
    const matchesSearch =
      c.claim_number.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.claimant.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = claims.reduce((sum, c) => sum + c.estimated_amount, 0);
  const approvedValue = claims.filter((c) => c.approved_amount).reduce((sum, c) => sum + (c.approved_amount ?? 0), 0);

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Claims" subtitle="Error loading claims">
          <Link
            href="/claims/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            New Claim
          </Link>
        </PageHeader>
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-fraud-red/20 bg-fraud-red-muted p-6 text-center">
            <p className="text-sm text-fraud-red">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Claims" subtitle={`${claims.length} total claims`}>
        <Link
          href="/claims/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New Claim
        </Link>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(['submitted', 'under_review', 'approved', 'denied'] as ClaimStatus[]).map((status) => {
            const count = claims.filter((c) => c.status === status).length;
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
                className={`rounded-xl border border-border-default bg-bg-surface p-4 text-left transition-all hover:border-border-emphasis ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wide">{cfg.label}</span>
                  <Icon className="h-4 w-4 text-text-tertiary" />
                </div>
                <div className="text-2xl font-semibold text-text-primary">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Value summary */}
        <div className="flex items-center gap-4 rounded-xl border border-border-default bg-bg-surface p-4">
          <DollarSign className="h-5 w-5 text-text-tertiary shrink-0" />
          <div className="flex-1 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] text-text-tertiary">Total Claimed</p>
              <p className="financial-figure font-semibold text-text-primary">${totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Total Approved</p>
              <p className="financial-figure font-semibold text-verified-green">${approvedValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Approval Rate</p>
              <p className="financial-figure font-semibold text-text-primary">
                {claims.length > 0
                  ? Math.round((claims.filter((c) => c.status === 'approved').length / claims.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
            className="h-9 rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
              <option key={v} value={v}>{cfg.label}</option>
            ))}
          </select>
        </div>

        {/* Claims List */}
        <div className="rounded-xl border border-border-default bg-bg-surface divide-y divide-border-muted">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-text-tertiary text-sm">No claims found</p>
            </div>
          ) : (
            filtered.map((claim) => {
              const cfg = STATUS_CONFIG[claim.status];
              const Icon = cfg.icon;
              return (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-bg-surface-raised"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-tertiary">{claim.claim_number}</span>
                      <span className="rounded-md bg-bg-surface-hover px-1.5 py-0.5 text-[10px] text-text-secondary capitalize">{claim.claim_type}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-text-primary truncate">{claim.description}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{claim.claimant} · Incident: {claim.incident_date}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="financial-figure text-sm font-medium text-text-primary">
                      ${claim.estimated_amount.toLocaleString()}
                    </div>
                    {claim.approved_amount && (
                      <div className="financial-figure text-xs text-verified-green">
                        Approved: ${claim.approved_amount.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-text-tertiary" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
