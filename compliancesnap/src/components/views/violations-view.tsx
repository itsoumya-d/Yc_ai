import { useState, useMemo, useCallback } from 'react';
import { cn, getSeverityColor, getSeverityLabel, getSeverityBgColor, getStatusColor } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { saveViolation } from '@/lib/storage';
import type { SeverityLevel, ActionStatus } from '@/types/database';
import {
  AlertTriangle, ArrowLeft, Search, CheckCircle2, Clock,
  Filter, ChevronDown, ChevronUp, MapPin, Calendar, FileText,
} from 'lucide-react';

type FilterSeverity = 'all' | SeverityLevel;
type FilterStatus = 'all' | 'open' | 'resolved';

const STATUS_CYCLES: ActionStatus[] = ['pending', 'in-progress', 'completed'];
const nextStatus = (current: ActionStatus): ActionStatus => {
  const idx = STATUS_CYCLES.indexOf(current);
  // 'overdue' falls back to 'in-progress', otherwise cycle forward
  return idx === -1 ? 'in-progress' : STATUS_CYCLES[(idx + 1) % STATUS_CYCLES.length];
};

export function ViolationsView() {
  const { violations, updateViolation, setSubView } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const sorted = useMemo(() =>
    violations
      .slice()
      .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()),
    [violations],
  );

  const filtered = useMemo(() => {
    return sorted.filter((v) => {
      if (filterSeverity !== 'all' && v.severity !== filterSeverity) return false;
      if (filterStatus === 'open' && v.status === 'completed') return false;
      if (filterStatus === 'resolved' && v.status !== 'completed') return false;
      if (search) {
        const q = search.toLowerCase();
        return v.title.toLowerCase().includes(q) ||
          v.regulation.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sorted, filterSeverity, filterStatus, search]);

  const openCount = useMemo(() => violations.filter((v) => v.status !== 'completed').length, [violations]);
  const criticalCount = useMemo(() => violations.filter((v) => v.severity === 'critical' && v.status !== 'completed').length, [violations]);

  const handleCycleStatus = useCallback((id: string, current: ActionStatus) => {
    const next = nextStatus(current);
    updateViolation(id, next);
    // Persist to localStorage
    const v = violations.find((x) => x.id === id);
    if (v) saveViolation({ ...v, status: next });
  }, [violations, updateViolation]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const activeFilters = (filterSeverity !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-bg-surface px-4 pb-3 pt-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubView(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-card"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          <div className="flex-1">
            <h1 className="snap-heading-bold text-xl text-text-primary">Violations</h1>
          </div>
          {criticalCount > 0 && (
            <span className="rounded-md bg-severity-critical/15 px-2 py-0.5 text-[11px] font-bold text-severity-critical">
              {criticalCount} CRITICAL
            </span>
          )}
        </div>

        {/* Summary chips */}
        <div className="mt-3 flex gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-bg-card px-3 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-severity-major" />
            <span className="text-xs font-medium text-text-primary">{openCount} open</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-bg-card px-3 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-compliant" />
            <span className="text-xs font-medium text-text-primary">
              {violations.length - openCount} resolved
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-bg-card px-3 py-1.5">
            <FileText className="h-3.5 w-3.5 text-text-secondary" />
            <span className="text-xs font-medium text-text-primary">{violations.length} total</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search violations..."
              className="h-10 w-full rounded-xl bg-bg-card pl-10 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-safety-yellow/50"
            />
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={cn(
              'flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-colors',
              showFilters || activeFilters > 0
                ? 'bg-safety-yellow text-text-inverse'
                : 'bg-bg-card text-text-secondary',
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
            {activeFilters > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-text-inverse/20 text-[10px]">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-2 rounded-xl bg-bg-card p-3 space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-text-secondary uppercase tracking-wide">Severity</p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'critical', 'major', 'minor', 'observation'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                      filterSeverity === s
                        ? s === 'all' ? 'bg-safety-yellow text-text-inverse' : getSeverityColor(s as SeverityLevel)
                        : 'bg-bg-surface text-text-secondary',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-text-secondary uppercase tracking-wide">Status</p>
              <div className="flex gap-1.5">
                {(['all', 'open', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                      filterStatus === s
                        ? 'bg-safety-yellow text-text-inverse'
                        : 'bg-bg-surface text-text-secondary',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pb-6 pt-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-text-secondary" />
            <h2 className="text-sm font-medium text-text-primary">
              {violations.length === 0 ? 'No violations logged' : 'No violations match filters'}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {violations.length === 0
                ? 'Scan a workplace photo to detect safety violations.'
                : 'Clear filters to see all violations.'}
            </p>
            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterSeverity('all'); setFilterStatus('all'); setSearch(''); }}
                className="mt-3 rounded-full bg-safety-yellow px-4 py-1.5 text-xs font-semibold text-text-inverse"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((v) => {
            const isExpanded = expandedId === v.id;
            return (
              <div key={v.id} className={cn('rounded-xl overflow-hidden border', getSeverityBgColor(v.severity))}>
                {/* Severity stripe */}
                <div className={cn('h-1', `bg-severity-${v.severity}`)} />
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase', getSeverityColor(v.severity))}>
                          {getSeverityLabel(v.severity)}
                        </span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', getStatusColor(v.status))}>
                          {v.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-text-primary leading-tight">{v.title}</p>
                      <p className="snap-code mt-0.5 text-[11px] text-info">{v.regulation}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {/* Cycle status button */}
                      <button
                        onClick={() => handleCycleStatus(v.id, v.status)}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-opacity active:opacity-70',
                          v.status === 'completed'
                            ? 'bg-compliant-bg text-compliant'
                            : v.status === 'in-progress'
                            ? 'bg-severity-observation-bg text-info border border-info/20'
                            : 'bg-safety-yellow/10 text-safety-yellow border border-safety-yellow/30',
                        )}
                      >
                        {v.status === 'completed' ? (
                          <><CheckCircle2 className="h-3 w-3" /> Resolved</>
                        ) : v.status === 'in-progress' ? (
                          <><Clock className="h-3 w-3" /> In Progress</>
                        ) : (
                          <>&#8250; Mark Progress</>
                        )}
                      </button>
                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                        className="text-text-secondary"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 space-y-1.5 border-t border-border-default pt-3">
                      <div className="flex items-start gap-1.5 text-xs text-text-secondary">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-secondary" />
                        <span>{v.location}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-text-secondary">
                        <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-secondary" />
                        <span>Detected: {formatDate(v.detected_at)}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {v.status !== 'completed' && (
                          <button
                            onClick={() => {
                              updateViolation(v.id, 'completed');
                              const viol = violations.find((x) => x.id === v.id);
                              if (viol) saveViolation({ ...viol, status: 'completed' });
                            }}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-compliant/10 py-2 text-xs font-medium text-compliant border border-compliant/20"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                          </button>
                        )}
                        {v.status === 'completed' && (
                          <button
                            onClick={() => {
                              updateViolation(v.id, 'pending');
                              const viol = violations.find((x) => x.id === v.id);
                              if (viol) saveViolation({ ...viol, status: 'pending' });
                            }}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bg-surface py-2 text-xs font-medium text-text-secondary border border-border-default"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
