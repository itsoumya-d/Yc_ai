import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Appointment } from '@/types/database';

interface AppointmentCardProps {
  appointment: Appointment & { pets?: { name: string } };
  className?: string;
}

export function AppointmentCard({ appointment, className }: AppointmentCardProps) {
  const petName = appointment.pets?.name;

  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <span className="text-xs font-bold leading-none">
              {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-sm font-bold leading-none">
              {new Date(appointment.date).getDate()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {appointment.type.replace('_', ' ')}
              {petName && <span className="text-[var(--muted-foreground)]"> · {petName}</span>}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {appointment.time && `${appointment.time} · `}
              {appointment.vet_name && `Dr. ${appointment.vet_name}`}
              {appointment.clinic_name && ` at ${appointment.clinic_name}`}
            </p>
          </div>
        </div>
        <Badge variant={appointment.status as 'scheduled' | 'completed' | 'cancelled' | 'missed'}>
          {appointment.status}
        </Badge>
      </CardContent>
    </Card>
  );
}
