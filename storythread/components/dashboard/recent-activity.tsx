'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime, formatWordCount, getStatusLabel, getGenreEmoji } from '@/lib/utils';
import type { Story, StoryStatus } from '@/types/database';

interface RecentActivityProps {
  stories: Story[];
}

export function RecentActivity({ stories }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getGenreEmoji(story.genre)}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{story.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatWordCount(story.total_word_count)} words &middot; {story.chapter_count} chapters
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={story.status as StoryStatus}>{getStatusLabel(story.status)}</Badge>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatRelativeTime(story.updated_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
