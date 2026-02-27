'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Dispute, DisputeEvent } from '@/types/database';
import { disputeSchema, disputeUpdateSchema } from '@/lib/validations/schemas';

export async function fetchDisputes(status?: string): Promise<ActionResult<Dispute[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase.from('disputes').select('*, bill:bills(*)').eq('user_id', user.id);
  if (status && status !== 'all') query = query.eq('status', status);
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function fetchDispute(id: string): Promise<ActionResult<Dispute>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('disputes')
    .select('*, bill:bills(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createDispute(formData: FormData): Promise<ActionResult<Dispute>> {
  const raw = {
    bill_id: formData.get('bill_id') || null,
    dispute_type: formData.get('dispute_type'),
    provider_name: formData.get('provider_name'),
    original_amount_cents: Number(formData.get('original_amount_cents')),
    disputed_amount_cents: Number(formData.get('disputed_amount_cents')),
  };

  const parsed = disputeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('disputes')
    .insert({
      user_id: user.id,
      ...parsed.data,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateDispute(id: string, formData: FormData): Promise<ActionResult<Dispute>> {
  const raw = {
    status: formData.get('status') || undefined,
    settled_amount_cents: formData.get('settled_amount_cents') ? Number(formData.get('settled_amount_cents')) : undefined,
    letter_content: formData.get('letter_content') || undefined,
    resolution_notes: formData.get('resolution_notes') || undefined,
    response_deadline: formData.get('response_deadline') || undefined,
  };

  const parsed = disputeUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('disputes')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function generateDisputeLetter(disputeId: string): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: dispute } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', disputeId)
    .eq('user_id', user.id)
    .single();

  if (!dispute) return { success: false, error: 'Dispute not found' };

  // Placeholder for AI-generated letter
  const letter = `Dear ${dispute.provider_name} Billing Department,\n\nI am writing to dispute a charge of $${(dispute.disputed_amount_cents / 100).toFixed(2)} on my account.\n\nI believe this charge is incorrect because [AI analysis would provide specific reasoning here].\n\nPlease review and adjust my account accordingly.\n\nSincerely,\n[Account Holder]`;

  await supabase
    .from('disputes')
    .update({ letter_content: letter })
    .eq('id', disputeId)
    .eq('user_id', user.id);

  return { success: true, data: letter };
}

export async function fetchDisputeEvents(disputeId: string): Promise<ActionResult<DisputeEvent[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispute_events')
    .select('*')
    .eq('dispute_id', disputeId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function addDisputeEvent(
  disputeId: string,
  eventType: string,
  description: string
): Promise<ActionResult<DisputeEvent>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dispute_events')
    .insert({ dispute_id: disputeId, event_type: eventType, description })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
