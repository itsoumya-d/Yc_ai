'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate, getCaseStatusColor, getCaseStatusLabel } from '@/lib/utils';
import { createCase, type CaseFormData } from '@/lib/actions/cases';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  FileText,
  Users,
  Clock,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  Kanban,
  X,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react';
import type { Case, CaseStatus } from '@/types/database';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';

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

// ── Kanban column definitions ──────────────────────────────────────────────
type KanbanStage = 'investigation' | 'filed' | 'discovery' | 'trial' | 'settled';

interface KanbanColumn {
  id: KanbanStage;
  label: string;
  borderColor: string;
  badgeClass: string;
  statuses: CaseStatus[];
}

const kanbanColumns: KanbanColumn[] = [
  {
    id: 'investigation',
    label: 'Investigation',
    borderColor: 'border-t-slate-500',
    badgeClass: 'bg-slate-500/20 text-slate-300',
    statuses: ['intake', 'investigation'],
  },
  {
    id: 'filed',
    label: 'Filed',
    borderColor: 'border-t-blue-500',
    badgeClass: 'bg-blue-500/20 text-blue-300',
    statuses: ['filed'],
  },
  {
    id: 'discovery',
    label: 'Discovery',
    borderColor: 'border-t-violet-500',
    badgeClass: 'bg-violet-500/20 text-violet-300',
    statuses: ['analysis', 'review'],
  },
  {
    id: 'trial',
    label: 'Trial',
    borderColor: 'border-t-amber-500',
    badgeClass: 'bg-amber-500/20 text-amber-300',
    statuses: ['closed'],
  },
  {
    id: 'settled',
    label: 'Settled',
    borderColor: 'border-t-emerald-500',
    badgeClass: 'bg-emerald-500/20 text-emerald-300',
    statuses: ['settled'],
  },
];

function mapStatusToStage(status: CaseStatus): KanbanStage {
  for (const col of kanbanColumns) {
    if ((col.statuses as CaseStatus[]).includes(status)) return col.id;
  }
  return 'investigation';
}

// ── Animation variants ─────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export function CasesView({ cases }: CasesViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [showNewCase, setShowNewCase] = useState(false);
  const [creating, setCreating] = useState(false);
  const [caseDescription, setCaseDescription] = useState('');

  const { status: autoSaveStatus, statusText: autoSaveText } = useAutoSave({
    value: caseDescription,
    onSave: async () => { /* description is draft-only; persisted on form submit */ },
    delay: 1500,
    skipIf: (val) => val.trim() === '',
  });

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.defendant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase());
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
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-text-primary">Create New Case</h3>
              <AutoSaveIndicator status={autoSaveStatus} text={autoSaveText} />
            </div>
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
            <textarea name="description" value={caseDescription} onChange={(e) => setCaseDescription(e.target.value)} placeholder="Case description..." rows={2} className="col-span-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
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

        {/* View mode toggle — grid / list / board */}
        <div className="flex items-center gap-1 rounded-lg border border-border-default p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={cn('rounded-md p-1.5 transition-colors', viewMode === 'grid' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List view"
            className={cn('rounded-md p-1.5 transition-colors', viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            title="Board view"
            className={cn('rounded-md p-1.5 transition-colors', viewMode === 'board' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
          >
            <Kanban className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Cases */}
      <div className={cn('flex-1 overflow-auto p-6', viewMode === 'board' && 'overflow-x-auto')}>
        {cases.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No cases yet"
            description="Open your first fraud investigation case"
            action={{ label: 'Open a Case', onClick: () => setShowNewCase(true) }}
          />
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-bg-surface p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-text-tertiary opacity-50" />
            <h3 className="mt-4 text-sm font-medium text-text-primary">No cases found</h3>
            <p className="mt-1 text-xs text-text-tertiary">Try adjusting your filters.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                {...fadeUp}
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
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
              </motion.div>
            )}

            {viewMode === 'list' && (
              <motion.div key="list" {...fadeUp} className="rounded-xl border border-border-default bg-bg-surface">
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
              </motion.div>
            )}

            {viewMode === 'board' && (
              <motion.div key="board" {...fadeUp}>
                <KanbanBoard cases={filtered} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Kanban Board component ─────────────────────────────────────────────────

function KanbanBoard({ cases }: { cases: Case[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
      {kanbanColumns.map((col) => {
        const colCases = cases.filter((c) => mapStatusToStage(c.status) === col.id);
        return (
          <KanbanColumn key={col.id} column={col} cases={colCases} />
        );
      })}
    </div>
  );
}

function KanbanColumn({ column, cases }: { column: KanbanColumn; cases: Case[] }) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col gap-3">
      {/* Column header */}
      <div
        className={cn(
          'rounded-xl border border-border-default bg-bg-surface p-3 border-t-4',
          column.borderColor,
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary legal-heading">{column.label}</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', column.badgeClass)}>
            {cases.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1">
        <AnimatePresence>
          {cases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-muted p-4 text-center">
              <p className="text-[11px] text-text-tertiary">No cases</p>
            </div>
          ) : (
            cases.map((c, i) => (
              <KanbanCard key={c.id} c={c} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function KanbanCard({ c, index }: { c: Case; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/cases/${c.id}`}
        className="block rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:border-border-emphasis hover:bg-bg-surface-raised"
      >
        {/* Case number + status badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-text-tertiary">{c.case_number}</span>
          <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', getCaseStatusColor(c.status))}>
            {getCaseStatusLabel(c.status)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-text-primary line-clamp-2 mb-1">{c.title}</h4>

        {/* Client / defendant */}
        <div className="flex items-center gap-1 mb-3">
          <User className="h-3 w-3 text-text-tertiary flex-shrink-0" />
          <span className="text-[11px] text-text-secondary truncate">{c.defendant_name}</span>
        </div>

        {/* Estimated fraud */}
        <div className="rounded-md bg-fraud-red-muted px-2.5 py-1.5 mb-3">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-fraud-red flex-shrink-0" />
            <span className="financial-figure text-sm font-semibold text-fraud-red">
              {formatCurrency(c.estimated_fraud_amount)}
            </span>
          </div>
          <div className="text-[9px] text-text-tertiary mt-0.5">Estimated fraud</div>
        </div>

        {/* Attorney (jurisdiction as proxy) + filing date */}
        <div className="flex items-center justify-between text-[10px] text-text-tertiary">
          <span className="truncate max-w-[110px]">{c.jurisdiction}</span>
          <span className="flex items-center gap-0.5 flex-shrink-0">
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(c.updated_at)}
          </span>
        </div>

        {/* Footer stats */}
        <div className="mt-2.5 flex items-center gap-3 border-t border-border-muted pt-2.5 text-[10px] text-text-tertiary">
          <span className="flex items-center gap-0.5">
            <FileText className="h-2.5 w-2.5" />
            {c.document_count} docs
          </span>
          <span className="flex items-center gap-0.5">
            <Users className="h-2.5 w-2.5" />
            {c.entity_count} entities
          </span>
          <span className="flex items-center gap-0.5">
            <Search className="h-2.5 w-2.5" />
            {c.pattern_count} patterns
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
