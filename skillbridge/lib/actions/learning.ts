'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, LearningPlan, Course, CourseProgress } from '@/types/database';

export async function fetchLearningPlans(): Promise<ActionResult<LearningPlan[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as LearningPlan[] };
}

export async function fetchActiveLearningPlan(): Promise<ActionResult<LearningPlan | null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as LearningPlan | null };
}

export async function fetchCourses(): Promise<ActionResult<Course[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('rating', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Course[] };
}

export async function fetchCourseProgress(): Promise<ActionResult<CourseProgress[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CourseProgress[] };
}

export async function updateCourseProgress(
  courseId: string,
  progressPercent: number,
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped'
): Promise<ActionResult<CourseProgress>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const updateData: Record<string, unknown> = {
    progress_percent: progressPercent,
    status,
  };

  if (status === 'in_progress' && progressPercent > 0) {
    updateData.started_at = new Date().toISOString();
  }
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    updateData.progress_percent = 100;
  }

  const { data, error } = await supabase
    .from('course_progress')
    .upsert({
      user_id: user.id,
      course_id: courseId,
      ...updateData,
    }, { onConflict: 'user_id,course_id' })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CourseProgress };
}
