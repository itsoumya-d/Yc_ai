'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { createMedication, deleteMedication } from '@/lib/actions/medications';
import type { Medication, Pet } from '@/types/database';

// Days until refill warning threshold
const REFILL_WARNING_DAYS = 7;

function daysUntilRefill(refillDate: string | null): number | null {
  if (!refillDate) return null;
  const diff = Math.ceil(
    (new Date(refillDate).getTime() - Date.now()) / 86400000
  );
  return diff;
}

function frequencyBadgeColor(freq: string | null) {
  if (!freq) return '';
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('bid') || f.includes('tid') || f.includes('qid'))
    return 'bg-blue-100 text-blue-700';
  if (f.includes('weekly')) return 'bg-purple-100 text-purple-700';
  if (f.includes('as needed')) return 'bg-gray-100 text-gray-700';
  return 'bg-green-100 text-green-700';
}

const FREQUENCY_OPTIONS = [
  'Once daily (morning)',
  'Once daily (evening)',
  'Twice daily (BID)',
  'Three times daily (TID)',
  'Four times daily (QID)',
  'Every other day',
  'Weekly',
  'As needed (PRN)',
];

interface MedicationTrackerProps {
  pet:         Pet;
  medications: Medication[];
  className?:  string;
}

export function MedicationTracker({ pet, medications, className }: MedicationTrackerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name:           '',
    dosage:         '',
    frequency:      '',
    start_date:     new Date().toISOString().split('T')[0]!,
    end_date:       '',
    refill_date:    '',
    prescribing_vet:'',
    notes:          '',
  });

  const active   = medications.filter((m) => m.is_active);
  const inactive = medications.filter((m) => !m.is_active);

  // Refill alerts
  const refillAlerts = active.filter((m) => {
    const days = daysUntilRefill(m.refill_date);
    return days !== null && days <= REFILL_WARNING_DAYS;
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.set('pet_id',         pet.id);
      fd.set('name',           form.name);
      fd.set('dosage',         form.dosage);
      fd.set('frequency',      form.frequency);
      fd.set('start_date',     form.start_date);
      fd.set('end_date',       form.end_date);
      fd.set('refill_date',    form.refill_date);
      fd.set('prescribing_vet', form.prescribing_vet);
      fd.set('notes',          form.notes);
      fd.set('is_active',      'true');

      const result = await createMedication(fd);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Medication added', variant: 'success' });
        setShowAdd(false);
        setForm({
          name: '', dosage: '', frequency: '', start_date: new Date().toISOString().split('T')[0]!,
          end_date: '', refill_date: '', prescribing_vet: '', notes: '',
        });
      }
    });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteMedication(id);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Medication removed', variant: 'success' });
      }
      setDeletingId(null);
    });
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Refill alerts */}
      {refillAlerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Refill Needed Soon
          </p>
          <ul className="mt-2 space-y-1">
            {refillAlerts.map((m) => {
              const days = daysUntilRefill(m.refill_date);
              return (
                <li key={m.id} className="text-sm text-amber-700">
                  {m.name} — refill in {days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'}`}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add medication */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Medications ({active.length} active)
        </h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} variant="outline">
          {showAdd ? 'Cancel' : '+ Add Medication'}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">New Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Medication Name *
                  </label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Rimadyl"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Dosage
                  </label>
                  <Input
                    value={form.dosage}
                    onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))}
                    placeholder="e.g. 25mg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Frequency
                  </label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
                    className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Select…</option>
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={form.end_date}
                    min={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Refill Date
                  </label>
                  <Input
                    type="date"
                    value={form.refill_date}
                    onChange={(e) => setForm((p) => ({ ...p, refill_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Prescribing Vet
                  </label>
                  <Input
                    value={form.prescribing_vet}
                    onChange={(e) => setForm((p) => ({ ...p, prescribing_vet: e.target.value }))}
                    placeholder="Dr. Smith"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                    Notes
                  </label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Give with food, etc."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPending || !form.name}>
                  {isPending ? 'Adding…' : 'Add Medication'}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active medications */}
      {active.length > 0 ? (
        <div className="space-y-3">
          {active.map((med) => {
            const days = daysUntilRefill(med.refill_date);
            const refillUrgent = days !== null && days <= REFILL_WARNING_DAYS;

            return (
              <Card key={med.id} className={cn(refillUrgent && 'border-amber-200')}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--foreground)]">{med.name}</p>
                        {med.dosage && (
                          <span className="text-sm text-[var(--muted-foreground)]">{med.dosage}</span>
                        )}
                        {med.frequency && (
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', frequencyBadgeColor(med.frequency))}>
                            {med.frequency}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                        {med.prescribing_vet && <span>Dr. {med.prescribing_vet}</span>}
                        <span>Started {formatDate(med.start_date)}</span>
                        {med.end_date && <span>Until {formatDate(med.end_date)}</span>}
                        {med.refill_date && (
                          <span className={cn(refillUrgent ? 'text-amber-700 font-medium' : '')}>
                            Refill: {formatDate(med.refill_date)}
                            {days !== null && days <= 14 && ` (${days}d)`}
                          </span>
                        )}
                      </div>
                      {med.notes && (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)] italic">
                          {med.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(med.id)}
                      disabled={deletingId === med.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove medication"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        !showAdd && (
          <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
            <p className="text-2xl">💊</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              No active medications for {pet.name}.
            </p>
          </div>
        )
      )}

      {/* Past medications */}
      {inactive.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Past Medications ({inactive.length})
          </summary>
          <div className="mt-3 space-y-2">
            {inactive.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-4 py-3 opacity-70"
              >
                <div>
                  <p className="text-sm font-medium line-through text-[var(--muted-foreground)]">
                    {med.name}
                  </p>
                  {med.end_date && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Ended {formatDate(med.end_date)}
                    </p>
                  )}
                </div>
                {med.dosage && (
                  <span className="text-xs text-[var(--muted-foreground)]">{med.dosage}</span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
