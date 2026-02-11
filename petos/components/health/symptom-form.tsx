'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createSymptom } from '@/lib/actions/symptoms';
import type { Pet } from '@/types/database';

interface SymptomFormProps {
  pets: Pet[];
  onSuccess?: () => void;
}

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild - Minor discomfort' },
  { value: 'moderate', label: 'Moderate - Noticeable issue' },
  { value: 'severe', label: 'Severe - Significant concern' },
  { value: 'emergency', label: 'Emergency - Requires immediate attention' },
];

export function SymptomForm({ pets, onSuccess }: SymptomFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createSymptom(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Symptom submitted for analysis', variant: 'success' });
    setLoading(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pet_id" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Which pet?
        </label>
        <select
          id="pet_id"
          name="pet_id"
          required
          className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Select a pet</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
          ))}
        </select>
      </div>

      <Textarea
        id="description"
        name="description"
        label="Describe the symptoms"
        placeholder="My pet has been lethargic, not eating well, and has a slight cough for the past 2 days..."
        rows={4}
        required
      />

      <div>
        <label htmlFor="severity" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Severity
        </label>
        <select
          id="severity"
          name="severity"
          required
          className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {SEVERITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Input
        id="photo_url"
        name="photo_url"
        label="Photo URL (optional)"
        placeholder="https://..."
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Analyzing...' : 'Analyze Symptoms with AI'}
      </Button>
    </form>
  );
}
