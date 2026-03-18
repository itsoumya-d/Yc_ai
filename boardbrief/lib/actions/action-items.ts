'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionItem } from '@/types/database';
import { actionItemSchema } from '@/lib/validations';

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

  const parsed = actionItemSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    priority: formData.get('priority') || 'medium',
    assigneeName: formData.get('assignee_name') || undefined,
    dueDate: formData.get('due_date') || undefined,
    meetingId: formData.get('meeting_id') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('action_items').insert({
    user_id: user.id,
    meeting_id: parsed.data.meetingId || null,
    title: parsed.data.title,
    description: parsed.data.description || null,
    status: 'open',
    priority: parsed.data.priority,
    assignee_name: parsed.data.assigneeName || null,
    due_date: parsed.data.dueDate || null,
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

  const parsed = actionItemSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    priority: formData.get('priority') || 'medium',
    assigneeName: formData.get('assignee_name') || undefined,
    dueDate: formData.get('due_date') || undefined,
    meetingId: formData.get('meeting_id') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const status = formData.get('status') as string || 'open';
  const { data, error } = await supabase.from('action_items').update({
    title: parsed.data.title,
    description: parsed.data.description || null,
    status,
    priority: parsed.data.priority,
    assignee_name: parsed.data.assigneeName || null,
    due_date: parsed.data.dueDate || null,
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
