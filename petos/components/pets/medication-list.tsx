import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Medication } from '@/types/database';

interface MedicationListProps {
  medications: Medication[];
  className?: string;
}

export function MedicationList({ medications, className }: MedicationListProps) {
  if (medications.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
        No medications being tracked.
      </p>
    );
  }

  const active = medications.filter((m) => m.is_active);
  const inactive = medications.filter((m) => !m.is_active);

  return (
    <div className={cn('space-y-6', className)}>
      {active.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Active Medications</h3>
          <div className="space-y-2">
            {active.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        </div>
      )}
      {inactive.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">Past Medications</h3>
          <div className="space-y-2">
            {inactive.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationCard({ medication }: { medication: Medication }) {
  const isRefillSoon = medication.refill_date && new Date(medication.refill_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-lg">
            💊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[var(--foreground)]">{medication.name}</p>
              <Badge variant={medication.is_active ? 'healthy' : 'default'}>
                {medication.is_active ? 'Active' : 'Ended'}
              </Badge>
              {isRefillSoon && <Badge variant="due">Refill Soon</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {medication.dosage && medication.dosage}
              {medication.frequency && ` · ${medication.frequency}`}
              {medication.prescribing_vet && ` · Dr. ${medication.prescribing_vet}`}
            </p>
          </div>
        </div>
        {medication.refill_date && (
          <span className="text-xs text-[var(--muted-foreground)]">
            Refill: {formatDate(medication.refill_date)}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
