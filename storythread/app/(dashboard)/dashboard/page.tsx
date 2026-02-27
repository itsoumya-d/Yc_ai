import { getDashboardData } from '@/lib/actions/dashboard';
import { WritingStats } from '@/components/dashboard/writing-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const result = await getDashboardData();
  const data = result.data;
  const hasStories = (data?.storyCount ?? 0) > 0;

  // Get total achievements count for progress display
  let totalAchievements = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from('achievements')
      .select('id', { count: 'exact', head: true });
    totalAchievements = count ?? 0;
  } catch {
    // Table may not exist yet — fine, show 0
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Your writing at a glance.</p>
        </div>
        <Link href="/stories/new">
          <Button>New Story</Button>
        </Link>
      </div>

      <WritingStats
        storyCount={data?.storyCount ?? 0}
        totalWordCount={data?.totalWordCount ?? 0}
        totalChapters={data?.totalChapters ?? 0}
        weeklyWordCount={data?.weeklyWordCount ?? 0}
      />

      {hasStories ? (
        <div className="mt-8 space-y-8">
          {/* Gamification section */}
          {data && (
            <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[var(--muted)]" />}>
              <DashboardContent stats={data} totalAchievements={totalAchievements} />
            </Suspense>
          )}

          {/* Recent activity */}
          <RecentActivity stories={data?.recentStories ?? []} />
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="Welcome to StoryThread!"
            description="Create your first story to start building characters, worlds, and chapters."
            action={
              <Link href="/stories/new">
                <Button>Create Your First Story</Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
