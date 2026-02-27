'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WritingStreakProps {
  currentStreak: number;
  longestStreak: number;
  wroteToday: boolean;
}

export function WritingStreak({ currentStreak, longestStreak, wroteToday }: WritingStreakProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-orange-500" />
          Writing Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Current streak */}
          <div className="text-center">
            <div className={cn(
              'text-4xl font-bold tabular-nums',
              currentStreak > 0 ? 'text-orange-500' : 'text-[var(--muted-foreground)]'
            )}>
              {currentStreak}
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              day{currentStreak !== 1 ? 's' : ''} current
            </p>
          </div>

          {/* Separator */}
          <div className="h-12 w-px bg-[var(--border)]" />

          {/* Longest streak */}
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold tabular-nums text-[var(--foreground)]">
                {longestStreak}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">best streak</p>
          </div>

          {/* Today status */}
          <div className="ml-auto text-center">
            {wroteToday ? (
              <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Wrote today
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                <Circle className="h-3.5 w-3.5" />
                Not yet today
              </div>
            )}
          </div>
        </div>

        {/* Motivational message */}
        {currentStreak > 0 && !wroteToday && (
          <p className="mt-3 text-xs text-amber-600">
            Write today to keep your {currentStreak}-day streak alive!
          </p>
        )}
        {currentStreak === 0 && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Start writing to begin a new streak!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
