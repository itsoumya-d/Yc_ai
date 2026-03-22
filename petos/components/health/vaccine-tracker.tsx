'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { HealthRecord, Pet } from '@/types/database';

// Species-specific recommended vaccine intervals (in days)
const VACCINE_SCHEDULES: Record<string, Record<string, number>> = {
  dog: {
    rabies: 365, // 1 year (some are 3-year, simplified here)
    dhpp: 365,
    bordetella: 365,
    leptospirosis: 365,
    lyme: 365,
    influenza: 365,
    default: 365,
  },
  cat: {
    rabies: 365,
    fvrcp: 365,
    felv: 365,
    default: 365,
  },
  default: {
    default: 365,
  },
};

function getVaccineInterval(species: string, vaccineName: string): number {
  const speciesSchedule = VACCINE_SCHEDULES[species] ?? VACCINE_SCHEDULES.default;
  const nameLower = vaccineName.toLowerCase();

  for (const [key, interval] of Object.entries(speciesSchedule)) {
    if (key !== 'default' && nameLower.includes(key)) {
      return interval;
    }
  }
  return speciesSchedule.default ?? 365;
}

function getVaccineStatus(lastDate: string, intervalDays: number): {
  status: 'up_to_date' | 'due_soon' | 'overdue';
  nextDue: Date;
  daysUntilDue: number;
} {
  const last = new Date(lastDate);
  const nextDue = new Date(last.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status: 'up_to_date' | 'due_soon' | 'overdue';
  if (daysUntilDue < 0) status = 'overdue';
  else if (daysUntilDue <= 30) status = 'due_soon';
  else status = 'up_to_date';

  return { status, nextDue, daysUntilDue };
}

interface VaccineTrackerProps {
  pet: Pet;
  records: HealthRecord[];
}

export function VaccineTracker({ pet, records }: VaccineTrackerProps) {
  const [showAll, setShowAll] = useState(false);

  // Get vaccination records
  const vaccinations = records.filter((r) => r.type === 'vaccination');

  // Group by vaccine name (latest first)
  const latestByVaccine = new Map<string, HealthRecord>();
  for (const vac of vaccinations.sort((a, b) => b.date.localeCompare(a.date))) {
    const key = vac.title.toLowerCase().trim();
    if (!latestByVaccine.has(key)) {
      latestByVaccine.set(key, vac);
    }
  }

  const vaccineStatuses = Array.from(latestByVaccine.values()).map((record) => {
    const intervalDays = getVaccineInterval(pet.species, record.title);
    const statusInfo = getVaccineStatus(record.date, intervalDays);
    return { record, ...statusInfo };
  });

  // Sort: overdue first, then due soon, then up to date
  vaccineStatuses.sort((a, b) => {
    const order = { overdue: 0, due_soon: 1, up_to_date: 2 };
    return order[a.status] - order[b.status];
  });

  const displayed = showAll ? vaccineStatuses : vaccineStatuses.slice(0, 5);
  const overdueCount = vaccineStatuses.filter((v) => v.status === 'overdue').length;
  const dueSoonCount = vaccineStatuses.filter((v) => v.status === 'due_soon').length;

  if (vaccinations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vaccine Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            No vaccinations recorded yet. Add vaccination records to track due dates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Vaccine Tracker</CardTitle>
          <div className="flex gap-2">
            {overdueCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {overdueCount} overdue
              </span>
            )}
            {dueSoonCount > 0 && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                {dueSoonCount} due soon
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayed.map(({ record, status, nextDue, daysUntilDue }) => (
          <div key={record.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  status === 'overdue'
                    ? 'bg-red-500'
                    : status === 'due_soon'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">{record.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Last: {formatDate(record.date)}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              {status === 'overdue' ? (
                <span className="text-xs font-semibold text-red-600">
                  {Math.abs(daysUntilDue)}d overdue
                </span>
              ) : status === 'due_soon' ? (
                <span className="text-xs font-semibold text-yellow-600">
                  Due in {daysUntilDue}d
                </span>
              ) : (
                <span className="text-xs text-[var(--muted-foreground)]">
                  Due {formatDate(nextDue.toISOString())}
                </span>
              )}
            </div>
          </div>
        ))}

        {vaccineStatuses.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {showAll ? 'Show less' : `Show all ${vaccineStatuses.length} vaccines`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
