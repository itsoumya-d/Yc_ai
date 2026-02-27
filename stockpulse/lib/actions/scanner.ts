'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Scan, ScanItem } from '@/types/database';
import { scanSchema, scanItemSchema } from '@/lib/validations/schemas';

export async function fetchScans(): Promise<ActionResult<Scan[]>> {
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

    const { data, error } = await supabase
      .from('scans')
      .select('*, location:inventory_locations(*)')
      .eq('org_id', memberData.org_id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Scan[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchScan(id: string): Promise<ActionResult<Scan>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('scans')
      .select('*, location:inventory_locations(*)')
      .eq('id', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Scan };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createScan(formData: FormData): Promise<ActionResult<Scan>> {
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
      scan_type: formData.get('scan_type') as string,
      location_id: (formData.get('location_id') as string) || null,
      notes: (formData.get('notes') as string) || null,
    };

    const parsed = scanSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('scans')
      .insert({
        org_id: memberData.org_id,
        user_id: user.id,
        scan_type: parsed.data.scan_type,
        status: 'in_progress',
        location_id: parsed.data.location_id,
        notes: parsed.data.notes,
        items_count: 0,
        discrepancies_count: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Scan };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function addScanItem(formData: FormData): Promise<ActionResult<ScanItem>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      scan_id: formData.get('scan_id') as string,
      product_id: formData.get('product_id') as string,
      counted_quantity: Number(formData.get('counted_quantity') ?? 0),
      notes: (formData.get('notes') as string) || null,
    };

    const parsed = scanItemSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('scan_items')
      .insert({
        ...parsed.data,
        scanned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ScanItem };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function completeScan(id: string): Promise<ActionResult<Scan>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: items } = await supabase
      .from('scan_items')
      .select('id, discrepancy')
      .eq('scan_id', id);

    const itemCount = items?.length ?? 0;
    const discrepancies = items?.filter((i) => i.discrepancy && i.discrepancy !== 0).length ?? 0;

    const { data, error } = await supabase
      .from('scans')
      .update({
        status: 'completed',
        items_count: itemCount,
        discrepancies_count: discrepancies,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Scan };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
