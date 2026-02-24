'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { useToast } from '@/components/ui/toast';
import { createPet, updatePet } from '@/lib/actions/pets';
import type { Pet } from '@/types/database';

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = pet
      ? await updatePet(pet.id, formData)
      : await createPet(formData);

    if (result.error) {
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

          <PhotoUpload
            name="photo_url"
            defaultValue={pet?.photo_url}
            folder="pets"
            label="Pet Photo"
          />

          <Textarea
            id="notes"
            name="notes"
            label="Notes"
            placeholder="Any additional notes about your pet..."
            rows={3}
            defaultValue={pet?.notes || ''}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : pet ? 'Update Pet' : 'Add Pet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
