'use server';

import { createClient } from '@/lib/supabase/server';
import { treasuryEntrySchema } from '@/lib/validations/schemas';
import type { ActionResult, TreasuryEntry } from '@/types/database';

export async function fetchTreasuryEntries(
  neighborhoodId: string,
  limit = 50
): Promise<ActionResult<TreasuryEntry[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('treasury_entries')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as TreasuryEntry[] };
}

export async function createTreasuryEntry(
  neighborhoodId: string,
  formData: FormData
): Promise<ActionResult<TreasuryEntry>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    entry_type: formData.get('entry_type') as string,
    category: formData.get('category') as string || 'general',
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')) || 0,
    receipt_url: (formData.get('receipt_url') as string) || null,
  };

  const parsed = treasuryEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('treasury_entries')
    .insert({
      neighborhood_id: neighborhoodId,
      created_by: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as TreasuryEntry };
}

export async function fetchTreasurySummary(
  neighborhoodId: string
): Promise<ActionResult<{ balance: number; monthlyIncome: number; monthlyExpense: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: entries, error } = await supabase
    .from('treasury_entries')
    .select('entry_type, amount, created_at')
    .eq('neighborhood_id', neighborhoodId);

  if (error) return { success: false, error: error.message };

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let balance = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  for (const entry of entries ?? []) {
    if (entry.entry_type === 'income') {
      balance += Number(entry.amount);
      if (entry.created_at >= firstOfMonth) {
        monthlyIncome += Number(entry.amount);
      }
    } else {
      balance -= Number(entry.amount);
      if (entry.created_at >= firstOfMonth) {
        monthlyExpense += Number(entry.amount);
      }
    }
  }

  return { success: true, data: { balance, monthlyIncome, monthlyExpense } };
}
