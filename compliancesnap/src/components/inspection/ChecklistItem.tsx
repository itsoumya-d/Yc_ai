import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus } from 'lucide-react';

export type ChecklistStatus = 'pass' | 'fail' | 'na' | 'pending';

export interface ChecklistItemData {
  id: string;
  label: string;
  description?: string;
  regulation?: string;
  required: boolean;
  status: ChecklistStatus;
  notes?: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onChange?: (id: string, status: ChecklistStatus, notes?: string) => void;
  readonly?: boolean;
}

const statusConfig: Record<ChecklistStatus, { label: string; btnClass: string; activeClass: string; icon: typeof Check }> = {
  pass: { label: 'Pass', btnClass: 'text-compliant', activeClass: 'bg-compliant-bg border-compliant/40 text-compliant', icon: Check },
  fail: { label: 'Fail', btnClass: 'text-severity-critical', activeClass: 'bg-severity-critical-bg border-severity-critical/40 text-severity-critical', icon: X },
  na: { label: 'N/A', btnClass: 'text-text-secondary', activeClass: 'bg-border-default/30 border-border-default text-text-secondary', icon: Minus },
  pending: { label: '—', btnClass: 'text-text-secondary', activeClass: 'bg-border-default/20 border-border-default/40 text-text-secondary', icon: Minus },
};

export function ChecklistItem({ item, onChange, readonly = false }: ChecklistItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes ?? '');
  const config = statusConfig[item.status];

  function handleStatusChange(status: ChecklistStatus) {
    if (readonly) return;
    onChange?.(item.id, status, notes);
    if (status === 'fail') setShowNotes(true);
  }

  function handleNotesBlur() {
    onChange?.(item.id, item.status, notes);
  }

  return (
    <div className={cn(
      'rounded-xl bg-bg-card overflow-hidden transition-colors',
      item.status === 'fail' && 'ring-1 ring-severity-critical/30',
    )}>
      {/* Status color bar */}
      {item.status !== 'pending' && (
        <div className={cn(
          'h-0.5',
          item.status === 'pass' ? 'bg-compliant' :
          item.status === 'fail' ? 'bg-severity-critical' : 'bg-border-default',
        )} />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary leading-tight">{item.label}</span>
              {item.required && (
                <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase bg-severity-critical-bg text-severity-critical">
                  Required
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{item.description}</p>
            )}
            {item.regulation && (
              <span className="snap-code mt-1 inline-block text-[10px] text-info">{item.regulation}</span>
            )}
          </div>

          {/* Status Toggle Buttons */}
          {!readonly && (
            <div className="flex shrink-0 gap-1">
              {(['pass', 'fail', 'na'] as const).map((s) => {
                const sc = statusConfig[s];
                const isActive = item.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded-lg border text-[11px] font-semibold transition-all',
                      isActive
                        ? sc.activeClass
                        : 'border-border-default bg-bg-surface text-text-secondary hover:border-border-default/60',
                    )}
                  >
                    {s === item.status ? <sc.icon className="h-3.5 w-3.5" /> : sc.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Readonly status display */}
          {readonly && item.status !== 'pending' && (
            <span className={cn('flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold', config.activeClass)}>
              <config.icon className="h-3 w-3" />
              {config.label}
            </span>
          )}
        </div>

        {/* Notes area — shown when fail or has notes */}
        {(showNotes || (item.status === 'fail' && !readonly) || item.notes) && !readonly && (
          <div className="mt-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes about this item..."
              rows={2}
              className="w-full resize-none rounded-lg bg-bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-safety-yellow/40"
            />
          </div>
        )}
        {readonly && item.notes && (
          <p className="mt-2 rounded-lg bg-bg-surface px-3 py-2 text-xs text-text-secondary">{item.notes}</p>
        )}
      </div>
    </div>
  );
}
