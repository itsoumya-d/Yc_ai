'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createPet, updatePet } from '@/lib/actions/pets';
import type { Pet } from '@/types/database';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';

interface PetFormProps {
  pet?: Pet;
}

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'fish', label: 'Fish' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'small_mammal', label: 'Small Mammal' },
  { value: 'other', label: 'Other' },
];

export function PetForm({ pet }: PetFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState(pet?.notes ?? '');

  const { status: autoSaveStatus, statusText: autoSaveText } = useAutoSave({
    value: notes,
    onSave: async (val) => {
      if (!pet?.id) return;
      const fd = new FormData();
      fd.set('notes', val);
      return await updatePet(pet.id, fd);
    },
    delay: 1500,
    skipIf: (val) => val === (pet?.notes ?? ''),
  });

  const triggerShake = () => {
    const el = shakeRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'shake 0.5s ease';
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = pet
        ? await updatePet(pet.id, formData)
        : await createPet(formData);

      if (result.error) {
        setSubmitError(result.error);
        triggerShake();
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        setLoading(false);
        return;
      }

      toast({
        title: pet ? 'Pet updated' : 'Pet added',
        description: pet ? `${formData.get('name')} has been updated.` : `${formData.get('name')} has been added!`,
        variant: 'success',
      });

      router.push(pet ? `/pets/${pet.id}` : '/pets');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setSubmitError(msg);
      triggerShake();
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{pet ? 'Edit Pet' : 'Add New Pet'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="name"
              name="name"
              label="Pet Name"
              placeholder="Buddy"
              defaultValue={pet?.name}
              required
            />
            <div>
              <label htmlFor="species" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Species
              </label>
              <select
                id="species"
                name="species"
                defaultValue={pet?.species || 'dog'}
                required
                className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {SPECIES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="breed"
              name="breed"
              label="Breed"
              placeholder="Golden Retriever"
              defaultValue={pet?.breed || ''}
            />
            <Input
              id="date_of_birth"
              name="date_of_birth"
              label="Date of Birth"
              type="date"
              defaultValue={pet?.date_of_birth || ''}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              id="weight"
              name="weight"
              label="Weight"
              type="number"
              step="0.1"
              placeholder="25"
              defaultValue={pet?.weight?.toString() || ''}
            />
            <div>
              <label htmlFor="weight_unit" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Unit
              </label>
              <select
                id="weight_unit"
                name="weight_unit"
                defaultValue={pet?.weight_unit || 'lbs'}
                className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
            <div>
              <label htmlFor="gender" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={pet?.gender || ''}
                className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="color"
              name="color"
              label="Color"
              placeholder="Golden"
              defaultValue={pet?.color || ''}
            />
            <Input
              id="microchip_id"
              name="microchip_id"
              label="Microchip ID"
              placeholder="123456789"
              defaultValue={pet?.microchip_id || ''}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_neutered"
              name="is_neutered"
              type="checkbox"
              value="true"
              defaultChecked={pet?.is_neutered || false}
              className="h-4 w-4 rounded border-[var(--input)] text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="is_neutered" className="text-sm font-medium text-[var(--foreground)]">
              Spayed / Neutered
            </label>
          </div>

          <Input
            id="photo_url"
            name="photo_url"
            label="Photo URL"
            placeholder="https://..."
            defaultValue={pet?.photo_url || ''}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="notes" className="text-sm font-medium text-[var(--foreground)]">Notes</label>
              <AutoSaveIndicator status={autoSaveStatus} text={autoSaveText} />
            </div>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about your pet..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {submitError && (
            <div
              ref={shakeRef}
              className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              style={{ animationDuration: '0.5s' }}
            >
              {submitError}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : pet ? 'Update Pet' : 'Add Pet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
