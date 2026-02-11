import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { HealthRecord } from '@/types/database';

interface HealthTimelineProps {
  records: HealthRecord[];
  className?: string;
}

const typeIcons: Record<string, string> = {
  vaccination: '💉',
  medication: '💊',
  vet_visit: '🏥',
  surgery: '🔬',
  checkup: '🩺',
  dental: '🦷',
  lab_work: '🧪',
};

const typeColors: Record<string, string> = {
  vaccination: 'bg-blue-100 text-blue-700',
  medication: 'bg-purple-100 text-purple-700',
  vet_visit: 'bg-green-100 text-green-700',
  surgery: 'bg-red-100 text-red-700',
  checkup: 'bg-teal-100 text-teal-700',
  dental: 'bg-amber-100 text-amber-700',
  lab_work: 'bg-indigo-100 text-indigo-700',
};

export function HealthTimeline({ records, className }: HealthTimelineProps) {
  if (records.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
        No health records yet.
      </p>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {records.map((record, index) => (
        <div key={record.id} className="relative flex gap-4">
          {/* Timeline line */}
          {index < records.length - 1 && (
            <div className="absolute left-5 top-10 h-full w-px bg-[var(--border)]" />
          )}
          {/* Icon */}
          <div className={cn(
            'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg',
            typeColors[record.type] || 'bg-gray-100 text-gray-700'
          )}>
            {typeIcons[record.type] || '📋'}
          </div>
          {/* Content */}
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{record.title}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {formatDate(record.date)}
                  {record.vet_name && ` · Dr. ${record.vet_name}`}
                  {record.vet_clinic && ` at ${record.vet_clinic}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {record.cost && (
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    ${record.cost.toFixed(2)}
                  </span>
                )}
                <Badge>{record.type.replace('_', ' ')}</Badge>
              </div>
            </div>
            {record.notes && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{record.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
