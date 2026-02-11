'use client';

import { StoryCard } from './story-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { Story } from '@/types/database';

interface StoryListProps {
  stories: Story[];
}

export function StoryList({ stories }: StoryListProps) {
  if (stories.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="No stories yet"
        description="Create your first story and start building your fictional world."
        action={
          <Link href="/stories/new">
            <Button>Create Story</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
