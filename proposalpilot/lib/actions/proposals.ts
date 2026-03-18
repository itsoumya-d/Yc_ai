'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Proposal, ProposalWithClient, ProposalWithDetails } from '@/types/database';
import { proposalSchema } from '@/lib/validations';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getProposals(): Promise<ActionResult<ProposalWithClient[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposals').select('*, clients(name, company)').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) return { error: error.message };
  return { data: data as ProposalWithClient[] };
}

export async function getProposal(id: string): Promise<ActionResult<ProposalWithDetails>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const [proposalRes, sectionsRes] = await Promise.all([
    supabase.from('proposals').select('*, clients(name, company)').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('proposal_sections').select('*').eq('proposal_id', id).order('order_index'),
  ]);
  if (proposalRes.error) return { error: proposalRes.error.message };
  const proposal: ProposalWithDetails = { ...(proposalRes.data as Proposal & { clients?: { name: string; company: string | null } | null }), proposal_sections: (sectionsRes.data ?? []) as ProposalWithDetails['proposal_sections'] };
  return { data: proposal };
}

export async function createProposal(formData: FormData): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = proposalSchema.safeParse({
    title: formData.get('title'),
    clientId: (formData.get('client_id') as string) || undefined,
    templateId: (formData.get('template_id') as string) || undefined,
    validUntil: (formData.get('valid_until') as string) || undefined,
    totalValue: formData.get('value') ? Number(formData.get('value')) : undefined,
    currency: (formData.get('currency') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('proposals').insert({
    user_id: user.id,
    client_id: parsed.data.clientId ?? null,
    template_id: parsed.data.templateId ?? null,
    title: parsed.data.title,
    status: 'draft',
    value: parsed.data.totalValue ?? 0,
    currency: parsed.data.currency,
    pricing_model: formData.get('pricing_model') as string || 'fixed',
    valid_until: parsed.data.validUntil ?? null,
    notes: parsed.data.notes ?? null,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return { data: data as Proposal };
}

export async function updateProposal(id: string, formData: FormData): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = proposalSchema.safeParse({
    title: formData.get('title'),
    clientId: (formData.get('client_id') as string) || undefined,
    validUntil: (formData.get('valid_until') as string) || undefined,
    totalValue: formData.get('value') ? Number(formData.get('value')) : undefined,
    currency: (formData.get('currency') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('proposals').update({
    client_id: parsed.data.clientId ?? null,
    title: parsed.data.title,
    status: formData.get('status') as string || 'draft',
    value: parsed.data.totalValue ?? 0,
    currency: parsed.data.currency,
    pricing_model: formData.get('pricing_model') as string || 'fixed',
    valid_until: parsed.data.validUntil ?? null,
    notes: parsed.data.notes ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath(`/proposals/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Proposal };
}

export async function deleteProposal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('proposals').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return {};
}

export async function updateProposalStatus(id: string, status: string): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase
    .from('proposals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath(`/proposals/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Proposal };
}

export async function getProposalAnalytics(proposalId: string) {
  'use server';
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('proposal_view_events')
    .select('viewed_at, viewer_name, time_spent_seconds')
    .eq('proposal_id', proposalId)
    .order('viewed_at', { ascending: false })
    .limit(10);

  const viewEvents = events ?? [];
  const totalViews = viewEvents.length;
  const lastViewedAt = viewEvents[0]?.viewed_at;
  const avgTimeSeconds = viewEvents.length > 0
    ? Math.round(viewEvents.reduce((s: number, e: Record<string, unknown>) => s + ((e.time_spent_seconds as number) ?? 0), 0) / viewEvents.length)
    : 0;

  return { viewEvents, totalViews, lastViewedAt, avgTimeSeconds };
}
