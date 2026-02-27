'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { UserAchievement } from '@/types/database';

interface AchievementsProps {
  recentAchievements: UserAchievement[];
  totalUnlocked: number;
  totalAvailable: number;
}

export function Achievements({ recentAchievements, totalUnlocked, totalAvailable }: AchievementsProps) {
  const progressPercent = totalAvailable > 0 ? Math.round((totalUnlocked / totalAvailable) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-amber-500" />
            Achievements
          </CardTitle>
          <span className="text-xs text-[var(--muted-foreground)]">
            {totalUnlocked}/{totalAvailable} unlocked
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall progress */}
        <div className="mb-4">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">{progressPercent}% complete</p>
        </div>

        {/* Recent unlocks */}
        {recentAchievements.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
            Start writing to unlock achievements!
          </p>
        ) : (
          <div className="space-y-2.5">
            {recentAchievements.map((ua) => (
              <div
                key={ua.id}
                className="flex items-center gap-3 rounded-lg bg-amber-50/50 p-2.5 ring-1 ring-amber-100"
              >
                <span className="text-xl">{ua.achievement?.icon ?? '🏆'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {ua.achievement?.title ?? 'Achievement'}
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                    {ua.achievement?.description ?? ''}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-[var(--muted-foreground)]">
                  {formatRelativeTime(ua.unlocked_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
