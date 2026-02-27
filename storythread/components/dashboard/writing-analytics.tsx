'use client';

import { formatWordCount } from '@/lib/utils';
import type { Story } from '@/types/database';
import { BookOpen, FileText, Feather, TrendingUp, BarChart2, Target } from 'lucide-react';

interface WritingAnalyticsDashboardProps {
  storyCount: number;
  totalWordCount: number;
  totalChapters: number;
  weeklyWordCount: number;
  dailyCounts: { date: string; words: number }[];
  recentStories: Story[];
}

export function WritingAnalyticsDashboard({
  storyCount,
  totalWordCount,
  totalChapters,
  weeklyWordCount,
  dailyCounts,
  recentStories,
}: WritingAnalyticsDashboardProps) {
  const maxWords = Math.max(...dailyCounts.map((d) => d.words), 1);
  const avgWordsPerDay = dailyCounts.length > 0
    ? Math.round(dailyCounts.reduce((sum, d) => sum + d.words, 0) / dailyCounts.length)
    : 0;
  const activeDays = dailyCounts.filter((d) => d.words > 0).length;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Stories', value: String(storyCount), icon: BookOpen, color: 'text-brand-600' },
          { label: 'Total Words', value: formatWordCount(totalWordCount), icon: FileText, color: 'text-purple-600' },
          { label: 'Chapters', value: String(totalChapters), icon: Feather, color: 'text-blue-600' },
          { label: 'This Week', value: formatWordCount(weeklyWordCount), icon: TrendingUp, color: 'text-green-600' },
          { label: 'Daily Avg', value: formatWordCount(avgWordsPerDay), icon: BarChart2, color: 'text-amber-600' },
          { label: 'Active Days', value: `${activeDays}/30`, icon: Target, color: 'text-rose-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-current/10 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Daily Word Count Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Daily Activity (Last 30 Days)</h2>
        {dailyCounts.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No data yet. Start writing to see your progress!</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {dailyCounts.map((d) => {
              const height = maxWords > 0 ? Math.max(2, (d.words / maxWords) * 100) : 2;
              const hasActivity = d.words > 0;
              return (
                <div key={d.date} className="group relative flex-1 flex flex-col items-center justify-end">
                  <div
                    className={`w-full rounded-t transition-all ${hasActivity ? 'bg-brand-500 hover:bg-brand-600' : 'bg-[var(--muted)]'}`}
                    style={{ height: `${height}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                      <p className="font-medium">{d.words.toLocaleString()} words</p>
                      <p className="text-gray-400">{new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Story Breakdown */}
      {recentStories.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Story Word Counts</h2>
          <div className="space-y-3">
            {recentStories.map((story) => {
              const maxWc = Math.max(...recentStories.map((s) => s.total_word_count), 1);
              const pct = Math.max(2, (story.total_word_count / maxWc) * 100);
              return (
                <div key={story.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--foreground)] truncate max-w-[60%]">{story.title}</span>
                    <span className="text-[var(--muted-foreground)]">{formatWordCount(story.total_word_count)} words</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-2 rounded-full bg-brand-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Writing Tips based on stats */}
      <div className="rounded-xl border border-[var(--border)] bg-gradient-to-r from-brand-50 to-purple-50 p-6">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Your Writing Insights</h2>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          {weeklyWordCount > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>You've written <strong className="text-[var(--foreground)]">{weeklyWordCount.toLocaleString()} words</strong> this week. Keep it up!</span>
            </li>
          )}
          {weeklyWordCount === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">→</span>
              <span>No writing this week. Even 100 words a day adds up to 36,500 words a year!</span>
            </li>
          )}
          {avgWordsPerDay > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Your 30-day average is <strong className="text-[var(--foreground)]">{avgWordsPerDay.toLocaleString()} words/day</strong>.</span>
            </li>
          )}
          {storyCount > 1 && (
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>You have <strong className="text-[var(--foreground)]">{storyCount} stories</strong> in progress. Consider finishing one before starting new ones.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
