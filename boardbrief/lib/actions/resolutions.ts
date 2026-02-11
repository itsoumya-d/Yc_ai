'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Resolution } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getResolutions(): Promise<ActionResult<Resolution[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('resolutions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { data: data as Resolution[] };
}

export async function getResolution(id: string): Promise<ActionResult<Resolution>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('resolutions').select('*').eq('id', id).eq('user_id', user.id).single();
  if (error) return { error: error.message };
  return { data: data as Resolution };
}

export async function createResolution(formData: FormData): Promise<ActionResult<Resolution>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('resolutions').insert({
    user_id: user.id,
    meeting_id: formData.get('meeting_id') as string || null,
    title: formData.get('title') as string,
    body: formData.get('body') as string || null,
    status: 'draft',
    votes_for: 0,
    votes_against: 0,
    votes_abstain: 0,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/resolutions');
  revalidatePath('/dashboard');
  return { data: data as Resolution };
}

export async function updateResolution(id: string, formData: FormData): Promise<ActionResult<Resolution>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('resolutions').update({
    title: formData.get('title') as string,
    body: formData.get('body') as string || null,
    status: formData.get('status') as string || 'draft',
    votes_for: parseInt(formData.get('votes_for') as string) || 0,
    votes_against: parseInt(formData.get('votes_against') as string) || 0,
    votes_abstain: parseInt(formData.get('votes_abstain') as string) || 0,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/resolutions');
  revalidatePath(`/resolutions/${id}`);
  return { data: data as Resolution };
}

export async function deleteResolution(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('resolutions').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/resolutions');
  revalidatePath('/dashboard');
  return {};
}
