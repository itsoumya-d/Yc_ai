'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PUBLISH_GOALS = [
  { id: 'wattpad', label: 'Publish on Wattpad', emoji: '🌟' },
  { id: 'self', label: 'Self-publish on Amazon', emoji: '📦' },
  { id: 'traditional', label: 'Traditional publishing', emoji: '🏛️' },
  { id: 'private', label: 'Just for myself', emoji: '🔒' },
  { id: 'community', label: 'Share with friends', emoji: '👥' },
  { id: 'undecided', label: 'Undecided', emoji: '🤔' },
];

const WORD_TARGETS = ['100 words/day', '250 words/day', '500 words/day', '1,000 words/day', 'Weekly goal'];

export default function Step5Page() {
  const router = useRouter();
  const [publishGoal, setPublishGoal] = useState('');
  const [wordTarget, setWordTarget] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('');
  const [enableReminders, setEnableReminders] = useState(true);

  const canFinish = publishGoal && (wordTarget !== 'Weekly goal' ? wordTarget : weeklyTarget);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-block rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 mb-3">
          Step 5 of 5 — Almost there!
        </div>
        <h1 className="font-heading text-2xl font-bold">Your publishing goals</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Set a writing routine and long-term destination</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold">Where do you want to publish?</h2>
          <div className="grid grid-cols-2 gap-2">
            {PUBLISH_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setPublishGoal(goal.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm transition-all',
                  publishGoal === goal.id
                    ? 'border-brand-500 bg-brand-50 font-medium text-brand-700'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-brand-300'
                )}
              >
                <span>{goal.emoji}</span>
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Daily writing target</h2>
          <div className="grid grid-cols-2 gap-2">
            {WORD_TARGETS.map((t) => (
              <button
                key={t}
                onClick={() => setWordTarget(t)}
                className={cn(
                  'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all',
                  wordTarget === t
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-brand-300'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {wordTarget === 'Weekly goal' && (
            <input
              className="mt-3 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              placeholder="e.g. 3,000 words per week"
              value={weeklyTarget}
              onChange={e => setWeeklyTarget(e.target.value)}
            />
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div>
            <p className="text-sm font-semibold">Writing reminders</p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Daily nudges to keep your streak alive</p>
          </div>
          <button
            onClick={() => setEnableReminders(!enableReminders)}
            className={cn(
              'relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors focus:outline-none',
              enableReminders ? 'bg-brand-600' : 'bg-[var(--muted)]'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5',
                enableReminders ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <Button className="w-full" disabled={!canFinish} onClick={() => router.push('/onboarding/complete')}>
          Start Writing 🪶
        </Button>
      </div>
    </div>
  );
}
