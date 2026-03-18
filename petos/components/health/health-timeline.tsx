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
  surgery: '🏥',
  checkup: '🩺',
  dental: '🦷',
  lab_work: '🧪',
};

const typeColors: Record<string, string> = {
  vaccination: 'bg-blue-100 text-blue-700',
  medication: 'bg-purple-100 text-purple-700',
  vet_visit: 'bg-green-100 text-green-700',
  surgery: 'bg-red-100 text-red-700',
  checkup: 'bg-green-100 text-green-700',
  dental: 'bg-amber-100 text-amber-700',
  lab_work: 'bg-indigo-100 text-indigo-700',
};

const typeDotColors: Record<string, string> = {
  vaccination: '#3B82F6',
  medication: '#8B5CF6',
  vet_visit: '#10B981',
  surgery: '#EF4444',
  checkup: '#10B981',
  dental: '#F59E0B',
  lab_work: '#6366F1',
};

function getMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function groupRecordsByMonth(records: HealthRecord[]): Array<{ monthLabel: string; records: HealthRecord[] }> {
  const groups: Record<string, HealthRecord[]> = {};

  for (const record of records) {
    const key = getMonthYear(record.date);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
  }

  // Sort months descending (most recent first) and records within each month also descending
  return Object.entries(groups)
    .sort(([a], [b]) => {
      const dateA = new Date(groups[a][0].date);
      const dateB = new Date(groups[b][0].date);
      return dateB.getTime() - dateA.getTime();
    })
    .map(([monthLabel, recs]) => ({
      monthLabel,
      records: [...recs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
}

export function HealthTimeline({ records, className }: HealthTimelineProps) {
  if (records.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
        No health records yet.
      </p>
    );
  }

  const groups = groupRecordsByMonth(records);

  return (
    <div className={cn('space-y-6', className)}>
      {groups.map(({ monthLabel, records: monthRecords }) => (
        <div key={monthLabel}>
          {/* Month header */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {monthLabel}
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Records within month */}
          <div className="space-y-3">
            {monthRecords.map((record, index) => {
              const dotColor = typeDotColors[record.type] || '#6B7280';
              const isLast = index === monthRecords.length - 1;

              return (
                <div
                  key={record.id}
                  className="relative flex gap-4 transition-all duration-300"
                >
                  {/* Vertical connector line */}
                  <div className="relative flex flex-col items-center">
                    {/* Colored dot */}
                    <div
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{
                        backgroundColor: `${dotColor}1A`,
                        color: dotColor,
                        boxShadow: `0 0 0 2px ${dotColor}33`,
                      }}
                    >
                      {typeIcons[record.type] || '📋'}
                    </div>
                    {/* Line below dot (not for last in group) */}
                    {!isLast && (
                      <div
                        className="mt-1 w-px flex-1"
                        style={{ backgroundColor: `${dotColor}40`, minHeight: '12px' }}
                      />
                    )}
                  </div>

                  {/* Content card */}
                  <div className="mb-1 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-300 hover:border-[var(--ring)] hover:shadow-[var(--shadow-card-hover)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">
                          {record.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                          {formatDate(record.date)}
                          {record.vet_name && ` · Dr. ${record.vet_name}`}
                          {record.vet_clinic && ` at ${record.vet_clinic}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {record.cost != null && (
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            ${record.cost.toFixed(2)}
                          </span>
                        )}
                        <Badge
                          className={cn(
                            'border-0 text-xs',
                            typeColors[record.type] || 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {record.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    {record.notes && (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
