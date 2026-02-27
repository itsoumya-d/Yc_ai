'use server';

import { createClient } from '@/lib/supabase/server';
import { policySchema } from '@/lib/validations/schemas';
import type { ActionResult, Policy } from '@/types/database';

export async function fetchPolicies(
  orgId: string,
  statusFilter?: string
): Promise<ActionResult<Policy[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('policies')
      .select('*')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Policy[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createPolicy(
  orgId: string,
  formData: FormData
): Promise<ActionResult<Policy>> {
  try {
    const raw = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      status: (formData.get('status') as string) || 'draft',
      framework_ids: formData.getAll('framework_ids') as string[],
      control_ids: formData.getAll('control_ids') as string[],
    };

    const validated = policySchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('policies')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Policy };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updatePolicyStatus(
  policyId: string,
  status: string
): Promise<ActionResult<Policy>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('policies')
      .update({ status })
      .eq('id', policyId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Policy };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
