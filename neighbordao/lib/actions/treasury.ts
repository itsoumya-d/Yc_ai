'use server';

import { createClient } from '@/lib/supabase/server';
import { TreasuryEntry, TreasuryEntryType } from '@/types/database';

export async function getTreasuryEntries(neighborhoodId: string): Promise<TreasuryEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('treasury_entries')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getBalance(neighborhoodId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('treasury_entries')
    .select('entry_type, amount')
    .eq('neighborhood_id', neighborhoodId);

  if (error || !data) return 0;

  const balance = data.reduce((acc, entry) => {
    if (entry.entry_type === 'income') return acc + Number(entry.amount);
    if (entry.entry_type === 'expense') return acc - Number(entry.amount);
    return acc;
  }, 0);

  return balance;
}

export async function addEntry(data: {
  neighborhood_id: string;
  entry_type: TreasuryEntryType;
  category: string;
  description: string;
  amount: number;
}): Promise<{ error?: string; entry?: TreasuryEntry }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: entry, error } = await supabase
    .from('treasury_entries')
    .insert({
      neighborhood_id: data.neighborhood_id,
      entry_type: data.entry_type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { entry };
}
