'use client';

import Link from 'next/link';
import { cn, getGenreEmoji, formatWordCount, getStatusLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Story, StoryStatus, StoryGenre } from '@/types/database';

interface StoryCardProps {
  story: Story;
  className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
  const emoji = getGenreEmoji(story.genre);

  return (
    <Link href={`/stories/${story.id}`}>
      <div
        className={cn(
          'group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {story.cover_url ? (
            <img
              src={story.cover_url}
              alt={story.title}
              className="h-16 w-12 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-16 w-12 items-center justify-center rounded-md bg-brand-50 text-2xl">
              {emoji}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)] transition-colors group-hover:text-brand-600 truncate">
              {story.title}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)] line-clamp-2">
              {story.description || 'No description yet'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={story.status as StoryStatus}>{getStatusLabel(story.status)}</Badge>
          <Badge variant={story.genre as StoryGenre}>{story.genre}</Badge>
          <span className="text-xs text-[var(--muted-foreground)]">
            {formatWordCount(story.total_word_count)} words
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            {story.chapter_count} ch.
          </span>
        </div>
      </div>
    </Link>
  );
}
