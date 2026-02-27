'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile, Bill, Dispute } from '@/types/database';
import { profileSchema } from '@/lib/validations/schemas';

interface DashboardStats {
  totalSavedCents: number;
  activeDisputes: number;
  billsScanned: number;
  winRate: number;
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const [profileRes, disputesRes] = await Promise.all([
    supabase.from('profiles').select('total_saved_cents, bills_scanned, disputes_won, disputes_total').eq('id', user.id).single(),
    supabase.from('disputes').select('id').eq('user_id', user.id).in('status', ['draft', 'letter_sent', 'calling', 'waiting', 'negotiating', 'escalated']),
  ]);

  const profile = profileRes.data;
  const activeDisputes = disputesRes.data?.length ?? 0;
  const winRate = profile?.disputes_total ? Math.round((profile.disputes_won / profile.disputes_total) * 100) : 0;

  return {
    success: true,
    data: {
      totalSavedCents: profile?.total_saved_cents ?? 0,
      activeDisputes,
      billsScanned: profile?.bills_scanned ?? 0,
      winRate,
    },
  };
}

export async function fetchRecentBills(): Promise<ActionResult<Bill[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function fetchRecentDisputes(): Promise<ActionResult<Dispute[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function fetchProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateProfile(formData: FormData): Promise<ActionResult<Profile>> {
  const raw = {
    full_name: formData.get('full_name') || null,
    phone: formData.get('phone') || null,
    push_opted_in: formData.get('push_opted_in') === 'true',
    email_notifications: formData.get('email_notifications') !== 'false',
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
