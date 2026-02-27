import { getDashboardData } from '@/lib/actions/dashboard';
import { getWeeklyWordCount, getDailyWordCounts } from '@/lib/actions/social';
import { WritingAnalyticsDashboard } from '@/components/dashboard/writing-analytics';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Writing Analytics | StoryThread' };

export default async function AnalyticsPage() {
  const [dashData, weeklyWords, dailyCounts] = await Promise.all([
    getDashboardData(),
    getWeeklyWordCount(),
    getDailyWordCounts(30),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Writing Analytics</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Track your writing progress and habits.</p>
      </div>
      <WritingAnalyticsDashboard
        storyCount={dashData.data?.storyCount ?? 0}
        totalWordCount={dashData.data?.totalWordCount ?? 0}
        totalChapters={dashData.data?.totalChapters ?? 0}
        weeklyWordCount={weeklyWords.data ?? 0}
        dailyCounts={dailyCounts.data ?? []}
        recentStories={dashData.data?.recentStories ?? []}
      />
    </div>
  );
}
