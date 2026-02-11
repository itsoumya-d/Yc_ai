'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createHealthRecord } from '@/lib/actions/health-records';
import type { Pet } from '@/types/database';

interface HealthRecordFormProps {
  pets: Pet[];
  defaultPetId?: string;
  onSuccess?: () => void;
}

const RECORD_TYPES = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'medication', label: 'Medication' },
  { value: 'vet_visit', label: 'Vet Visit' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'checkup', label: 'Checkup' },
  { value: 'dental', label: 'Dental' },
  { value: 'lab_work', label: 'Lab Work' },
];

export function HealthRecordForm({ pets, defaultPetId, onSuccess }: HealthRecordFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createHealthRecord(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Health record added', variant: 'success' });
    setLoading(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pet_id" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Pet
          </label>
          <select
            id="pet_id"
            name="pet_id"
            defaultValue={defaultPetId || ''}
            required
            className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Type
          </label>
          <select
            id="type"
            name="type"
            required
            className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {RECORD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Input id="title" name="title" label="Title" placeholder="Annual vaccination" required />
      <Input id="date" name="date" label="Date" type="date" required />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="vet_name" name="vet_name" label="Vet Name" placeholder="Dr. Smith" />
        <Input id="vet_clinic" name="vet_clinic" label="Clinic" placeholder="Happy Paws Clinic" />
      </div>

      <Input id="cost" name="cost" label="Cost ($)" type="number" step="0.01" placeholder="150.00" />

      <Textarea id="notes" name="notes" label="Notes" placeholder="Any additional details..." rows={3} />

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Record'}
        </Button>
      </div>
    </form>
  );
}
