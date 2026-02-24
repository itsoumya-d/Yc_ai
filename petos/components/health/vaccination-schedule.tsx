'use client';

import { Badge } from '@/components/ui/badge';
import type { VaccinationScheduleItem } from '@/lib/actions/vaccinations';

interface VaccinationScheduleProps {
  items: VaccinationScheduleItem[];
}

function urgencyLabel(days: number): { label: string; variant: string } {
  if (days < 0) return { label: 'Overdue', variant: 'urgent' };
  if (days <= 30) return { label: 'Due soon', variant: 'due' };
  if (days <= 90) return { label: 'Upcoming', variant: 'info' };
  return { label: 'On schedule', variant: 'healthy' };
}

export function VaccinationSchedule({ items }: VaccinationScheduleProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        No vaccination records found. Add vaccinations in Health Records to see the schedule here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const { label, variant } = urgencyLabel(item.days_until_due);
        const nextDue = new Date(item.next_due).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const daysText =
          item.days_until_due < 0
            ? `${Math.abs(item.days_until_due)} days ago`
            : item.days_until_due === 0
            ? 'Today'
            : `in ${item.days_until_due} days`;

        return (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{item.vaccine_name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Next due: {nextDue} ({daysText})
              </p>
            </div>
            <Badge variant={variant as 'urgent' | 'due' | 'info' | 'healthy'}>
              {label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
