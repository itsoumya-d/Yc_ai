import { useState, useMemo, useCallback } from 'react';
import { cn, getSeverityColor, getSeverityLabel, getStatusColor, getScoreColor } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { saveViolation, generateId, formatRelativeDate } from '@/lib/storage';
import type { Violation, SeverityLevel, ActionStatus } from '@/types/database';
import { AlertTriangle, Plus, X, CheckCircle2, Clock, Filter, MapPin, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'major', 'minor', 'observation'];

type FilterSeverity = 'all' | SeverityLevel;
type FilterStatusType = 'all' | ActionStatus;

const REGULATIONS = [
  '29 CFR 1910.212', '29 CFR 1910.133', '29 CFR 1910.303', '29 CFR 1910.37',
  '29 CFR 1910.178', '29 CFR 1910.1200', '29 CFR 1910.23', '29 CFR 1910.151',
  '29 CFR 1926.100', '29 CFR 1910.305',
];

const LOCATIONS = [
  'Plant A — Machine Shop', 'Plant A — Electrical Room', 'Plant A — South Wing',
  'Plant B — Lab Area', 'Plant B — Chemical Storage', 'Warehouse C — Bay 4',
  'Warehouse C — Loading Dock', 'Warehouse C — Level 2',
];

interface AddViolationFormProps {
  onClose: () => void;
}

function AddViolationForm({ onClose }: AddViolationFormProps) {
  const { addViolation } = useAppStore();
  const [form, setForm] = useState({
    title: '',
    severity: 'major' as SeverityLevel,
    regulation: REGULATIONS[0],
    location: LOCATIONS[0],
  });

  const handleSubmit = useCallback(() => {
    if (!form.title.trim()) return;
    const violation: Violation = {
      id: generateId(),
      title: form.title.trim(),
      severity: form.severity,
      regulation: form.regulation,
      location: form.location,
      status: 'pending',
      detected_at: new Date().toISOString(),
    };
    addViolation(violation);
    saveViolation(violation);
    onClose();
  }, [form, addViolation, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-2xl bg-bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="snap-heading text-base text-text-primary">Log New Violation</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-card">
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Describe the violation..."
              className="h-10 w-full rounded-xl bg-bg-card px-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-safety-yellow/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Severity</label>
            <div className="grid grid-cols-4 gap-1.5">
              {SEVERITY_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, severity: s }))}
                  className={cn(
                    'rounded-lg py-2 text-xs font-semibold capitalize',
                    form.severity === s ? getSeverityColor(s) : 'bg-bg-card text-text-secondary',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Regulation</label>
            <select
              value={form.regulation}
              onChange={(e) => setForm((f) => ({ ...f, regulation: e.target.value }))}
              className="h-10 w-full rounded-xl bg-bg-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-yellow/50"
            >
              {REGULATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Location</label>
            <select
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="h-10 w-full rounded-xl bg-bg-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-yellow/50"
            >
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.title.trim()}
          className="w-full rounded-xl bg-safety-yellow py-3 text-sm font-semibold text-text-inverse disabled:opacity-50"
        >
          Log Violation
        </button>
        <div className="pb-safe" />
      </div>
    </div>
  );
}

interface ViolationDetailProps {
  violation: Violation;
  onClose: () => void;
  onStatusChange: (id: string, status: ActionStatus) => void;
}

function ViolationDetail({ violation, onClose, onStatusChange }: ViolationDetailProps) {
  const STATUSES: ActionStatus[] = ['pending', 'in-progress', 'completed', 'overdue'];
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-2xl bg-bg-surface p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h2 className="snap-heading text-base text-text-primary">{violation.title}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', getSeverityColor(violation.severity))}>
                {getSeverityLabel(violation.severity)}
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', getStatusColor(violation.status))}>
                {violation.status.replace('-', ' ')}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-card">
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-bg-card p-3">
            <BookOpen className="h-4 w-4 shrink-0 text-info" />
            <div>
              <div className="text-[10px] text-text-secondary">Regulation</div>
              <div className="snap-code text-xs text-info">{violation.regulation}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-bg-card p-3">
            <MapPin className="h-4 w-4 shrink-0 text-text-secondary" />
            <div>
              <div className="text-[10px] text-text-secondary">Location</div>
              <div className="text-xs text-text-primary">{violation.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-bg-card p-3">
            <Clock className="h-4 w-4 shrink-0 text-text-secondary" />
            <div>
              <div className="text-[10px] text-text-secondary">Detected</div>
              <div className="text-xs text-text-primary">{formatRelativeDate(violation.detected_at)}</div>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">Update Status</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { onStatusChange(violation.id, s); onClose(); }}
                className={cn(
                  'rounded-xl py-2.5 text-xs font-medium capitalize',
                  violation.status === s ? getStatusColor(s) + ' ring-2 ring-safety-yellow' : 'bg-bg-card text-text-secondary',
                )}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="pb-safe" />
      </div>
    </div>
  );
}

export function ViolationsView() {
  const { violations, setViolations } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...violations];
    if (filterSeverity !== 'all') result = result.filter((v) => v.severity === filterSeverity);
    if (filterStatus !== 'all') result = result.filter((v) => v.status === filterStatus);
    result.sort((a, b) => {
      const si = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
      if (si !== 0) return si;
      return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();
    });
    return result;
  }, [violations, filterSeverity, filterStatus]);

  const selectedViolation = selectedId ? violations.find((v) => v.id === selectedId) : null;

  const handleStatusChange = useCallback((id: string, status: ActionStatus) => {
    const updated = violations.map((v) => v.id === id ? { ...v, status } : v);
    setViolations(updated);
    updated.forEach((v) => saveViolation(v));
  }, [violations, setViolations]);

  const criticalCount = violations.filter((v) => v.severity === 'critical' && v.status !== 'completed').length;
  const openCount = violations.filter((v) => v.status !== 'completed').length;

  return (
    <div className="flex h-full flex-col">
      <div className="bg-bg-surface px-4 pb-4 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="snap-heading-bold text-2xl text-text-primary">Violations</h1>
            <p className="mt-0.5 text-xs text-text-secondary">{openCount} open · {criticalCount} critical</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-safety-yellow"
          >
            <Plus className="h-5 w-5 text-text-inverse" />
          </button>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs',
            showFilters ? 'bg-safety-yellow/20 text-safety-yellow' : 'bg-bg-card text-text-secondary',
          )}
        >
          <span className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filters {filterSeverity !== 'all' || filterStatus !== 'all' ? '(active)' : ''}
          </span>
          {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showFilters && (
          <div className="mt-2 space-y-2">
            <div>
              <p className="mb-1 text-[10px] text-text-secondary">Severity</p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', ...SEVERITY_ORDER] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium capitalize',
                      filterSeverity === s
                        ? s === 'all' ? 'bg-safety-yellow text-text-inverse' : getSeverityColor(s)
                        : 'bg-bg-card text-text-secondary',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] text-text-secondary">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'pending', 'in-progress', 'completed', 'overdue'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium capitalize',
                      filterStatus === s
                        ? s === 'all' ? 'bg-safety-yellow text-text-inverse' : getStatusColor(s)
                        : 'bg-bg-card text-text-secondary',
                    )}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-text-secondary" />
            <h2 className="text-sm font-medium text-text-primary">No violations</h2>
            <p className="mt-1 text-xs text-text-secondary">
              {violations.length === 0 ? 'Use the Scanner to detect hazards.' : 'No violations match the current filters.'}
            </p>
          </div>
        ) : (
          filtered.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className="w-full rounded-xl bg-bg-card overflow-hidden text-left"
            >
              <div className={cn('h-1', `bg-severity-${v.severity}`)} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">{v.title}</div>
                    <div className="mt-1 snap-code text-xs text-info">{v.regulation}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="h-3 w-3" />
                      {v.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', getSeverityColor(v.severity))}>
                      {getSeverityLabel(v.severity)}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', getStatusColor(v.status))}>
                      {v.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border-default pt-2">
                  <span className="text-[10px] text-text-secondary">{formatRelativeDate(v.detected_at)}</span>
                  {v.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-compliant" />
                  ) : (
                    <span className="text-[10px] text-info">Tap to update →</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {showAdd && <AddViolationForm onClose={() => setShowAdd(false)} />}
      {selectedViolation && (
        <ViolationDetail
          violation={selectedViolation}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
