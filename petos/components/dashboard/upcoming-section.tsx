import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Appointment, Medication } from '@/types/database';
import type { VaccinationScheduleItem } from '@/lib/actions/vaccinations';

type AppointmentWithPet = Appointment & { pets?: { name: string } };
type MedicationWithPet = Medication & { pets?: { name: string } };

interface UpcomingSectionProps {
  appointments: AppointmentWithPet[];
  medications: MedicationWithPet[];
  vaccinations?: VaccinationScheduleItem[];
}

export function UpcomingSection({
  appointments,
  medications,
  vaccinations = [],
}: UpcomingSectionProps) {
  const refillSoon = medications.filter((m) => {
    if (!m.refill_date || !m.is_active) return false;
    return new Date(m.refill_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  });

  const overdueVaccinations = vaccinations.filter((v) => v.is_overdue);
  const dueSoonVaccinations = vaccinations.filter((v) => !v.is_overdue && v.days_until_due <= 30);
  const alertVaccinations = [...overdueVaccinations, ...dueSoonVaccinations].slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                      {appt.pets?.name && (
                        <span className="text-[var(--muted-foreground)]"> · {appt.pets.name}</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(appt.date)}
                      {appt.time && ` at ${appt.time}`}
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
                      {med.pets?.name && (
                        <span className="text-[var(--muted-foreground)]"> · {med.pets.name}</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {med.dosage}
                      {med.frequency && ` · ${med.frequency}`}
                    </p>
                  </div>
                  <Badge variant="due">Refill: {formatDate(med.refill_date!)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vaccination Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vaccination Alerts</CardTitle>
          {vaccinations.length > 0 && (
            <Link
              href="/health"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {alertVaccinations.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              {vaccinations.length === 0
                ? 'Add vaccination records in Health to track due dates.'
                : 'All vaccinations are up to date.'}
            </p>
          ) : (
            <div className="space-y-3">
              {alertVaccinations.map((vacc) => {
                const isOverdue = vacc.is_overdue;
                const daysText = isOverdue
                  ? `${Math.abs(vacc.days_until_due)}d overdue`
                  : vacc.days_until_due === 0
                  ? 'Due today'
                  : `Due in ${vacc.days_until_due}d`;

                return (
                  <div key={vacc.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {vacc.vaccine_name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(vacc.next_due).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={isOverdue ? 'urgent' : 'due'}>{daysText}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
