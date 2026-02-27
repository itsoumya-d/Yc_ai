'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { createHealthRecord } from '@/lib/actions/health-records';
import type { HealthRecord, Pet } from '@/types/database';

// Standard vaccine schedules by species
const VACCINE_SCHEDULES: Record<string, { name: string; intervalDays: number; core: boolean }[]> = {
  dog: [
    { name: 'DHPP (Distemper/Parvo)',    intervalDays: 365, core: true  },
    { name: 'Rabies',                    intervalDays: 365, core: true  },
    { name: 'Bordetella (Kennel Cough)', intervalDays: 180, core: false },
    { name: 'Leptospirosis',             intervalDays: 365, core: false },
    { name: 'Lyme Disease',              intervalDays: 365, core: false },
    { name: 'Canine Influenza',          intervalDays: 365, core: false },
  ],
  cat: [
    { name: 'FVRCP (Feline 3-in-1)',     intervalDays: 365, core: true  },
    { name: 'Rabies',                    intervalDays: 365, core: true  },
    { name: 'FeLV (Feline Leukemia)',    intervalDays: 365, core: false },
    { name: 'FIV (Feline Immunodeficiency)', intervalDays: 365, core: false },
  ],
  rabbit: [
    { name: 'RHDV2 (Rabbit Hemorrhagic Disease)', intervalDays: 365, core: true },
    { name: 'Myxomatosis',               intervalDays: 365, core: true  },
  ],
};

function getDueStatus(
  lastDate: string | null,
  intervalDays: number
): { status: 'overdue' | 'due-soon' | 'ok' | 'unknown'; daysUntil: number | null; nextDue: Date | null } {
  if (!lastDate) return { status: 'unknown', daysUntil: null, nextDue: null };
  const last = new Date(lastDate);
  const next = new Date(last.getTime() + intervalDays * 86400000);
  const today = new Date();
  const daysUntil = Math.ceil((next.getTime() - today.getTime()) / 86400000);
  const status =
    daysUntil < 0    ? 'overdue'  :
    daysUntil <= 30  ? 'due-soon' :
    'ok';
  return { status, daysUntil, nextDue: next };
}

interface VaccineSchedulerProps {
  pet:         Pet;
  vaccinationRecords: HealthRecord[];
  className?:  string;
}

export function VaccineScheduler({ pet, vaccinationRecords, className }: VaccineSchedulerProps) {
  const { toast }     = useToast();
  const [isPending, startTransition] = useTransition();
  const [showAdd,   setShowAdd]   = useState<string | null>(null); // vaccine name being added
  const [addDate,   setAddDate]   = useState(new Date().toISOString().split('T')[0]!);
  const [addVet,    setAddVet]    = useState('');
  const [addCost,   setAddCost]   = useState('');
  const [addNotes,  setAddNotes]  = useState('');

  const species = (pet.species ?? 'dog').toLowerCase();
  const vaccines = VACCINE_SCHEDULES[species] ?? VACCINE_SCHEDULES['dog']!;

  // Map vaccine name → most recent record
  const latestByVaccine: Record<string, HealthRecord> = {};
  for (const record of vaccinationRecords) {
    const existing = latestByVaccine[record.title];
    if (!existing || record.date > existing.date) {
      latestByVaccine[record.title] = record;
    }
  }

  async function handleLogVaccine(vaccineName: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('pet_id',    pet.id);
      formData.set('type',      'vaccination');
      formData.set('title',     vaccineName);
      formData.set('date',      addDate);
      formData.set('vet_name',  addVet);
      formData.set('cost',      addCost);
      formData.set('notes',     addNotes);

      const result = await createHealthRecord(formData);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Vaccination logged', variant: 'success' });
        setShowAdd(null);
        setAddDate(new Date().toISOString().split('T')[0]!);
        setAddVet('');
        setAddCost('');
        setAddNotes('');
      }
    });
  }

  const overdue  = vaccines.filter(v => getDueStatus(latestByVaccine[v.name]?.date ?? null, v.intervalDays).status === 'overdue');
  const dueSoon  = vaccines.filter(v => getDueStatus(latestByVaccine[v.name]?.date ?? null, v.intervalDays).status === 'due-soon');
  const upToDate = vaccines.filter(v => getDueStatus(latestByVaccine[v.name]?.date ?? null, v.intervalDays).status === 'ok');
  const unknown  = vaccines.filter(v => getDueStatus(latestByVaccine[v.name]?.date ?? null, v.intervalDays).status === 'unknown');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Overdue',    count: overdue.length,  color: 'text-red-600  bg-red-50  border-red-200'   },
          { label: 'Due Soon',   count: dueSoon.length,  color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { label: 'Up to Date', count: upToDate.length, color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Unknown',    count: unknown.length,  color: 'text-gray-600 bg-gray-50 border-gray-200'   },
        ].map(({ label, count, color }) => (
          <div key={label} className={cn('rounded-xl border p-4 text-center', color)}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Vaccine list */}
      <div className="space-y-3">
        {vaccines.map((vaccine) => {
          const latest = latestByVaccine[vaccine.name];
          const { status, daysUntil, nextDue } = getDueStatus(latest?.date ?? null, vaccine.intervalDays);
          const isAdding = showAdd === vaccine.name;

          return (
            <Card key={vaccine.name} className={cn(
              'transition-colors',
              status === 'overdue'  && 'border-red-200 bg-red-50/50',
              status === 'due-soon' && 'border-yellow-200 bg-yellow-50/50',
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--foreground)]">{vaccine.name}</p>
                      {vaccine.core && (
                        <Badge variant="secondary" className="text-[10px]">Core</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {latest ? (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Last given: {formatDate(latest.date)}
                          {latest.vet_name && ` · ${latest.vet_name}`}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--muted-foreground)]">Never recorded</p>
                      )}
                      {nextDue && (
                        <p className={cn(
                          'text-xs font-medium',
                          status === 'overdue'  ? 'text-red-600'    :
                          status === 'due-soon' ? 'text-yellow-700' :
                          'text-green-700'
                        )}>
                          {status === 'overdue'
                            ? `Overdue by ${Math.abs(daysUntil!)} days`
                            : `Due ${formatDate(nextDue.toISOString())} (${daysUntil} days)`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'inline-flex h-2 w-2 rounded-full',
                      status === 'overdue'  ? 'bg-red-500'    :
                      status === 'due-soon' ? 'bg-yellow-400' :
                      status === 'ok'       ? 'bg-green-500'  :
                      'bg-gray-300'
                    )} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAdd(isAdding ? null : vaccine.name)}
                    >
                      Log
                    </Button>
                  </div>
                </div>

                {isAdding && (
                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                          Date Given
                        </label>
                        <Input
                          type="date"
                          value={addDate}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setAddDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                          Vet Name
                        </label>
                        <Input
                          value={addVet}
                          onChange={(e) => setAddVet(e.target.value)}
                          placeholder="Dr. Smith"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                          Cost ($)
                        </label>
                        <Input
                          type="number"
                          value={addCost}
                          onChange={(e) => setAddCost(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                          Notes
                        </label>
                        <Input
                          value={addNotes}
                          onChange={(e) => setAddNotes(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLogVaccine(vaccine.name)}
                        disabled={isPending || !addDate}
                      >
                        {isPending ? 'Saving…' : 'Save Record'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAdd(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All-time history */}
      {vaccinationRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vaccination History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vaccinationRecords
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{record.title}</p>
                      {record.vet_name && (
                        <p className="text-xs text-[var(--muted-foreground)]">{record.vet_name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatDate(record.date)}</p>
                      {record.cost != null && (
                        <p className="text-xs text-[var(--muted-foreground)]">${record.cost.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
