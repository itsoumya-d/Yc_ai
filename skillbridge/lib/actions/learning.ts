'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  LearningPlan,
  LearningPlanCourse,
  Course,
  CourseProgress,
} from '@/types/database';

export async function getLearningPlans(): Promise<LearningPlan[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('learning_plans')
    .select('*, career_path:career_paths(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch learning plans: ${error.message}`);
  }

  return data ?? [];
}

export async function getLearningPlan(
  id: string
): Promise<
  | (LearningPlan & {
      courses: (LearningPlanCourse & {
        course: Course;
        progress: CourseProgress | null;
      })[];
    })
  | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch the learning plan with career path
  const { data: plan, error: planError } = await supabase
    .from('learning_plans')
    .select('*, career_path:career_paths(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (planError) {
    if (planError.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch learning plan: ${planError.message}`);
  }

  // Fetch courses in the plan with their course details
  const { data: planCourses, error: coursesError } = await supabase
    .from('learning_plan_courses')
    .select('*, course:courses(*)')
    .eq('learning_plan_id', id)
    .order('order_index', { ascending: true });

  if (coursesError) {
    throw new Error(
      `Failed to fetch plan courses: ${coursesError.message}`
    );
  }

  // Fetch course progress for all courses in this plan
  const courseIds = (planCourses ?? []).map((pc) => pc.course_id);

  let progressMap: Record<string, CourseProgress> = {};

  if (courseIds.length > 0) {
    const { data: progressData, error: progressError } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('course_id', courseIds);

    if (progressError) {
      throw new Error(
        `Failed to fetch course progress: ${progressError.message}`
      );
    }

    progressMap = (progressData ?? []).reduce(
      (acc, p) => {
        // Prefer progress entries that match this specific learning plan
        const key = p.course_id;
        if (!acc[key] || p.learning_plan_id === id) {
          acc[key] = p;
        }
        return acc;
      },
      {} as Record<string, CourseProgress>
    );
  }

  // Combine courses with their progress
  const coursesWithProgress = (planCourses ?? []).map((pc) => ({
    ...pc,
    progress: progressMap[pc.course_id] ?? null,
  }));

  return {
    ...plan,
    courses: coursesWithProgress,
  };
}

export async function createLearningPlan(data: {
  title: string;
  career_path_id?: string;
  description?: string;
  target_date?: string;
}): Promise<LearningPlan> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: plan, error } = await supabase
    .from('learning_plans')
    .insert({
      user_id: user.id,
      title: data.title,
      career_path_id: data.career_path_id ?? null,
      description: data.description ?? null,
      target_date: data.target_date ?? null,
      status: 'active' as const,
      progress: 0,
      ai_generated: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create learning plan: ${error.message}`);
  }

  revalidatePath('/learning');
  revalidatePath('/dashboard');

  return plan;
}

export async function updateLearningPlan(
  id: string,
  data: Partial<LearningPlan>
): Promise<LearningPlan> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const {
    id: _id,
    user_id,
    created_at,
    career_path,
    ...updateData
  } = data as Record<string, unknown>;

  const { data: updated, error } = await supabase
    .from('learning_plans')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update learning plan: ${error.message}`);
  }

  revalidatePath('/learning');
  revalidatePath(`/learning/${id}`);
  revalidatePath('/dashboard');

  return updated;
}

export async function deleteLearningPlan(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('learning_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete learning plan: ${error.message}`);
  }

  revalidatePath('/learning');
  revalidatePath('/dashboard');
}

export async function updateCourseProgress(
  courseId: string,
  learningPlanId: string | null,
  data: {
    status: CourseProgress['status'];
    progress: number;
  }
): Promise<CourseProgress> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const now = new Date().toISOString();

  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    course_id: courseId,
    learning_plan_id: learningPlanId,
    status: data.status,
    progress: data.progress,
  };

  if (data.status === 'in_progress' || data.status === 'completed') {
    upsertData.started_at = now;
  }

  if (data.status === 'completed') {
    upsertData.completed_at = now;
    upsertData.progress = 100;
  }

  const { data: progress, error } = await supabase
    .from('course_progress')
    .upsert(upsertData, {
      onConflict: 'user_id,course_id',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update course progress: ${error.message}`);
  }

  revalidatePath('/learning');
  if (learningPlanId) {
    revalidatePath(`/learning/${learningPlanId}`);
  }
  revalidatePath('/dashboard');

  return progress;
}

export async function getCourses(filters?: {
  difficulty?: string;
  provider?: string;
  search?: string;
}): Promise<Course[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  let query = supabase.from('courses').select('*');

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters?.provider) {
    query = query.eq('provider', filters.provider);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  query = query.order('title', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return data ?? [];
}
