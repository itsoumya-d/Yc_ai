'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createContentBlock } from '@/lib/actions/content-blocks';
import type { ContentBlockType } from '@/types/database';

interface ContentBlockFormProps {
  onSuccess?: () => void;
}

const blockTypes: { value: ContentBlockType; label: string }[] = [
  { value: 'case_study', label: 'Case Study' },
  { value: 'team_bio', label: 'Team Bio' },
  { value: 'methodology', label: 'Methodology' },
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'about', label: 'About Us' },
  { value: 'faq', label: 'FAQ' },
];

export function ContentBlockForm({ onSuccess }: ContentBlockFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createContentBlock(formData);
    setLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Content block created' });
    e.currentTarget.reset();
    onSuccess?.();
  }

  return (
    <Card className="p-6">
      <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-4">New Content Block</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title *</label>
            <Input name="title" required placeholder="Block title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Type</label>
            <Select name="block_type" defaultValue="case_study">
              {blockTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Content *</label>
          <Textarea name="content" required rows={6} placeholder="Write your reusable content block..." />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Block'}</Button>
      </form>
    </Card>
  );
}
