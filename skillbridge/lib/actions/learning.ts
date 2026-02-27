'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateLearningPlan } from './ai';
import type { LearningPlan, Course } from '@/types/database';

export async function getLearningPlans(): Promise<{ data?: (LearningPlan & { courses: Course[] })[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('learning_plans')
    .select('*, courses(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as (LearningPlan & { courses: Course[] })[] };
}

export async function createLearningPlan(careerMatchId: string, targetCareer: string): Promise<{ data?: LearningPlan; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: match } = await supabase
    .from('career_matches')
    .select('*')
    .eq('id', careerMatchId)
    .single();

  const { data: assessment } = await supabase
    .from('skill_assessments')
    .select('skills')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const aiResult = await generateLearningPlan(
    targetCareer,
    match?.skills_to_learn ?? [],
    assessment?.skills ?? []
  );

  if (aiResult.error || !aiResult.data) return { error: aiResult.error ?? 'AI error' };

  const planData = aiResult.data;

  const { data: plan, error: planErr } = await supabase
    .from('learning_plans')
    .insert({
      user_id: user.id,
      career_match_id: careerMatchId,
      title: planData.title,
      description: planData.description,
      target_career: targetCareer,
      estimated_weeks: planData.estimatedWeeks,
      progress: 0,
    })
    .select()
    .single();

  if (planErr || !plan) return { error: planErr?.message ?? 'Failed to create plan' };

  if (planData.courses && planData.courses.length > 0) {
    const courseRows = planData.courses.map((c, idx) => ({
      learning_plan_id: plan.id,
      title: c.title,
      provider: c.provider,
      url: c.url || null,
      duration_hours: c.durationHours,
      skill_category: c.skillCategory,
      difficulty: c.difficulty,
      is_free: c.isFree,
      is_completed: false,
      order_index: idx,
    }));

    await supabase.from('courses').insert(courseRows);
  }

  revalidatePath('/learning-plan');
  return { data: plan as LearningPlan };
}

export async function toggleCourseComplete(courseId: string, completed: boolean): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('courses')
    .update({ is_completed: completed })
    .eq('id', courseId);

  if (error) return { error: error.message };

  // Recalculate plan progress
  const { data: course } = await supabase
    .from('courses')
    .select('learning_plan_id')
    .eq('id', courseId)
    .single();

  if (course) {
    const { data: allCourses } = await supabase
      .from('courses')
      .select('is_completed')
      .eq('learning_plan_id', course.learning_plan_id);

    if (allCourses) {
      const total = allCourses.length;
      const done = allCourses.filter((c) => c.is_completed).length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      await supabase
        .from('learning_plans')
        .update({ progress, updated_at: new Date().toISOString() })
        .eq('id', course.learning_plan_id);
    }
  }

  revalidatePath('/learning-plan');
  return {};
}

export async function deleteLearningPlan(planId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  await supabase.from('courses').delete().eq('learning_plan_id', planId);
  const { error } = await supabase.from('learning_plans').delete().eq('id', planId).eq('user_id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/learning-plan');
  return {};
}
