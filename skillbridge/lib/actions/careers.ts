'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateCareerMatches } from './ai';
import type { CareerMatch } from '@/types/database';

export async function getCareerMatches(): Promise<{ data?: CareerMatch[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('career_matches')
    .select('*')
    .eq('user_id', user.id)
    .order('match_score', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as CareerMatch[] };
}

export async function generateAndSaveCareerMatches(): Promise<{ data?: CareerMatch[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: assessment, error: assessErr } = await supabase
    .from('skill_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (assessErr || !assessment) return { error: 'Complete your assessment first' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_role, target_role')
    .eq('id', user.id)
    .single();

  const aiResult = await generateCareerMatches(
    assessment.skills,
    profile?.current_role ?? '',
    profile?.target_role ?? null
  );

  if (aiResult.error || !aiResult.data) return { error: aiResult.error ?? 'AI error' };

  // Delete old matches
  await supabase.from('career_matches').delete().eq('user_id', user.id);

  const rows = aiResult.data.map((c) => ({
    user_id: user.id,
    assessment_id: assessment.id,
    career_title: c.career_title,
    match_score: c.match_score,
    transferable_skills: c.transferable_skills,
    skills_to_learn: c.skills_to_learn,
    salary_range: c.salary_range,
    time_to_transition: c.time_to_transition,
    difficulty: c.difficulty,
    description: c.description,
  }));

  const { data, error } = await supabase.from('career_matches').insert(rows).select();
  if (error) return { error: error.message };

  revalidatePath('/careers');
  revalidatePath('/dashboard');
  return { data: data as CareerMatch[] };
}

export async function getTopCareerMatches(limit = 3): Promise<{ data?: CareerMatch[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('career_matches')
    .select('*')
    .eq('user_id', user.id)
    .order('match_score', { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { data: data as CareerMatch[] };
}
