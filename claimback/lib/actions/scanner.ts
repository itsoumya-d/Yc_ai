'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Bill, BillLineItem, DetectedFee } from '@/types/database';
import { billScanSchema } from '@/lib/validations/schemas';

export async function fetchBills(status?: string): Promise<ActionResult<Bill[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase.from('bills').select('*').eq('user_id', user.id);
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function fetchBill(id: string): Promise<ActionResult<Bill>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function scanBill(formData: FormData): Promise<ActionResult<Bill>> {
  const raw = {
    bill_type: formData.get('bill_type'),
    provider_name: formData.get('provider_name') || null,
    total_amount_cents: Number(formData.get('total_amount_cents')) || null,
    bill_date: formData.get('bill_date') || null,
    due_date: formData.get('due_date') || null,
    notes: formData.get('notes') || null,
  };

  const parsed = billScanSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('bills')
    .insert({
      user_id: user.id,
      ...parsed.data,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Increment bills_scanned count (best-effort)
  await supabase.rpc('increment_bills_scanned', { user_id_input: user.id });

  return { success: true, data };
}

export async function deleteBill(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function fetchBillLineItems(billId: string): Promise<ActionResult<BillLineItem[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bill_line_items')
    .select('*')
    .eq('bill_id', billId)
    .order('created_at', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function fetchDetectedFees(billId: string): Promise<ActionResult<DetectedFee[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('detected_fees')
    .select('*')
    .eq('bank_connection_id', billId)
    .order('transaction_date', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
