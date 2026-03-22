'use client';

import { cn, formatDate } from '@/lib/utils';
import type { HealthRecord, Appointment } from '@/types/database';

interface HealthTrendsCardProps {
  records: HealthRecord[];
  appointments?: Appointment[];
  className?: string;
}

function getDayLabel(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getRecordsPerDay(records: HealthRecord[]): number[] {
  const now = new Date();
  const counts: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const target = new Date(now);
    target.setDate(now.getDate() - i);
    const targetStr = target.toISOString().split('T')[0];
    const count = records.filter((r) => r.date === targetStr).length;
    counts.push(count);
  }

  return counts;
}

function getLastVetVisit(records: HealthRecord[]): string | null {
  const vetRecords = records.filter(
    (r) => r.type === 'vet_visit' || r.type === 'checkup'
  );
  if (vetRecords.length === 0) return null;
  const sorted = [...vetRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted[0].date;
}

function getUpcomingCount(appointments: Appointment[]): number {
  const now = new Date().toISOString().split('T')[0];
  return appointments.filter(
    (a) => a.status === 'scheduled' && a.date >= now
  ).length;
}

function getDaysSince(dateStr: string): number {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function HealthTrendsCard({
  records,
  appointments = [],
  className,
}: HealthTrendsCardProps) {
  const totalRecords = records.length;
  const upcomingCount = getUpcomingCount(appointments);
  const lastVetDate = getLastVetVisit(records);
  const barsData = getRecordsPerDay(records);
  const maxBar = Math.max(...barsData, 1);

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]',
        className
      )}
    >
      <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--foreground)]">
        Health Overview
      </h3>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {/* Total records */}
        <div className="rounded-lg bg-[var(--muted)] px-3 py-2.5 text-center">
          <p className="text-lg font-bold text-[var(--foreground)]">{totalRecords}</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Total Records</p>
        </div>

        {/* Upcoming */}
        <div
          className={cn(
            'rounded-lg px-3 py-2.5 text-center',
            upcomingCount > 0 ? 'bg-amber-50' : 'bg-[var(--muted)]'
          )}
        >
          <p
            className={cn(
              'text-lg font-bold',
              upcomingCount > 0 ? 'text-amber-700' : 'text-[var(--foreground)]'
            )}
          >
            {upcomingCount}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Upcoming</p>
        </div>

        {/* Last vet visit */}
        <div className="rounded-lg bg-[var(--muted)] px-3 py-2.5 text-center">
          {lastVetDate ? (
            <>
              <p className="text-lg font-bold text-[var(--foreground)]">
                {getDaysSince(lastVetDate)}d
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Since Vet</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-[var(--muted-foreground)]">—</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">No Vet Visit</p>
            </>
          )}
        </div>
      </div>

      {/* Last vet visit label */}
      {lastVetDate && (
        <p className="mb-4 text-xs text-[var(--muted-foreground)]">
          Last vet visit:{' '}
          <span className="font-medium text-[var(--foreground)]">
            {formatDate(lastVetDate)}
          </span>
        </p>
      )}

      {/* Activity bar chart — past 7 days */}
      <div>
        <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">
          Activity — last 7 days
        </p>
        <div className="flex items-end gap-1.5">
          {barsData.map((count, i) => {
            const heightPct = maxBar > 0 ? (count / maxBar) * 100 : 0;
            const heightPx = Math.max(heightPct * 0.56, count > 0 ? 8 : 4); // max ~56px
            const label = getDayLabel(6 - i);
            const isToday = i === 6;

            return (
              <div
                key={i}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${label}: ${count} record${count !== 1 ? 's' : ''}`}
              >
                <div className="flex w-full flex-col-reverse items-center">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all duration-300',
                      count > 0
                        ? isToday
                          ? 'bg-brand-500'
                          : 'bg-brand-300'
                        : 'bg-[var(--border)]'
                    )}
                    style={{ height: `${heightPx}px` }}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    isToday
                      ? 'font-semibold text-brand-600'
                      : 'text-[var(--muted-foreground)]'
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
