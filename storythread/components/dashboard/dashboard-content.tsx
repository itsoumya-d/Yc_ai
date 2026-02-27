'use client';

import { useState } from 'react';
import { WritingStreak } from '@/components/dashboard/writing-streak';
import { WritingGoals } from '@/components/dashboard/writing-goals';
import { WeeklyProgress } from '@/components/dashboard/weekly-progress';
import { Achievements } from '@/components/dashboard/achievements';
import { LogSession } from '@/components/dashboard/log-session';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import type { DashboardStats } from '@/types/database';

interface DashboardContentProps {
  stats: DashboardStats;
  totalAchievements: number;
}

export function DashboardContent({ stats, totalAchievements }: DashboardContentProps) {
  const [showLogSession, setShowLogSession] = useState(false);

  return (
    <div className="space-y-6">
      {/* Quick action: log session */}
      {showLogSession ? (
        <LogSession onClose={() => setShowLogSession(false)} />
      ) : (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogSession(true)}
          >
            <PenLine className="mr-2 h-3.5 w-3.5" />
            Log Writing Session
          </Button>
        </div>
      )}

      {/* Streak + Weekly Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WritingStreak
          currentStreak={stats.streak.current}
          longestStreak={stats.streak.longest}
          wroteToday={stats.streak.wroteToday}
        />
        <WeeklyProgress
          wordCount={stats.weeklyWordCount}
          sessionCount={stats.weeklySessionCount}
          totalMinutes={stats.weeklyMinutes}
          dailyWordCounts={stats.dailyWordCounts}
        />
      </div>

      {/* Goals + Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WritingGoals goals={stats.activeGoals} />
        <Achievements
          recentAchievements={stats.recentAchievements}
          totalUnlocked={stats.recentAchievements.length}
          totalAvailable={totalAchievements}
        />
      </div>
    </div>
  );
}
