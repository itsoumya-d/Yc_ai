'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createExpense } from '@/lib/actions/expenses';
import type { Pet } from '@/types/database';

interface ExpenseFormProps {
  pets: Pet[];
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'vet', label: 'Vet' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'medication', label: 'Medication' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

export function ExpenseForm({ pets, onSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createExpense(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Expense added', variant: 'success' });
    setLoading(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pet_id" className="mb-1 block text-sm font-medium text-[var(--foreground)]">Pet</label>
          <select
            id="pet_id" name="pet_id"
            className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-[var(--foreground)]">Category</label>
          <select
            id="category" name="category" required
            className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="amount" name="amount" label="Amount ($)" type="number" step="0.01" placeholder="49.99" required />
        <Input id="date" name="date" label="Date" type="date" required />
      </div>

      <Input id="description" name="description" label="Description" placeholder="Monthly food supply" />

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
