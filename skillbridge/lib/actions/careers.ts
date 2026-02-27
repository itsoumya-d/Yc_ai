'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, CareerPath } from '@/types/database';

export async function fetchCareerPaths(): Promise<ActionResult<CareerPath[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('career_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('transferability_score', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CareerPath[] };
}

export async function fetchCareerPath(id: string): Promise<ActionResult<CareerPath>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('career_paths')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CareerPath };
}

export async function saveCareerPath(id: string): Promise<ActionResult<CareerPath>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('career_paths')
    .update({ is_saved: true })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CareerPath };
}

export async function selectCareerPath(id: string): Promise<ActionResult<CareerPath>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Deselect all other paths first
  await supabase
    .from('career_paths')
    .update({ is_selected: false })
    .eq('user_id', user.id);

  const { data, error } = await supabase
    .from('career_paths')
    .update({ is_selected: true })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CareerPath };
}

export async function fetchSavedCareerPaths(): Promise<ActionResult<CareerPath[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('career_paths')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_saved', true)
    .order('transferability_score', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as CareerPath[] };
}
