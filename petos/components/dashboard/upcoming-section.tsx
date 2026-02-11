import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Appointment, Medication } from '@/types/database';

type AppointmentWithPet = Appointment & { pets?: { name: string } };
type MedicationWithPet = Medication & { pets?: { name: string } };

interface UpcomingSectionProps {
  appointments: AppointmentWithPet[];
  medications: MedicationWithPet[];
}

export function UpcomingSection({ appointments, medications }: UpcomingSectionProps) {
  const refillSoon = medications.filter((m) => {
    if (!m.refill_date || !m.is_active) return false;
    return new Date(m.refill_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No upcoming appointments.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {appt.type.replace('_', ' ')}
                        {appt.pets?.name && <span className="text-[var(--muted-foreground)]"> · {appt.pets.name}</span>}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatDate(appt.date)}{appt.time && ` at ${appt.time}`}
                      </p>
                    </div>
                    <Badge variant="scheduled">Scheduled</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medication Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {refillSoon.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No refills needed soon.</p>
          ) : (
            <div className="space-y-3">
              {refillSoon.map((med) => (
                  <div key={med.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {med.name}
                        {med.pets?.name && <span className="text-[var(--muted-foreground)]"> · {med.pets.name}</span>}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {med.dosage}{med.frequency && ` · ${med.frequency}`}
                      </p>
                    </div>
                    <Badge variant="due">Refill: {formatDate(med.refill_date!)}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
