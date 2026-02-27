'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TreasuryEntry } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getTreasuryEntries(
  neighborhoodId: string
): Promise<ActionResult<TreasuryEntry[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('treasury_entries')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('date', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as TreasuryEntry[] };
}

export async function createTreasuryEntry(data: {
  neighborhood_id: string;
  type: TreasuryEntry['type'];
  amount: number;
  description: string;
  category: string;
  date: string;
}): Promise<ActionResult<TreasuryEntry>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: entry, error } = await supabase
    .from('treasury_entries')
    .insert({
      ...data,
      created_by: user.id,
      receipt_url: null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/treasury');
  revalidatePath('/dashboard');
  return { data: entry as TreasuryEntry };
}

export async function deleteTreasuryEntry(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('treasury_entries')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/treasury');
  revalidatePath('/dashboard');
  return {};
}

export async function getTreasurySummary(
  neighborhoodId: string
): Promise<
  ActionResult<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    incomeByCategory: { category: string; total: number }[];
    expenseByCategory: { category: string; total: number }[];
  }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: entries, error } = await supabase
    .from('treasury_entries')
    .select('*')
    .eq('neighborhood_id', neighborhoodId);

  if (error) return { error: error.message };

  const typedEntries = entries as TreasuryEntry[];

  let totalIncome = 0;
  let totalExpenses = 0;
  const incomeCategoryMap: Record<string, number> = {};
  const expenseCategoryMap: Record<string, number> = {};

  for (const entry of typedEntries) {
    if (entry.type === 'income') {
      totalIncome += entry.amount;
      incomeCategoryMap[entry.category] =
        (incomeCategoryMap[entry.category] || 0) + entry.amount;
    } else {
      totalExpenses += entry.amount;
      expenseCategoryMap[entry.category] =
        (expenseCategoryMap[entry.category] || 0) + entry.amount;
    }
  }

  const incomeByCategory = Object.entries(incomeCategoryMap).map(
    ([category, total]) => ({ category, total })
  );

  const expenseByCategory = Object.entries(expenseCategoryMap).map(
    ([category, total]) => ({ category, total })
  );

  return {
    data: {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory,
      expenseByCategory,
    },
  };
}
