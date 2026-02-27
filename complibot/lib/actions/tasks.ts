'use server';

import { createClient } from '@/lib/supabase/server';
import { taskSchema } from '@/lib/validations/schemas';
import type { ActionResult, Task } from '@/types/database';

export async function fetchTasks(
  orgId: string,
  options: { status?: string; priority?: string } = {}
): Promise<ActionResult<Task[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.priority) {
      query = query.eq('priority', options.priority);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Task[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createTask(
  orgId: string,
  formData: FormData
): Promise<ActionResult<Task>> {
  try {
    const raw = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      status: (formData.get('status') as string) || 'todo',
      priority: (formData.get('priority') as string) || 'medium',
      due_date: (formData.get('due_date') as string) || null,
      gap_id: (formData.get('gap_id') as string) || null,
      control_id: (formData.get('control_id') as string) || null,
    };

    const validated = taskSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Task };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: string
): Promise<ActionResult<Task>> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { status };

    if (status === 'done') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Task };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
