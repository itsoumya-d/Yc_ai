'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ContentBlock } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getContentBlocks(): Promise<ActionResult<ContentBlock[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('content_blocks').select('*').eq('user_id', user.id).order('block_type').order('title');
  if (error) return { error: error.message };
  return { data: data as ContentBlock[] };
}

export async function createContentBlock(formData: FormData): Promise<ActionResult<ContentBlock>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('content_blocks').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    block_type: formData.get('block_type') as string || 'case_study',
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/content-library');
  return { data: data as ContentBlock };
}

export async function updateContentBlock(id: string, formData: FormData): Promise<ActionResult<ContentBlock>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('content_blocks').update({
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    block_type: formData.get('block_type') as string,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/content-library');
  return { data: data as ContentBlock };
}

export async function deleteContentBlock(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('content_blocks').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/content-library');
  return {};
}
