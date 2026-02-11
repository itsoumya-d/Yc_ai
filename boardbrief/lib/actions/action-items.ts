'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionItem } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getActionItems(): Promise<ActionResult<ActionItem[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('action_items').select('*').eq('user_id', user.id).order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { data: data as ActionItem[] };
}

export async function createActionItem(formData: FormData): Promise<ActionResult<ActionItem>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('action_items').insert({
    user_id: user.id,
    meeting_id: formData.get('meeting_id') as string || null,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    status: 'open',
    priority: formData.get('priority') as string || 'medium',
    assignee_name: formData.get('assignee_name') as string || null,
    due_date: formData.get('due_date') as string || null,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/action-items');
  revalidatePath('/dashboard');
  return { data: data as ActionItem };
}

export async function updateActionItem(id: string, formData: FormData): Promise<ActionResult<ActionItem>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const status = formData.get('status') as string || 'open';
  const { data, error } = await supabase.from('action_items').update({
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    status,
    priority: formData.get('priority') as string || 'medium',
    assignee_name: formData.get('assignee_name') as string || null,
    due_date: formData.get('due_date') as string || null,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/action-items');
  revalidatePath('/dashboard');
  return { data: data as ActionItem };
}

export async function deleteActionItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('action_items').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/action-items');
  revalidatePath('/dashboard');
  return {};
}
