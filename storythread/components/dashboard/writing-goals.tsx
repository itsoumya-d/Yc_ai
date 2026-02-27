'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Flame, Target, Award, TrendingUp, Check, Edit2 } from 'lucide-react';

interface WritingGoalsProps {
  wordsToday: number;
  wordsThisWeek: number;
  wordsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  totalWordsAllTime: number;
}

const ACHIEVEMENTS = [
  { id: 'first_words', label: 'First Words', desc: '100 words written', threshold: 100, icon: '✍️' },
  { id: 'daily_goal', label: 'Goal Crusher', desc: 'Hit daily goal', threshold: 1, icon: '🎯' },
  { id: 'streak_3', label: 'On a Roll', desc: '3-day streak', threshold: 3, icon: '🔥' },
  { id: 'streak_7', label: 'Week Warrior', desc: '7-day streak', threshold: 7, icon: '⚡' },
  { id: 'streak_30', label: 'Month Master', desc: '30-day streak', threshold: 30, icon: '🏆' },
  { id: 'words_1k', label: '1K Writer', desc: '1,000 words total', threshold: 1000, icon: '📝' },
  { id: 'words_10k', label: '10K Author', desc: '10,000 words total', threshold: 10000, icon: '📚' },
  { id: 'words_50k', label: 'NaNoWriMo', desc: '50,000 words total', threshold: 50000, icon: '🏅' },
];

const QUOTES = [
  "Every word you write is a step closer to your story.",
  "The first draft is just you telling yourself the story.",
  "You don't start out writing good stuff. You start out writing crap.",
  "A writer who waits for ideal conditions will die without putting a word on paper.",
  "Write every day, line by line, page by page, hour by hour.",
];

function ProgressBar({ value, max, color = 'bg-brand-600' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className={cn('h-full rounded-full transition-all duration-700', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function WritingGoals({
  wordsToday,
  wordsThisWeek,
  wordsThisMonth,
  currentStreak,
  longestStreak,
  dailyGoal,
  totalWordsAllTime,
}: WritingGoalsProps) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));
  const quoteIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;

  const todayPct = Math.min(100, Math.round((wordsToday / Math.max(1, dailyGoal)) * 100));
  const goalReached = wordsToday >= dailyGoal;

  const earnedAchievements = new Set(
    ACHIEVEMENTS
      .filter((a) => {
        if (a.id.startsWith('streak_')) return currentStreak >= a.threshold;
        if (a.id.startsWith('words_')) return totalWordsAllTime >= a.threshold;
        if (a.id === 'first_words') return totalWordsAllTime >= 100;
        if (a.id === 'daily_goal') return goalReached;
        return false;
      })
      .map((a) => a.id),
  );

  return (
    <div className="space-y-6">
      {/* Motivational quote */}
      <div className="rounded-xl border border-brand-200/30 bg-brand-50/5 px-4 py-3">
        <p className="text-sm italic text-[var(--muted-foreground)]">"{QUOTES[quoteIndex]}"</p>
      </div>

      {/* Daily goal progress */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium">Today's Goal</span>
          </div>
          <div className="flex items-center gap-2">
            {goalReached && <Check className="h-4 w-4 text-green-500" />}
            {editingGoal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-16 rounded border border-[var(--input)] bg-[var(--card)] px-2 py-0.5 text-xs"
                  min={100}
                  max={10000}
                />
                <button
                  onClick={() => setEditingGoal(false)}
                  className="rounded bg-brand-600 px-2 py-0.5 text-xs text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingGoal(true)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-1.5 flex justify-between text-xs">
          <span className={cn('font-semibold tabular-nums', goalReached ? 'text-green-500' : 'text-[var(--foreground)]')}>
            {wordsToday.toLocaleString()} words
          </span>
          <span className="text-[var(--muted-foreground)]">/ {Number(goalInput || dailyGoal).toLocaleString()} goal</span>
        </div>
        <ProgressBar value={wordsToday} max={Number(goalInput || dailyGoal)} color={goalReached ? 'bg-green-500' : 'bg-brand-600'} />
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
          {goalReached
            ? `🎉 Goal complete! ${(wordsToday - dailyGoal).toLocaleString()} extra words`
            : `${Math.max(0, dailyGoal - wordsToday).toLocaleString()} words to go · ${todayPct}%`}
        </p>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className={cn('h-5 w-5', currentStreak > 0 ? 'text-orange-500' : 'text-[var(--muted-foreground)]')} />
            <span className="text-xs text-[var(--muted-foreground)]">Current Streak</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{currentStreak}</div>
          <div className="text-xs text-[var(--muted-foreground)]">days</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            <span className="text-xs text-[var(--muted-foreground)]">Best Streak</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{longestStreak}</div>
          <div className="text-xs text-[var(--muted-foreground)]">days</div>
        </div>
      </div>

      {/* Word count stats */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-600" /> Word Counts
        </h3>
        {[
          { label: 'This Week', value: wordsThisWeek, color: 'bg-blue-500' },
          { label: 'This Month', value: wordsThisMonth, color: 'bg-purple-500' },
          { label: 'All Time', value: totalWordsAllTime, color: 'bg-brand-600' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">{label}</span>
              <span className="font-medium tabular-nums">{value.toLocaleString()}</span>
            </div>
            <ProgressBar value={value} max={totalWordsAllTime || 1} color={color} />
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-600" /> Achievements
          <span className="ml-auto rounded-full bg-brand-600/10 px-2 py-0.5 text-xs text-brand-600">
            {earnedAchievements.size}/{ACHIEVEMENTS.length}
          </span>
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const earned = earnedAchievements.has(a.id);
            return (
              <div
                key={a.id}
                title={a.desc}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-all',
                  earned
                    ? 'bg-brand-50/10 border border-brand-600/30'
                    : 'bg-[var(--muted)] opacity-40 grayscale',
                )}
              >
                <span className="text-2xl leading-none">{a.icon}</span>
                <span className="text-[10px] font-medium leading-tight">{a.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
