'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getVaccinationSchedule } from '@/lib/actions/vaccinations';
import { createHealthRecord } from '@/lib/actions/health-records';
import type { VaccinationStatus } from '@/types/database';

interface VaccinationScheduleProps {
  petId: string;
  petName: string;
}

const statusConfig: Record<VaccinationStatus['status'], { label: string; variant: string; className: string }> = {
  up_to_date: { label: 'Up to date', variant: 'healthy', className: '' },
  due_soon: { label: 'Due soon', variant: 'warning', className: '' },
  overdue: { label: 'Overdue', variant: 'destructive', className: '' },
  not_started: { label: 'Not started', variant: 'default', className: '' },
};

export function VaccinationSchedule({ petId, petName }: VaccinationScheduleProps) {
  const { toast } = useToast();
  const [vaccinations, setVaccinations] = useState<VaccinationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [recordingVaccine, setRecordingVaccine] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getVaccinationSchedule(petId);
      if (result.data) {
        setVaccinations(result.data);
      }
      setLoading(false);
    }
    load();
  }, [petId]);

  function handleRecord(vaccine: string) {
    setRecordingVaccine(vaccine);
    const today = new Date().toISOString().split('T')[0];

    startTransition(async () => {
      const formData = new FormData();
      formData.set('pet_id', petId);
      formData.set('type', 'vaccination');
      formData.set('title', vaccine);
      formData.set('description', `${vaccine} vaccination for ${petName}`);
      formData.set('date', today);

      const result = await createHealthRecord(formData);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Vaccination recorded', description: `${vaccine} marked as given today.`, variant: 'success' });
        // Reload schedule
        const refreshed = await getVaccinationSchedule(petId);
        if (refreshed.data) setVaccinations(refreshed.data);
      }
      setRecordingVaccine(null);
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-[var(--muted-foreground)]">Loading vaccination schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (vaccinations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vaccination Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            No standard vaccination schedule available for this species.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = vaccinations.filter((v) => v.status === 'overdue').length;
  const dueSoonCount = vaccinations.filter((v) => v.status === 'due_soon').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Vaccination Schedule</CardTitle>
          <div className="flex gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive">{overdueCount} overdue</Badge>
            )}
            {dueSoonCount > 0 && (
              <Badge variant="warning">{dueSoonCount} due soon</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-2 text-left font-medium text-[var(--muted-foreground)]">Vaccine</th>
                <th className="pb-2 text-left font-medium text-[var(--muted-foreground)]">Last Given</th>
                <th className="pb-2 text-left font-medium text-[var(--muted-foreground)]">Next Due</th>
                <th className="pb-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                <th className="pb-2 text-right font-medium text-[var(--muted-foreground)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.map((vax) => {
                const config = statusConfig[vax.status];
                return (
                  <tr key={vax.vaccine} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-[var(--foreground)]">{vax.vaccine}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{vax.description}</p>
                    </td>
                    <td className="py-3 text-[var(--muted-foreground)]">
                      {vax.lastGiven ? formatDate(vax.lastGiven) : '—'}
                    </td>
                    <td className="py-3 text-[var(--muted-foreground)]">
                      {vax.nextDue ? formatDate(vax.nextDue) : '—'}
                    </td>
                    <td className="py-3">
                      <Badge variant={config.variant as 'healthy' | 'destructive' | 'warning' | 'default'}>
                        {config.label}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending && recordingVaccine === vax.vaccine}
                        onClick={() => handleRecord(vax.vaccine)}
                      >
                        {isPending && recordingVaccine === vax.vaccine ? 'Saving...' : 'Record'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
