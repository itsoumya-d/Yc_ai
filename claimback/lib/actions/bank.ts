'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, BankConnection, DetectedFee } from '@/types/database';
import { bankConnectionSchema } from '@/lib/validations/schemas';

export async function fetchBankConnections(): Promise<ActionResult<BankConnection[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bank_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function addBankConnection(formData: FormData): Promise<ActionResult<BankConnection>> {
  const raw = {
    institution_name: formData.get('institution_name'),
    institution_id: formData.get('institution_id'),
    account_name: formData.get('account_name') || null,
    account_mask: formData.get('account_mask') || null,
  };

  const parsed = bankConnectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bank_connections')
    .insert({ user_id: user.id, ...parsed.data, is_active: true })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function removeBankConnection(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('bank_connections')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function fetchDetectedFees(connectionId?: string): Promise<ActionResult<DetectedFee[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase
    .from('detected_fees')
    .select('*')
    .eq('user_id', user.id);

  if (connectionId) query = query.eq('bank_connection_id', connectionId);
  query = query.order('transaction_date', { ascending: false }).limit(50);

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

interface FeeHistoryItem {
  month: string;
  totalCents: number;
  count: number;
}

export async function fetchFeeHistory(): Promise<ActionResult<FeeHistoryItem[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabase
    .from('detected_fees')
    .select('amount_cents, transaction_date')
    .eq('user_id', user.id)
    .gte('transaction_date', sixMonthsAgo.toISOString().split('T')[0])
    .order('transaction_date', { ascending: true });

  if (error) return { success: false, error: error.message };

  const monthMap = new Map<string, { total: number; count: number }>();
  for (const fee of data ?? []) {
    const month = fee.transaction_date.slice(0, 7);
    const entry = monthMap.get(month) ?? { total: 0, count: 0 };
    entry.total += fee.amount_cents;
    entry.count += 1;
    monthMap.set(month, entry);
  }

  const history: FeeHistoryItem[] = Array.from(monthMap.entries()).map(([month, { total, count }]) => ({
    month,
    totalCents: total,
    count,
  }));

  return { success: true, data: history };
}
