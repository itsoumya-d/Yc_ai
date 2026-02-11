'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate, getCaseStatusColor, getCaseStatusLabel } from '@/lib/utils';
import { createCase, type CaseFormData } from '@/lib/actions/cases';
import {
  Search,
  FileText,
  Users,
  Clock,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import type { Case, CaseStatus } from '@/types/database';

interface CasesViewProps {
  cases: Case[];
}

const statusFilters: Array<{ value: CaseStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Cases' },
  { value: 'intake', label: 'Intake' },
  { value: 'investigation', label: 'Investigation' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'review', label: 'Review' },
  { value: 'filed', label: 'Filed' },
  { value: 'settled', label: 'Settled' },
  { value: 'closed', label: 'Closed' },
];

export function CasesView({ cases }: CasesViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [showNewCase, setShowNewCase] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = cases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.defendant_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.case_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreateCase(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    const data: CaseFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || '',
      defendant_name: formData.get('defendant_name') as string,
      defendant_type: (formData.get('defendant_type') as CaseFormData['defendant_type']) || 'corporation',
      estimated_fraud_amount: parseFloat(formData.get('estimated_fraud_amount') as string) || 0,
      jurisdiction: formData.get('jurisdiction') as string || '',
    };

    const result = await createCase(data);
    setCreating(false);

    if (result.data) {
      setShowNewCase(false);
      router.refresh();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Cases" subtitle={`${filtered.length} cases`}>
        <button
          onClick={() => setShowNewCase(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New Case
        </button>
      </PageHeader>

      {/* New Case Modal */}
      {showNewCase && (
        <div className="border-b border-border-default bg-bg-surface-raised px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-primary">Create New Case</h3>
            <button onClick={() => setShowNewCase(false)} className="text-text-tertiary hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateCase} className="grid grid-cols-2 gap-3">
            <input name="title" required placeholder="Case title" className="col-span-2 h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
            <input name="defendant_name" required placeholder="Defendant name" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
            <select name="defendant_type" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
              <option value="corporation">Corporation</option>
              <option value="individual">Individual</option>
              <option value="government_contractor">Gov. Contractor</option>
            </select>
            <input name="estimated_fraud_amount" type="number" step="0.01" placeholder="Est. fraud amount" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
            <input name="jurisdiction" placeholder="Jurisdiction (e.g., S.D.N.Y.)" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
            <textarea name="description" placeholder="Case description..." rows={2} className="col-span-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={creating} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-on-color hover:bg-primary-hover disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Case'}
              </button>
              <button type="button" onClick={() => setShowNewCase(false)} className="rounded-lg border border-border-default px-4 py-2 text-xs text-text-secondary hover:bg-bg-surface-hover">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-border-default px-6 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search cases by title, defendant, or case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border-default p-0.5">
          {statusFilters.slice(0, 5).map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs transition-colors',
                statusFilter === sf.value
                  ? 'bg-bg-surface-hover text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              {sf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border-default p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('rounded-md p-1.5 transition-colors', viewMode === 'grid' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('rounded-md p-1.5 transition-colors', viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Cases */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-bg-surface p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-text-tertiary opacity-50" />
            <h3 className="mt-4 text-sm font-medium text-text-primary">No cases found</h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {cases.length === 0 ? 'Create your first case to get started.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="group cursor-pointer rounded-xl border border-border-default bg-bg-surface p-5 transition-all hover:border-border-emphasis hover:shadow-2"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-text-tertiary">{c.case_number}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getCaseStatusColor(c.status))}>
                        {getCaseStatusLabel(c.status)}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-medium text-text-primary line-clamp-1">{c.title}</h3>
                    <p className="mt-0.5 text-xs text-text-tertiary">{c.defendant_name}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className="mb-3 rounded-lg bg-fraud-red-muted p-3">
                  <div className="text-[10px] text-text-tertiary">Estimated Fraud</div>
                  <div className="financial-figure text-lg font-semibold text-fraud-red">
                    {formatCurrency(c.estimated_fraud_amount)}
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <FileText className="mx-auto h-3 w-3 text-text-tertiary" />
                    <div className="mt-0.5 text-xs font-medium text-text-primary">{c.document_count}</div>
                    <div className="text-[10px] text-text-tertiary">Docs</div>
                  </div>
                  <div>
                    <Users className="mx-auto h-3 w-3 text-text-tertiary" />
                    <div className="mt-0.5 text-xs font-medium text-text-primary">{c.entity_count}</div>
                    <div className="text-[10px] text-text-tertiary">Entities</div>
                  </div>
                  <div>
                    <Search className="mx-auto h-3 w-3 text-text-tertiary" />
                    <div className="mt-0.5 text-xs font-medium text-text-primary">{c.pattern_count}</div>
                    <div className="text-[10px] text-text-tertiary">Patterns</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                  <span>{c.jurisdiction}</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDate(c.updated_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border-default bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs text-text-tertiary">
                  <th className="px-4 py-3 font-medium">Case</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Est. Fraud</th>
                  <th className="px-4 py-3 font-medium">Docs</th>
                  <th className="px-4 py-3 font-medium">Jurisdiction</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/cases/${c.id}`)}
                    className="cursor-pointer transition-colors hover:bg-bg-surface-raised"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-[10px] text-text-tertiary">{c.case_number}</div>
                      <div className="font-medium text-text-primary">{c.title}</div>
                      <div className="text-xs text-text-tertiary">{c.defendant_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getCaseStatusColor(c.status))}>
                        {getCaseStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 financial-figure text-fraud-red font-medium">
                      {formatCurrency(c.estimated_fraud_amount)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.document_count}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.jurisdiction}</td>
                    <td className="px-4 py-3 text-text-tertiary">{formatDate(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
