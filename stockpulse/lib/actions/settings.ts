'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Organization } from '@/types/database';
import { alertSettingsSchema } from '@/lib/validations/schemas';

export async function fetchAlertSettings(): Promise<ActionResult<{ low_stock_threshold: number; expiration_warning_days: number; push_opted_in: boolean; email_opted_in: boolean }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    const { data: org, error } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', memberData.org_id)
      .single();

    if (error) return { success: false, error: error.message };

    const settings = (org?.settings ?? {}) as Record<string, unknown>;

    return {
      success: true,
      data: {
        low_stock_threshold: (settings.low_stock_threshold as number) ?? 10,
        expiration_warning_days: (settings.expiration_warning_days as number) ?? 7,
        push_opted_in: (settings.push_opted_in as boolean) ?? true,
        email_opted_in: (settings.email_opted_in as boolean) ?? true,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateAlertSettings(formData: FormData): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    const raw = {
      low_stock_threshold: Number(formData.get('low_stock_threshold') ?? 10),
      expiration_warning_days: Number(formData.get('expiration_warning_days') ?? 7),
      push_opted_in: formData.get('push_opted_in') === 'true',
      email_opted_in: formData.get('email_opted_in') === 'true',
    };

    const parsed = alertSettingsSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', memberData.org_id)
      .single();

    const existingSettings = (org?.settings ?? {}) as Record<string, unknown>;

    const { error } = await supabase
      .from('organizations')
      .update({
        settings: { ...existingSettings, ...parsed.data },
      })
      .eq('id', memberData.org_id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteAccount(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await supabase.from('scan_items').delete().eq('scan_id', user.id);
    await supabase.from('scans').delete().eq('user_id', user.id);
    await supabase.from('org_members').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);

    await supabase.auth.signOut();

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
