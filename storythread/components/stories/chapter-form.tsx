'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createChapter } from '@/lib/actions/chapters';

interface ChapterFormProps {
  storyId: string;
}

export function ChapterForm({ storyId }: ChapterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createChapter(storyId, formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Chapter created' });
    if (result.data) {
      router.push(`/stories/${storyId}/chapters/${result.data.id}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Chapter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="Chapter Title"
            placeholder="Chapter 1: The Beginning"
            required
          />
          <Textarea
            id="notes"
            name="notes"
            label="Notes (optional)"
            placeholder="Brief notes about what happens in this chapter..."
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Start Writing'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
