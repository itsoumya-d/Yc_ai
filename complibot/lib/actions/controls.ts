'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Control, ControlStatus } from '@/types/database';
import { getOrg } from './orgs';
import { recalculateFrameworkScore } from './frameworks';

interface GetControlsOptions {
  frameworkId?: string;
  status?: ControlStatus;
}

export async function getControls(options?: GetControlsOptions): Promise<Control[]> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return [];

  let query = supabase
    .from('controls')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false });

  if (options?.frameworkId) {
    query = query.eq('framework_id', options.frameworkId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Control[];
}

export async function updateControlStatus(
  id: string,
  status: ControlStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return { error: 'No organization found' };

  // Get the control's framework_id before updating
  const { data: control } = await supabase
    .from('controls')
    .select('framework_id')
    .eq('id', id)
    .eq('org_id', org.id)
    .single();

  const { error } = await supabase
    .from('controls')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', org.id);

  if (error) return { error: error.message };

  // Recalculate framework compliance score
  if (control?.framework_id) {
    await recalculateFrameworkScore(control.framework_id);
  }

  revalidatePath('/frameworks');
  revalidatePath('/dashboard');
  return { error: null };
}
