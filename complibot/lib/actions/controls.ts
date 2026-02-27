'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Control, ControlStatus } from '@/types/database';

export async function getControls(frameworkId?: string): Promise<{ data?: Control[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) return { data: [] };

  let query = supabase
    .from('controls')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('control_id', { ascending: true });

  if (frameworkId) {
    query = query.eq('framework_id', frameworkId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Control[] };
}

export async function updateControlStatus(
  controlId: string,
  status: ControlStatus,
  notes?: string,
  owner?: string,
  dueDate?: string
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Partial<Control> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (notes !== undefined) updates.notes = notes;
  if (owner !== undefined) updates.owner = owner;
  if (dueDate !== undefined) updates.due_date = dueDate;

  const { error } = await supabase.from('controls').update(updates).eq('id', controlId);
  if (error) return { error: error.message };

  // Recalculate framework compliance score
  const { data: control } = await supabase.from('controls').select('framework_id').eq('id', controlId).single();
  if (control) {
    const { data: allControls } = await supabase
      .from('controls')
      .select('status')
      .eq('framework_id', control.framework_id);

    if (allControls) {
      const total = allControls.filter((c) => c.status !== 'not_applicable').length;
      const implemented = allControls.filter((c) => c.status === 'implemented').length;
      const score = total > 0 ? Math.round((implemented / total) * 100) : 0;

      await supabase
        .from('frameworks')
        .update({ compliance_score: score, updated_at: new Date().toISOString() })
        .eq('id', control.framework_id);
    }
  }

  revalidatePath('/controls');
  revalidatePath('/dashboard');
  return {};
}

export async function getControlsByCategory(frameworkId?: string): Promise<{
  data?: Record<string, Control[]>;
  error?: string;
}> {
  const { data, error } = await getControls(frameworkId);
  if (error) return { error };

  const grouped: Record<string, Control[]> = {};
  for (const control of data ?? []) {
    if (!grouped[control.category]) grouped[control.category] = [];
    grouped[control.category].push(control);
  }
  return { data: grouped };
}
