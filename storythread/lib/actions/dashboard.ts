'use server';

import { createClient } from '@/lib/supabase/server';
import { startOfWeek, endOfWeek, addDays, format, subDays } from 'date-fns';
import type { Story, DashboardStats, WritingGoal, WritingSession, UserAchievement, WritingStreak } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getDashboardData(): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Parallel fetch all data
  const [
    storiesResult,
    sessionsResult,
    streakResult,
    goalsResult,
    achievementsResult,
  ] = await Promise.all([
    supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', weekStart.toISOString())
      .lte('started_at', weekEnd.toISOString())
      .order('started_at', { ascending: true }),
    supabase
      .from('writing_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('writing_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('ends_at', { ascending: true }),
    supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })
      .limit(5),
  ]);

  // Stories data
  const allStories = (storiesResult.data ?? []) as Story[];
  const storyCount = allStories.length;
  const totalWordCount = allStories.reduce((sum, s) => sum + (s.total_word_count || 0), 0);
  const totalChapters = allStories.reduce((sum, s) => sum + (s.chapter_count || 0), 0);
  const recentStories = allStories.slice(0, 5);

  // Weekly sessions data
  const weeklySessions = (sessionsResult.data ?? []) as WritingSession[];
  const weeklyWordCount = weeklySessions.reduce((sum, s) => sum + s.words_written, 0);
  const weeklySessionCount = weeklySessions.length;
  const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  // Build daily word counts for the week (Mon–Sun)
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    dailyMap.set(format(day, 'yyyy-MM-dd'), 0);
  }
  for (const session of weeklySessions) {
    const dateKey = format(new Date(session.started_at), 'yyyy-MM-dd');
    dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + session.words_written);
  }
  const dailyWordCounts = Array.from(dailyMap.entries()).map(([date, words]) => ({ date, words }));

  // Streak data
  const streakData = streakResult.data as WritingStreak | null;
  const today = format(now, 'yyyy-MM-dd');
  const wroteToday = streakData?.last_writing_date === today;

  const streak = {
    current: streakData?.current_streak ?? 0,
    longest: streakData?.longest_streak ?? 0,
    wroteToday,
  };

  // Active goals
  const activeGoals = (goalsResult.data ?? []) as WritingGoal[];

  // Recent achievements
  const recentAchievements = (achievementsResult.data ?? []) as UserAchievement[];

  return {
    data: {
      storyCount,
      totalWordCount,
      totalChapters,
      recentStories,
      weeklyWordCount,
      weeklySessionCount,
      weeklyMinutes,
      streak,
      activeGoals,
      recentAchievements,
      dailyWordCounts,
    },
  };
}
