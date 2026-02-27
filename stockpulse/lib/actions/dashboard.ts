'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile, Scan, StockAlert } from '@/types/database';
import { profileSchema } from '@/lib/validations/schemas';

interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  active_alerts: number;
  scans_today: number;
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
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
    const orgId = memberData.org_id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [products, lowStock, alerts, scans] = await Promise.all([
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('is_active', true),
      supabase
        .from('stock_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('alert_type', 'low_stock')
        .eq('is_resolved', false),
      supabase
        .from('stock_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('is_resolved', false),
      supabase
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', todayStart.toISOString()),
    ]);

    return {
      success: true,
      data: {
        total_products: products.count ?? 0,
        low_stock_count: lowStock.count ?? 0,
        active_alerts: alerts.count ?? 0,
        scans_today: scans.count ?? 0,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentScans(): Promise<ActionResult<Scan[]>> {
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
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Scan[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentAlerts(): Promise<ActionResult<StockAlert[]>> {
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
      .from('stock_alerts')
      .select('*, product:products(*)')
      .eq('org_id', memberData.org_id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as StockAlert[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      full_name: formData.get('full_name') as string,
      phone: (formData.get('phone') as string) || null,
      push_opted_in: formData.get('push_opted_in') === 'true',
      email_opted_in: formData.get('email_opted_in') === 'true',
    };

    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(parsed.data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
