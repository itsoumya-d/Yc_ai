import { cn, getScoreColor, getSeverityColor, getSeverityLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { formatRelativeDate } from '@/lib/storage';
import { FileText, Download, Share2, Search, Filter, CheckCircle2, Clock, AlertTriangle, Plus, BarChart3 } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { SeverityLevel } from '@/types/database';

const STATIC_REPORTS = [
  { id: 's1', title: 'Plant A — General Safety Walk', date: '2025-02-18T15:00:00Z', score: 85, violations: 3, status: 'final' as const, pages: 12, facility: 'Plant A' },
  { id: 's2', title: 'Plant B — Machine Guarding Audit', date: '2025-02-17T09:30:00Z', score: 72, violations: 7, status: 'draft' as const, pages: 18, facility: 'Plant B' },
  { id: 's3', title: 'Warehouse C — Fire Safety', date: '2025-02-15T14:00:00Z', score: 92, violations: 1, status: 'final' as const, pages: 8, facility: 'Warehouse C' },
  { id: 's4', title: 'Plant A — PPE Compliance', date: '2025-02-10T11:00:00Z', score: 88, violations: 2, status: 'final' as const, pages: 10, facility: 'Plant A' },
  { id: 's5', title: 'Plant B — Chemical Storage', date: '2025-02-03T10:00:00Z', score: 65, violations: 9, status: 'final' as const, pages: 22, facility: 'Plant B' },
];

const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'major', 'minor', 'observation'];

export function ReportsView() {
  const { inspections, violations, facilities } = useAppStore();
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'final' | 'draft'>('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Build reports from inspections + static
  const dynamicReports = useMemo(() =>
    inspections
      .filter((i) => i.status === 'completed' || i.status === 'in-progress')
      .map((i) => ({
        id: i.id,
        title: `${i.facility} — ${i.type}`,
        date: i.date,
        score: i.score,
        violations: i.violations_found,
        status: (i.status === 'completed' ? 'final' : 'draft') as 'final' | 'draft',
        pages: Math.max(6, i.violations_found * 2 + 4),
        facility: i.facility,
      })),
    [inspections],
  );

  const allReports = useMemo(() => {
    const combined = [...dynamicReports, ...STATIC_REPORTS];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [dynamicReports]);

  const filtered = useMemo(() => {
    let result = allReports;
    if (filterStatus !== 'all') result = result.filter((r) => r.status === filterStatus);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q) || r.facility.toLowerCase().includes(q));
    }
    return result;
  }, [allReports, filterStatus, query]);

  // Violations grouped by facility for detail view
  const selected = selectedReport ? filtered.find((r) => r.id === selectedReport) : null;
  const facilityViolations = useMemo(() => {
    if (!selected) return [];
    return violations
      .filter((v) => v.location.toLowerCase().includes(selected.facility.toLowerCase()))
      .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  }, [selected, violations]);

  if (selected) {
    return (
      <div className="flex h-full flex-col">
        <div className="bg-bg-surface px-4 pb-4 pt-12">
          <button onClick={() => setSelectedReport(null)} className="mb-2 text-xs text-info">← Back to Reports</button>
          <h1 className="snap-heading-bold text-xl text-text-primary">{selected.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span>{formatRelativeDate(selected.date)}</span>
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
              selected.status === 'final' ? 'bg-compliant-bg text-compliant' : 'bg-border-default/30 text-text-secondary',
            )}>
              {selected.status === 'final' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {selected.status === 'final' ? 'Final' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-4 space-y-4">
          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-bg-card p-3 text-center">
              <div className={cn('score-display text-2xl', getScoreColor(selected.score))}>{selected.score}</div>
              <div className="mt-0.5 text-[10px] text-text-secondary">Score</div>
            </div>
            <div className="rounded-xl bg-bg-card p-3 text-center">
              <div className="score-display text-2xl text-severity-major">{selected.violations}</div>
              <div className="mt-0.5 text-[10px] text-text-secondary">Violations</div>
            </div>
            <div className="rounded-xl bg-bg-card p-3 text-center">
              <div className="score-display text-2xl text-info">{selected.pages}</div>
              <div className="mt-0.5 text-[10px] text-text-secondary">Pages</div>
            </div>
          </div>

          {/* Violations in this report */}
          {facilityViolations.length > 0 ? (
            <div>
              <h2 className="mb-2 snap-heading text-sm text-text-primary">Violations Found</h2>
              <div className="space-y-2">
                {facilityViolations.map((v) => (
                  <div key={v.id} className="rounded-xl bg-bg-card overflow-hidden">
                    <div className={cn('h-1', `bg-severity-${v.severity}`)} />
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs font-medium text-text-primary">{v.title}</div>
                          <div className="mt-0.5 snap-code text-[10px] text-info">{v.regulation}</div>
                        </div>
                        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase', getSeverityColor(v.severity))}>
                          {getSeverityLabel(v.severity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-bg-card p-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">No violation details available for this report.</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card py-3 text-xs text-text-secondary">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card py-3 text-xs text-text-secondary">
              <Share2 className="h-4 w-4" /> Share Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="bg-bg-surface px-4 pb-4 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="snap-heading-bold text-2xl text-text-primary">Reports</h1>
          <button className="flex h-9 items-center gap-1.5 rounded-full bg-safety-yellow px-3 text-xs font-semibold text-text-inverse">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports..."
              className="h-10 w-full rounded-xl bg-bg-card pl-10 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-safety-yellow/50"
            />
          </div>
          <button
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'final' : filterStatus === 'final' ? 'draft' : 'all')}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              filterStatus !== 'all' ? 'bg-safety-yellow' : 'bg-bg-card',
            )}
          >
            <Filter className={cn('h-5 w-5', filterStatus !== 'all' ? 'text-text-inverse' : 'text-text-secondary')} />
          </button>
        </div>
        {filterStatus !== 'all' && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">Showing:</span>
            <span className="rounded-full bg-safety-yellow/20 px-2 py-0.5 text-xs font-medium text-safety-yellow capitalize">{filterStatus}</span>
            <button onClick={() => setFilterStatus('all')} className="text-xs text-text-secondary underline">Clear</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-text-secondary" />
            <h2 className="text-sm font-medium text-text-primary">No reports found</h2>
            <p className="mt-1 text-xs text-text-secondary">Try adjusting your search or filter.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className="w-full rounded-xl bg-bg-card p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-surface">
                  <FileText className="h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate text-sm font-medium text-text-primary">{r.title}</div>
                    <span className={cn(
                      'shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      r.status === 'final' ? 'bg-compliant-bg text-compliant' : 'bg-border-default/30 text-text-secondary',
                    )}>
                      {r.status === 'final' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {r.status === 'final' ? 'Final' : 'Draft'}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                    <span>{formatRelativeDate(r.date)}</span>
                    <span className={cn('font-medium', getScoreColor(r.score))}>Score {r.score}</span>
                    {r.violations > 0 && (
                      <span className="flex items-center gap-1 text-severity-major">
                        <AlertTriangle className="h-3 w-3" /> {r.violations}
                      </span>
                    )}
                    <span>{r.pages}pp</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-border-default pt-3">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bg-surface py-2 text-xs text-text-secondary"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bg-surface py-2 text-xs text-text-secondary"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
