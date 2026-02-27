'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/stores/app-store';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { Search, Filter, Plus } from 'lucide-react';
import type { ProposalStatus, ProposalType } from '@/types';

const STATUS_OPTIONS: { value: ProposalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
];

const TYPE_OPTIONS: { value: ProposalType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'funding', label: 'Funding' },
  { value: 'rule_change', label: 'Rule Change' },
  { value: 'election', label: 'Election' },
  { value: 'general', label: 'General' },
];

export default function ProposalsPage() {
  const { proposals } = useAppStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProposalStatus | 'all'>('all');
  const [type, setType] = useState<ProposalType | 'all'>('all');

  const filtered = proposals.filter((p) => {
    if (status !== 'all' && p.status !== status) return false;
    if (type !== 'all' && p.type !== type) return false;
    if (query && !p.title.toLowerCase().includes(query.toLowerCase()) && !p.description.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Proposals</h1>
          <p className="text-sm text-text-secondary mt-1">{proposals.length} total proposals</p>
        </div>
        <Link
          href="/proposals/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Proposal
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search proposals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-9 w-full"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="input min-w-32"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="input min-w-36"
        >
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-text-secondary">No proposals found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
