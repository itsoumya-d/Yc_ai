'use server';

import { createClient } from '@/lib/supabase/server';
import { integrationSchema } from '@/lib/validations/schemas';
import type { ActionResult, Integration } from '@/types/database';

export async function fetchIntegrations(
  orgId: string
): Promise<ActionResult<Integration[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Integration[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createIntegration(
  orgId: string,
  formData: FormData
): Promise<ActionResult<Integration>> {
  try {
    const raw = {
      provider: formData.get('provider') as string,
      display_name: formData.get('display_name') as string,
      scan_schedule: (formData.get('scan_schedule') as string) || 'weekly',
    };

    const validated = integrationSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Integration };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
