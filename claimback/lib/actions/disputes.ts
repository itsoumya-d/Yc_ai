import { supabase } from '../supabase';
import type { Dispute } from '../../types';

export async function getDisputes(): Promise<Dispute[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getDisputeById(id: string): Promise<Dispute> {
  const { data, error } = await supabase
    .from('disputes')
    .select('*, bill:bills(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createDispute(billId: string, notes?: string): Promise<Dispute> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: bill } = await supabase.from('bills').select('*').eq('id', billId).single();

  const { data, error } = await supabase
    .from('disputes')
    .insert({
      user_id: user.id,
      bill_id: billId,
      status: 'draft',
      amount_disputed: bill?.total_overcharge || 0,
      dispute_amount: bill?.total_overcharge || 0,
      provider_name: bill?.provider_name || 'Unknown',
      bill_type: bill?.bill_type,
      notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createDisputeWithLetter(billId: string, letter: string): Promise<Dispute> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: bill } = await supabase.from('bills').select('*').eq('id', billId).single();

  const { data, error } = await supabase
    .from('disputes')
    .insert({
      user_id: user.id,
      bill_id: billId,
      status: 'submitted',
      amount_disputed: bill?.total_overcharge || 0,
      dispute_amount: bill?.total_overcharge || 0,
      provider_name: bill?.provider_name || 'Unknown',
      bill_type: bill?.bill_type,
      dispute_letter: letter,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;

  // Update bill status
  await supabase.from('bills').update({ status: 'disputed', dispute_id: data.id }).eq('id', billId);

  return data;
}

export async function updateDisputeStatus(id: string, status: Dispute['status']): Promise<void> {
  const { error } = await supabase
    .from('disputes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
