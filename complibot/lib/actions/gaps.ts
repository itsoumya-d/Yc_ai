'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Gap } from '@/types/database';

export async function fetchGaps(
  orgId: string,
  options: { severity?: string; status?: string } = {}
): Promise<ActionResult<Gap[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('gaps')
      .select('*')
      .eq('org_id', orgId)
      .order('severity', { ascending: true });

    if (options.severity) {
      query = query.eq('severity', options.severity);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Gap[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateGapStatus(
  gapId: string,
  status: string
): Promise<ActionResult<Gap>> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { status };

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('gaps')
      .update(updateData)
      .eq('id', gapId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Gap };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
