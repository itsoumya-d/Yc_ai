import { supabase } from '../supabase';
import type { SavingsEvent } from '../../types';

export async function getTotalSavings(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('disputes')
    .select('resolved_amount, dispute_amount, amount_disputed, status')
    .eq('user_id', user.id)
    .in('status', ['won']);

  if (error || !data) return 0;

  return data.reduce((sum, d) => {
    return sum + (d.resolved_amount || d.amount_disputed || d.dispute_amount || 0);
  }, 0);
}

export async function getRecentSavingsEvents(limit = 5): Promise<SavingsEvent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('savings_events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Fallback: derive from won disputes
    const { data: disputes } = await supabase
      .from('disputes')
      .select('id, provider_name, amount_disputed, dispute_amount, resolved_amount, created_at')
      .eq('user_id', user.id)
      .eq('status', 'won')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (disputes || []).map((d) => ({
      id: d.id,
      user_id: user.id,
      dispute_id: d.id,
      amount_saved: d.resolved_amount || d.amount_disputed || d.dispute_amount || 0,
      provider_name: d.provider_name,
      created_at: d.created_at,
    }));
  }

  return (data || []).map((e) => ({
    ...e,
    amount_saved: e.amount_saved || e.amount || 0,
  }));
}

export async function recordSavingsEvent(
  disputeId: string,
  amountSaved: number,
  providerName?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('savings_events').insert({
    user_id: user.id,
    dispute_id: disputeId,
    amount_saved: amountSaved,
    provider_name: providerName,
    event_type: 'dispute_won',
    created_at: new Date().toISOString(),
  });
}
