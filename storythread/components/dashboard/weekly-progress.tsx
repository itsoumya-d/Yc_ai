'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, Pencil } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { formatWordCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WeeklyProgressProps {
  wordCount: number;
  sessionCount: number;
  totalMinutes: number;
  dailyWordCounts: { date: string; words: number }[];
}

export function WeeklyProgress({ wordCount, sessionCount, totalMinutes, dailyWordCounts }: WeeklyProgressProps) {
  const maxWords = Math.max(...dailyWordCounts.map((d) => d.words), 1);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const avgWords = dailyWordCounts.length > 0
    ? Math.round(wordCount / dailyWordCounts.filter((d) => d.words > 0).length || 0)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary stats row */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-[var(--muted)]/50 p-2.5 text-center">
            <p className="text-lg font-bold text-[var(--foreground)]">{formatWordCount(wordCount)}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">words written</p>
          </div>
          <div className="rounded-lg bg-[var(--muted)]/50 p-2.5 text-center">
            <p className="text-lg font-bold text-[var(--foreground)]">{sessionCount}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">sessions</p>
          </div>
          <div className="rounded-lg bg-[var(--muted)]/50 p-2.5 text-center">
            <p className="text-lg font-bold text-[var(--foreground)]">
              {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">time spent</p>
          </div>
        </div>

        {/* Daily bar chart */}
        <div className="flex items-end gap-1.5" style={{ height: '120px' }}>
          {dailyWordCounts.map((day, i) => {
            const height = day.words > 0 ? Math.max((day.words / maxWords) * 100, 4) : 0;
            const todayHighlight = isToday(parseISO(day.date));

            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                {/* Word count label on top */}
                {day.words > 0 && (
                  <span className="text-[9px] tabular-nums text-[var(--muted-foreground)]">
                    {formatWordCount(day.words)}
                  </span>
                )}
                {/* Bar */}
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      'w-full max-w-[32px] rounded-t-md transition-all duration-300',
                      todayHighlight
                        ? day.words > 0 ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]/20 border border-dashed border-[var(--primary)]'
                        : day.words > 0 ? 'bg-[var(--primary)]/60' : 'bg-[var(--muted)]'
                    )}
                    style={{ height: day.words > 0 ? `${height}%` : '4px' }}
                  />
                </div>
                {/* Day label */}
                <span className={cn(
                  'text-[10px] font-medium',
                  todayHighlight ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                )}>
                  {dayLabels[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Average line */}
        {wordCount > 0 && (
          <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
            Average: {formatWordCount(avgWords)} words/day
          </p>
        )}
      </CardContent>
    </Card>
  );
}
