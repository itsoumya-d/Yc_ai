'use server';

import { createClient } from '@/lib/supabase/server';
import { trainingSchema } from '@/lib/validations/schemas';
import type { ActionResult, EmployeeTraining } from '@/types/database';

export async function fetchTraining(
  orgId: string,
  statusFilter?: string
): Promise<ActionResult<EmployeeTraining[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('employee_training')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EmployeeTraining[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createTraining(
  orgId: string,
  formData: FormData
): Promise<ActionResult<EmployeeTraining>> {
  try {
    const raw = {
      employee_email: formData.get('employee_email') as string,
      employee_name: formData.get('employee_name') as string,
      module_name: formData.get('module_name') as string,
      module_type: (formData.get('module_type') as string) || 'security_awareness',
      passing_score: Number(formData.get('passing_score')) || 80,
    };

    const validated = trainingSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('employee_training')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EmployeeTraining };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
