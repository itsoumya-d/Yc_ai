'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createStory, updateStory } from '@/lib/actions/stories';
import type { Story, StoryGenre, StoryStatus } from '@/types/database';

const GENRES: { value: StoryGenre; label: string }[] = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'sci_fi', label: 'Science Fiction' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'horror', label: 'Horror' },
  { value: 'literary', label: 'Literary Fiction' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'historical', label: 'Historical Fiction' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'other', label: 'Other' },
];

const STATUSES: { value: StoryStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

interface StoryFormProps {
  story?: Story;
}

export function StoryForm({ story }: StoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = story
      ? await updateStory(story.id, formData)
      : await createStory(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: story ? 'Story updated' : 'Story created' });
    if (result.data) {
      router.push(`/stories/${result.data.id}`);
    } else {
      router.push('/stories');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{story ? 'Edit Story' : 'New Story'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="Title"
            placeholder="The name of your story"
            defaultValue={story?.title}
            required
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            placeholder="A brief synopsis of your story..."
            defaultValue={story?.description ?? ''}
            rows={3}
          />
          <div className="space-y-1.5">
            <label htmlFor="genre" className="text-sm font-medium text-[var(--foreground)]">Genre</label>
            <select
              id="genre"
              name="genre"
              defaultValue={story?.genre ?? 'fantasy'}
              className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {GENRES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          {story && (
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium text-[var(--foreground)]">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={story.status}
                className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
          <Input
            id="cover_url"
            name="cover_url"
            label="Cover Image URL"
            placeholder="https://..."
            defaultValue={story?.cover_url ?? ''}
          />
          <Input
            id="tags"
            name="tags"
            label="Tags"
            placeholder="magic, dragons, adventure (comma-separated)"
            defaultValue={story?.tags?.join(', ') ?? ''}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : story ? 'Save Changes' : 'Create Story'}
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
