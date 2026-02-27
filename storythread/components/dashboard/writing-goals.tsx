'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Plus, Pause, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createWritingGoal, pauseGoal, deleteGoal } from '@/lib/actions/writing-goals';
import type { WritingGoal, GoalPeriod } from '@/types/database';
import { formatWordCount } from '@/lib/utils';

interface WritingGoalsProps {
  goals: WritingGoal[];
}

const periodLabels: Record<GoalPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const periodColors: Record<GoalPeriod, string> = {
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-purple-100 text-purple-700',
  monthly: 'bg-emerald-100 text-emerald-700',
};

export function WritingGoals({ goals }: WritingGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [targetWords, setTargetWords] = useState('500');
  const [period, setPeriod] = useState<GoalPeriod>('daily');
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    const target = parseInt(targetWords, 10);
    if (isNaN(target) || target < 1) return;

    startTransition(async () => {
      await createWritingGoal(target, period);
      setShowForm(false);
      setTargetWords('500');
    });
  }

  function handlePause(goalId: string) {
    startTransition(async () => {
      await pauseGoal(goalId);
    });
  }

  function handleDelete(goalId: string) {
    startTransition(async () => {
      await deleteGoal(goalId);
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-[var(--primary)]" />
            Writing Goals
          </CardTitle>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
            >
              <Plus className="h-3 w-3" />
              New Goal
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* New goal form */}
        {showForm && (
          <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={targetWords}
                onChange={(e) => setTargetWords(e.target.value)}
                placeholder="Target words"
                min={1}
                className="w-28 text-sm"
              />
              <span className="text-xs text-[var(--muted-foreground)]">words</span>
              <div className="flex gap-1">
                {(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      period === p
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-1">
                <Button size="sm" onClick={handleCreate} disabled={isPending}>
                  Create
                </Button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active goals list */}
        {goals.length === 0 && !showForm ? (
          <p className="text-center text-sm text-[var(--muted-foreground)] py-4">
            No active goals. Set a writing target to stay motivated!
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = Math.min((goal.current_words / goal.target_words) * 100, 100);
              const isComplete = progress >= 100;

              return (
                <div key={goal.id} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', periodColors[goal.period as GoalPeriod])}>
                        {periodLabels[goal.period as GoalPeriod]}
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {formatWordCount(goal.current_words)} / {formatWordCount(goal.target_words)} words
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePause(goal.id)}
                        disabled={isPending}
                        className="rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
                        title="Pause goal"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        disabled={isPending}
                        className="rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isComplete ? 'bg-green-500' : 'bg-[var(--primary)]'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">
                    {Math.round(progress)}%
                    {isComplete && ' — Goal reached!'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
