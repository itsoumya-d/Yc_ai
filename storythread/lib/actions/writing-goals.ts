'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { addDays, addWeeks, addMonths, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, format, isToday, isYesterday, subDays } from 'date-fns';
import type { WritingGoal, WritingSession, GoalPeriod, WritingStreak, Achievement, UserAchievement } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

// ── Writing Goals ──────────────────────────────────────────

export async function createWritingGoal(
  targetWords: number,
  period: GoalPeriod
): Promise<ActionResult<WritingGoal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (targetWords < 1 || targetWords > 1000000) {
    return { error: 'Target must be between 1 and 1,000,000 words' };
  }

  const now = new Date();
  let startsAt: Date;
  let endsAt: Date;

  switch (period) {
    case 'daily':
      startsAt = startOfDay(now);
      endsAt = endOfDay(now);
      break;
    case 'weekly':
      startsAt = startOfWeek(now, { weekStartsOn: 1 });
      endsAt = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'monthly':
      startsAt = startOfMonth(now);
      endsAt = endOfMonth(now);
      break;
  }

  const { data, error } = await supabase
    .from('writing_goals')
    .insert({
      user_id: user.id,
      target_words: targetWords,
      period,
      started_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { data: data as WritingGoal };
}

export async function getActiveGoals(): Promise<ActionResult<WritingGoal[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('writing_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('ends_at', { ascending: true });

  if (error) return { error: error.message };
  return { data: (data ?? []) as WritingGoal[] };
}

export async function pauseGoal(goalId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('writing_goals')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return {};
}

export async function deleteGoal(goalId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('writing_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return {};
}

// ── Writing Sessions ───────────────────────────────────────

export async function recordWritingSession(params: {
  storyId?: string;
  chapterId?: string;
  wordsWritten: number;
  durationMinutes: number;
}): Promise<ActionResult<WritingSession>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const now = new Date();
  const startedAt = new Date(now.getTime() - params.durationMinutes * 60 * 1000);

  // Insert writing session
  const { data: session, error: sessionError } = await supabase
    .from('writing_sessions')
    .insert({
      user_id: user.id,
      story_id: params.storyId || null,
      chapter_id: params.chapterId || null,
      words_written: params.wordsWritten,
      duration_minutes: params.durationMinutes,
      started_at: startedAt.toISOString(),
      ended_at: now.toISOString(),
    })
    .select()
    .single();

  if (sessionError) return { error: sessionError.message };

  // Update active goals progress
  const { data: activeGoals } = await supabase
    .from('writing_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .lte('started_at', now.toISOString())
    .gte('ends_at', now.toISOString());

  if (activeGoals && activeGoals.length > 0) {
    for (const goal of activeGoals) {
      const newWords = goal.current_words + params.wordsWritten;
      const isCompleted = newWords >= goal.target_words;

      await supabase
        .from('writing_goals')
        .update({
          current_words: newWords,
          status: isCompleted ? 'completed' : 'active',
          completed_at: isCompleted ? now.toISOString() : null,
          updated_at: now.toISOString(),
        })
        .eq('id', goal.id);
    }
  }

  // Update streak
  await updateStreak(user.id);

  // Check achievements
  await checkAndUnlockAchievements(user.id);

  revalidatePath('/dashboard');
  return { data: session as WritingSession };
}

export async function getWeeklyStats(): Promise<ActionResult<{
  wordCount: number;
  sessionCount: number;
  totalMinutes: number;
  dailyBreakdown: { date: string; words: number }[];
}>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const { data: sessions, error } = await supabase
    .from('writing_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('started_at', weekStart.toISOString())
    .lte('started_at', weekEnd.toISOString())
    .order('started_at', { ascending: true });

  if (error) return { error: error.message };

  const allSessions = (sessions ?? []) as WritingSession[];

  const wordCount = allSessions.reduce((sum, s) => sum + s.words_written, 0);
  const sessionCount = allSessions.length;
  const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  // Build daily breakdown for the week (Mon–Sun)
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    dailyMap.set(format(day, 'yyyy-MM-dd'), 0);
  }
  for (const session of allSessions) {
    const dateKey = format(new Date(session.started_at), 'yyyy-MM-dd');
    dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + session.words_written);
  }

  const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, words]) => ({ date, words }));

  return { data: { wordCount, sessionCount, totalMinutes, dailyBreakdown } };
}

// ── Streaks ────────────────────────────────────────────────

async function updateStreak(userId: string): Promise<void> {
  const supabase = await createClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get or create streak record
  let { data: streak } = await supabase
    .from('writing_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!streak) {
    const { data: newStreak } = await supabase
      .from('writing_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_writing_date: today,
      })
      .select()
      .single();
    streak = newStreak;
    return;
  }

  const lastDate = streak.last_writing_date;

  if (lastDate === today) {
    // Already wrote today, no streak update needed
    return;
  }

  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (lastDate === yesterday) {
    // Consecutive day — increment streak
    const newStreak = streak.current_streak + 1;
    const longestStreak = Math.max(newStreak, streak.longest_streak);

    await supabase
      .from('writing_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_writing_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', streak.id);
  } else {
    // Streak broken — reset to 1
    await supabase
      .from('writing_streaks')
      .update({
        current_streak: 1,
        longest_streak: Math.max(1, streak.longest_streak),
        last_writing_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', streak.id);
  }
}

export async function getStreak(): Promise<ActionResult<WritingStreak>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('writing_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') return { error: error.message };

  if (!data) {
    return {
      data: {
        id: '',
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        last_writing_date: '',
        updated_at: new Date().toISOString(),
      },
    };
  }

  return { data: data as WritingStreak };
}

// ── Achievements ───────────────────────────────────────────

async function checkAndUnlockAchievements(userId: string): Promise<void> {
  const supabase = await createClient();

  // Fetch all achievements and user's already-unlocked ones
  const [{ data: allAchievements }, { data: userAchievements }, { data: streak }] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
    supabase.from('writing_streaks').select('*').eq('user_id', userId).single(),
  ]);

  if (!allAchievements) return;

  const unlockedIds = new Set((userAchievements ?? []).map((ua: { achievement_id: string }) => ua.achievement_id));

  // Get user stats
  const { data: stories } = await supabase
    .from('stories')
    .select('total_word_count, chapter_count')
    .eq('user_id', userId);

  const totalWords = (stories ?? []).reduce((sum: number, s: { total_word_count: number }) => sum + s.total_word_count, 0);
  const totalChapters = (stories ?? []).reduce((sum: number, s: { chapter_count: number }) => sum + s.chapter_count, 0);
  const storyCount = (stories ?? []).length;
  const currentStreak = streak?.current_streak ?? 0;

  // Count completed goals
  const { count: completedGoalsCount } = await supabase
    .from('writing_goals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  const toUnlock: string[] = [];

  for (const achievement of allAchievements as Achievement[]) {
    if (unlockedIds.has(achievement.id)) continue;

    let qualifies = false;

    switch (achievement.category) {
      case 'words':
        qualifies = totalWords >= achievement.threshold;
        break;
      case 'streak':
        qualifies = currentStreak >= achievement.threshold;
        break;
      case 'stories':
        qualifies = storyCount >= achievement.threshold;
        break;
      case 'chapters':
        qualifies = totalChapters >= achievement.threshold;
        break;
      case 'consistency':
        qualifies = (completedGoalsCount ?? 0) >= achievement.threshold;
        break;
    }

    if (qualifies) {
      toUnlock.push(achievement.id);
    }
  }

  if (toUnlock.length > 0) {
    await supabase
      .from('user_achievements')
      .insert(toUnlock.map((achievementId) => ({
        user_id: userId,
        achievement_id: achievementId,
      })));
  }
}

export async function getAchievements(): Promise<ActionResult<{
  all: Achievement[];
  unlocked: UserAchievement[];
}>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const [{ data: allAchievements, error: aErr }, { data: userAchievements, error: uaErr }] = await Promise.all([
    supabase.from('achievements').select('*').order('category').order('threshold'),
    supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false }),
  ]);

  if (aErr) return { error: aErr.message };
  if (uaErr) return { error: uaErr.message };

  return {
    data: {
      all: (allAchievements ?? []) as Achievement[],
      unlocked: (userAchievements ?? []) as UserAchievement[],
    },
  };
}
