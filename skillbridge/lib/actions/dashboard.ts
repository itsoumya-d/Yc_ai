'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile } from '@/types/database';

export interface DashboardStats {
  totalSkills: number;
  careerPathsExplored: number;
  coursesCompleted: number;
  jobMatchesFound: number;
  assessmentStatus: string;
  selectedCareerPath: string | null;
  learningProgress: number;
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Run all queries in parallel
  const [
    skillsResult,
    careersResult,
    progressResult,
    jobMatchesResult,
    profileResult,
    selectedPathResult,
    learningResult,
  ] = await Promise.all([
    supabase.from('skills').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('career_paths').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('course_progress').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('job_matches').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('profiles').select('assessment_status').eq('user_id', user.id).single(),
    supabase.from('career_paths').select('title').eq('user_id', user.id).eq('is_selected', true).maybeSingle(),
    supabase.from('learning_plans').select('overall_progress').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
  ]);

  return {
    success: true,
    data: {
      totalSkills: skillsResult.count ?? 0,
      careerPathsExplored: careersResult.count ?? 0,
      coursesCompleted: progressResult.count ?? 0,
      jobMatchesFound: jobMatchesResult.count ?? 0,
      assessmentStatus: (profileResult.data as Profile | null)?.assessment_status ?? 'not_started',
      selectedCareerPath: selectedPathResult.data?.title ?? null,
      learningProgress: learningResult.data?.overall_progress ?? 0,
    },
  };
}

export async function fetchProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Profile };
}

export async function updateProfile(updates: Partial<Profile>): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Profile };
}
