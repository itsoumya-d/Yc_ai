import { StatCard } from '@/components/ui/stat-card';
import { formatWordCount } from '@/lib/utils';
import { BookOpen, FileText, Feather, TrendingUp } from 'lucide-react';

interface WritingStatsProps {
  storyCount: number;
  totalWordCount: number;
  totalChapters: number;
  weeklyWordCount?: number;
}

export function WritingStats({ storyCount, totalWordCount, totalChapters, weeklyWordCount }: WritingStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Stories"
        value={String(storyCount)}
        icon={<BookOpen className="h-4 w-4" />}
      />
      <StatCard
        title="Total Words"
        value={formatWordCount(totalWordCount)}
        icon={<FileText className="h-4 w-4" />}
      />
      <StatCard
        title="Chapters"
        value={String(totalChapters)}
        icon={<Feather className="h-4 w-4" />}
      />
      <StatCard
        title="This Week"
        value={weeklyWordCount != null ? formatWordCount(weeklyWordCount) : '--'}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
