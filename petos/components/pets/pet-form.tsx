'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createPet, updatePet, uploadPetPhoto } from '@/lib/actions/pets';
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.photo_url || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

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

    // Upload photo if a file was selected
    if (photoFile && result.data) {
      const photoFormData = new FormData();
      photoFormData.set('photo', photoFile);
      const photoResult = await uploadPetPhoto(result.data.id, photoFormData);
      if (photoResult.error) {
        toast({ title: 'Photo upload failed', description: photoResult.error, variant: 'destructive' });
      }
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

          {/* Photo Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Pet Photo
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)] text-2xl">
                  📷
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  JPEG, PNG, WebP or GIF. Max 5MB.
                </p>
              </div>
            </div>
            {/* Hidden field to keep existing photo_url if no new file */}
            <input
              type="hidden"
              name="photo_url"
              value={photoFile ? '' : (pet?.photo_url || '')}
            />
          </div>

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
