'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Resolution } from '@/types/database';
import { resolutionSchema } from '@/lib/validations';

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

  const parsed = resolutionSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body') || undefined,
    meetingId: formData.get('meeting_id') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('resolutions').insert({
    user_id: user.id,
    meeting_id: parsed.data.meetingId || null,
    title: parsed.data.title,
    body: parsed.data.body || null,
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

  const parsed = resolutionSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body') || undefined,
    meetingId: formData.get('meeting_id') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('resolutions').update({
    title: parsed.data.title,
    body: parsed.data.body || null,
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
