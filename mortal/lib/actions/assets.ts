'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, DigitalAsset } from '@/types/database';
import { digitalAssetSchema } from '@/lib/validations/schemas';

export async function fetchAssets(): Promise<ActionResult<DigitalAsset[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('digital_assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as DigitalAsset[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createAsset(formData: FormData): Promise<ActionResult<DigitalAsset>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      category: formData.get('category') as string,
      service_name: formData.get('service_name') as string,
      username: formData.get('username') as string || null,
      url: formData.get('url') as string || null,
      notes: formData.get('notes') as string || null,
      action_on_death: formData.get('action_on_death') as string || null,
      estimated_value_cents: formData.get('estimated_value_cents') ? Number(formData.get('estimated_value_cents')) : null,
    };

    const parsed = digitalAssetSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('digital_assets')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DigitalAsset };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateAsset(id: string, formData: FormData): Promise<ActionResult<DigitalAsset>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      category: formData.get('category') as string,
      service_name: formData.get('service_name') as string,
      username: formData.get('username') as string || null,
      url: formData.get('url') as string || null,
      notes: formData.get('notes') as string || null,
      action_on_death: formData.get('action_on_death') as string || null,
      estimated_value_cents: formData.get('estimated_value_cents') ? Number(formData.get('estimated_value_cents')) : null,
    };

    const parsed = digitalAssetSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('digital_assets')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DigitalAsset };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteAsset(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('digital_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
