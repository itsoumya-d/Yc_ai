'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Task, TaskStatus, TaskPriority } from '@/types/database';

export async function getTasks(status?: TaskStatus): Promise<{ data?: Task[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) return { data: [] };

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Task[] };
}

export async function createTask(params: {
  title: string;
  description?: string;
  controlId?: string;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
}): Promise<{ data?: Task; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) return { error: 'No organization found' };

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      organization_id: profile.organization_id,
      control_id: params.controlId ?? null,
      title: params.title,
      description: params.description ?? null,
      status: 'open' as TaskStatus,
      priority: params.priority ?? 'medium',
      assignee: params.assignee ?? null,
      due_date: params.dueDate ?? null,
      completed_at: null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/tasks');
  return { data: data as Task };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Partial<Task> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
  if (error) return { error: error.message };

  revalidatePath('/tasks');
  return {};
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'assignee' | 'due_date' | 'status'>>
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) return { error: error.message };
  revalidatePath('/tasks');
  return {};
}

export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) return { error: error.message };
  revalidatePath('/tasks');
  return {};
}
