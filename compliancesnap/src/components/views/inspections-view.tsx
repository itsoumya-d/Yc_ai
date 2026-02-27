import { useState, useMemo, useCallback } from 'react';
import { cn, getScoreColor } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { generateId } from '@/lib/storage';
import { upsertInspection } from '@/lib/data-service';
import type { InspectionStatus, Inspection } from '@/types/database';
import { ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle, Pencil } from 'lucide-react';

const statusConfig: Record<InspectionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: 'Draft', color: 'bg-border-default/30 text-text-secondary', icon: Pencil },
  'in-progress': { label: 'In Progress', color: 'bg-severity-observation-bg text-info', icon: Clock },
  completed: { label: 'Completed', color: 'bg-compliant-bg text-compliant', icon: CheckCircle2 },
  syncing: { label: 'Syncing', color: 'bg-severity-minor-bg text-severity-minor', icon: Clock },
};

type FilterType = 'all' | 'in-progress' | 'completed';

export function InspectionsView() {
  const { inspections, addInspection, userName } = useAppStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return inspections;
    return inspections.filter((i) => i.status === filter);
  }, [inspections, filter]);

  const handleNewInspection = useCallback(async () => {
    const inspection: Inspection = {
      id: generateId(),
      facility: 'New Facility',
      type: 'General Safety Walk',
      status: 'draft',
      violations_found: 0,
      score: 0,
      date: new Date().toISOString(),
      inspector: userName || 'You',
    };
    addInspection(inspection);
    if (user) {
      await upsertInspection(user.id, inspection);
    }
  }, [addInspection, userName, user]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-bg-surface px-4 pb-4 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="snap-heading-bold text-2xl text-text-primary">Inspections</h1>
          <button onClick={handleNewInspection} className="flex h-10 w-10 items-center justify-center rounded-full bg-safety-yellow">
            <Plus className="h-5 w-5 text-text-inverse" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {(['all', 'in-progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                filter === f ? 'bg-safety-yellow text-text-inverse' : 'bg-bg-card text-text-secondary',
              )}
            >
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="mb-3 h-10 w-10 text-text-secondary" />
            <h2 className="text-sm font-medium text-text-primary">No inspections yet</h2>
            <p className="mt-1 text-xs text-text-secondary">Tap the + button to start a new inspection.</p>
          </div>
        ) : (
          filtered.map((insp) => {
            const config = statusConfig[insp.status];
            return (
              <div key={insp.id} className="rounded-xl bg-bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface">
                      <ClipboardList className="h-5 w-5 text-text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{insp.type}</div>
                      <div className="mt-0.5 text-xs text-text-secondary">{insp.facility}</div>
                    </div>
                  </div>
                  <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', config.color)}>
                    <config.icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>{insp.date}</span>
                    <span>{insp.inspector}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {insp.violations_found > 0 && (
                      <span className="flex items-center gap-1 text-xs text-severity-major">
                        <AlertTriangle className="h-3 w-3" /> {insp.violations_found}
                      </span>
                    )}
                    {insp.score > 0 && (
                      <span className={cn('score-display text-sm', getScoreColor(insp.score))}>{insp.score}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
