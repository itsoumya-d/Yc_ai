'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { createWorldElement } from '@/lib/actions/worlds';
import type { WorldElementType } from '@/types/database';

const TYPES: { value: WorldElementType; label: string }[] = [
  { value: 'location', label: 'Location' },
  { value: 'lore', label: 'Lore' },
  { value: 'rule', label: 'Rule' },
  { value: 'event', label: 'Event' },
  { value: 'item', label: 'Item' },
  { value: 'faction', label: 'Faction' },
];

interface WorldElementFormProps {
  storyId: string;
  onSuccess?: () => void;
}

export function WorldElementForm({ storyId, onSuccess }: WorldElementFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createWorldElement(storyId, formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Element created' });
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="name" name="name" label="Name" placeholder="Element name" required />
      <div className="space-y-1.5">
        <label htmlFor="type" className="text-sm font-medium text-[var(--foreground)]">Type</label>
        <select
          id="type"
          name="type"
          defaultValue="location"
          className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <Textarea
        id="description"
        name="description"
        label="Description"
        placeholder="Brief description..."
        rows={2}
      />
      <Textarea
        id="details"
        name="details"
        label="Details"
        placeholder="Extended details, history, significance..."
        rows={4}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Element'}
      </Button>
    </form>
  );
}
