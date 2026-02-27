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
  const [photoUrl, setPhotoUrl] = useState(pet?.photo_url ?? '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.photo_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (pet?.id) fd.append('pet_id', pet.id);

      const res = await fetch('/api/upload-photo', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? 'Upload failed');
      }

      setPhotoUrl(json.url);
      toast({ title: 'Photo uploaded', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      setPhotoPreview(pet?.photo_url ?? null);
    } finally {
      setPhotoUploading(false);
    }
  };

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

          {/* Photo Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Photo
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--border)]">
                  <img
                    src={photoPreview}
                    alt="Pet photo"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--muted)] text-2xl">
                  🐾
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <input type="hidden" name="photo_url" value={photoUrl} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                >
                  {photoUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => { setPhotoUrl(''); setPhotoPreview(null); }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                )}
                <p className="text-xs text-[var(--muted-foreground)]">
                  JPEG, PNG, WebP or GIF · Max 5MB
                </p>
              </div>
            </div>
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
