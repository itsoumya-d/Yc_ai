'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatWordCount } from '@/lib/utils';
import { Plus, FileText } from 'lucide-react';
import type { Chapter, ChapterStatus } from '@/types/database';

interface ChapterListProps {
  chapters: Chapter[];
  storyId: string;
}

export function ChapterList({ chapters, storyId }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No chapters yet"
        description="Start writing by adding your first chapter."
        action={
          <Link href={`/stories/${storyId}/chapters/new`}>
            <Button><Plus className="mr-1.5 h-4 w-4" /> Add Chapter</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link href={`/stories/${storyId}/chapters/new`}>
          <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Chapter</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {chapters.map((chapter, index) => (
          <Link
            key={chapter.id}
            href={`/stories/${storyId}/chapters/${chapter.id}`}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--accent)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-medium text-[var(--muted-foreground)]">
                {index + 1}
              </span>
              <div>
                <h4 className="text-sm font-medium text-[var(--foreground)]">{chapter.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatWordCount(chapter.word_count)} words
                </p>
              </div>
            </div>
            <Badge variant={chapter.status as ChapterStatus}>{chapter.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
