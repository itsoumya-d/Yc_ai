'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createAppointment } from '@/lib/actions/appointments';
import type { Pet } from '@/types/database';

interface AppointmentFormProps {
  pets: Pet[];
  onSuccess?: () => void;
}

const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Checkup' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'sick_visit', label: 'Sick Visit' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'dental', label: 'Dental' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'other', label: 'Other' },
];

export function AppointmentForm({ pets, onSuccess }: AppointmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createAppointment(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Appointment scheduled', variant: 'success' });
    setLoading(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pet_id" className="mb-1 block text-sm font-medium text-[var(--foreground)]">Pet</label>
          <select
            id="pet_id" name="pet_id" required
            className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-[var(--foreground)]">Type</label>
          <select
            id="type" name="type" required
            className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {APPOINTMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="date" name="date" label="Date" type="date" required />
        <Input id="time" name="time" label="Time" type="time" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="vet_name" name="vet_name" label="Vet Name" placeholder="Dr. Smith" />
        <Input id="clinic_name" name="clinic_name" label="Clinic" placeholder="Happy Paws Clinic" />
      </div>

      <Input id="clinic_address" name="clinic_address" label="Address" placeholder="123 Main St" />

      <Textarea id="notes" name="notes" label="Notes" placeholder="Any details..." rows={2} />

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
  );
}
