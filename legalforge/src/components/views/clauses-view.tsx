import { useState } from 'react';
import { cn, getClauseCategoryLabel, getRiskColor, getRiskLabel } from '@/lib/utils';
import { Search, Plus, Upload, Copy, Edit3, ArrowRight } from 'lucide-react';
import type { ClauseCategory, RiskLevel } from '@/types/database';

interface ClauseItem {
  id: string;
  title: string;
  body: string;
  category: ClauseCategory;
  risk_level: RiskLevel;
  approved: boolean;
  tags: string[];
  usage_count: number;
}

const categories: Array<{ value: ClauseCategory; count: number }> = [
  { value: 'indemnification', count: 28 },
  { value: 'limitation_of_liability', count: 24 },
  { value: 'confidentiality', count: 31 },
  { value: 'ip_assignment', count: 18 },
  { value: 'termination', count: 22 },
  { value: 'governing_law', count: 15 },
  { value: 'force_majeure', count: 12 },
  { value: 'data_protection', count: 19 },
  { value: 'warranties', count: 16 },
  { value: 'non_compete', count: 14 },
  { value: 'dispute_resolution', count: 13 },
  { value: 'insurance', count: 9 },
  { value: 'audit_rights', count: 8 },
  { value: 'assignment', count: 10 },
  { value: 'notices', count: 7 },
];

const demoClauses: ClauseItem[] = [
  { id: 'c1', title: 'Indemnification - Standard', body: 'Each party shall indemnify and hold harmless the other party from and against any third-party claims arising from its breach of this Agreement.', category: 'indemnification', risk_level: 'low', approved: true, tags: ['standard', 'mutual'], usage_count: 89 },
  { id: 'c2', title: 'Indemnification - Capped', body: 'Party A shall indemnify Party B, provided that aggregate liability under this Section shall not exceed the total fees paid in the twelve months preceding the claim.', category: 'indemnification', risk_level: 'medium', approved: true, tags: ['capped', 'customer-friendly'], usage_count: 45 },
  { id: 'c3', title: 'Indemnification - Broad', body: 'Party A shall indemnify, defend, and hold harmless Party B from any and all claims, damages, losses, liabilities, costs, and expenses arising from or related to this Agreement.', category: 'indemnification', risk_level: 'high', approved: false, tags: ['broad', 'vendor-friendly'], usage_count: 12 },
  { id: 'c4', title: 'Limitation of Liability - Standard', body: 'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, REGARDLESS OF THE THEORY OF LIABILITY.', category: 'limitation_of_liability', risk_level: 'low', approved: true, tags: ['standard', 'mutual'], usage_count: 102 },
  { id: 'c5', title: 'Confidentiality - Mutual', body: 'Each party agrees to maintain the confidentiality of all Confidential Information received from the other party for a period of three (3) years following disclosure.', category: 'confidentiality', risk_level: 'low', approved: true, tags: ['standard', 'mutual', '3-year'], usage_count: 156 },
  { id: 'c6', title: 'Termination for Convenience', body: 'Either party may terminate this Agreement for any reason upon thirty (30) days prior written notice to the other party.', category: 'termination', risk_level: 'low', approved: true, tags: ['standard', '30-day'], usage_count: 78 },
];

export function ClausesView() {
  const [activeCategory, setActiveCategory] = useState<ClauseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = demoClauses.filter((c) => {
    const matchesCat = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalCount = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Clause Library</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{totalCount} approved clauses</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-raised">
            <Upload className="h-4 w-4" /> Import
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-on-color hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> Add Clause
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <div className="w-56 shrink-0 overflow-auto border-r border-border-default p-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-colors', activeCategory === 'all' ? 'bg-primary-muted text-primary-light' : 'text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary')}
          >
            <span>All Clauses</span>
            <span>{totalCount}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn('flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-colors', activeCategory === cat.value ? 'bg-primary-muted text-primary-light gold-accent-border' : 'text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary')}
            >
              <span className="truncate">{getClauseCategoryLabel(cat.value)}</span>
              <span>{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Clause List */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search clauses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none" />
          </div>

          {filtered.map((c) => (
            <div key={c.id} className="rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-accent hover:shadow-2">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">{c.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskColor(c.risk_level))}>
                    {getRiskLabel(c.risk_level)}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', c.approved ? 'bg-safe-green-muted text-safe-green' : 'bg-caution-amber-muted text-caution-amber')}>
                    {c.approved ? 'Approved' : 'Under Review'}
                  </span>
                </div>
              </div>
              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-text-secondary contract-body" style={{ fontSize: 12 }}>&ldquo;{c.body}&rdquo;</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {c.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Used {c.usage_count} times</span>
                <div className="flex items-center gap-1">
                  <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-accent"><ArrowRight className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Copy className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
