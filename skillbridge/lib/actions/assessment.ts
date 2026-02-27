'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SkillAssessment, SkillEntry } from '@/types/database';

export async function saveAssessment(data: {
  skills: SkillEntry[];
  experienceLevel: string;
  education: string;
  rawInput?: string;
  skillScore: number;
}): Promise<{ data?: SkillAssessment; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('skill_assessments')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from('skill_assessments')
      .update({
        skills: data.skills,
        experience_level: data.experienceLevel,
        education: data.education,
        raw_input: data.rawInput ?? null,
        skill_score: data.skillScore,
        completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('skill_assessments')
      .insert({
        user_id: user.id,
        skills: data.skills,
        experience_level: data.experienceLevel,
        education: data.education,
        raw_input: data.rawInput ?? null,
        skill_score: data.skillScore,
        completed: true,
      })
      .select()
      .single();
  }

  if (result.error) return { error: result.error.message };
  revalidatePath('/dashboard');
  revalidatePath('/assessment');
  return { data: result.data as SkillAssessment };
}

export async function getAssessment(): Promise<{ data?: SkillAssessment | null; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('skill_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') return { error: error.message };
  return { data: data as SkillAssessment | null };
}

export async function getSkillScore(): Promise<{ data?: number; error?: string }> {
  const { data, error } = await getAssessment();
  if (error) return { error };
  return { data: data?.skill_score ?? 0 };
}
