'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = null> { data?: T; error?: string; }

export interface WinLossData {
  total:        number;
  won:          number;
  lost:         number;
  pending:      number;  // sent/viewed
  draft:        number;
  win_rate:     number;  // percentage
  total_value:  number;
  won_value:    number;
  lost_value:   number;
  avg_value:    number;
  avg_days_to_close: number | null;
  by_month: { month: string; won: number; lost: number; sent: number }[];
  by_client: { client: string; won: number; lost: number; total: number; win_rate: number }[];
  loss_reasons: { reason: string; count: number }[];
}

export async function getWinLossAnalytics(): Promise<ActionResult<WinLossData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return { error: error.message };
  if (!proposals) return { data: emptyData() };

  const total     = proposals.length;
  const won       = proposals.filter((p) => p.status === 'won').length;
  const lost      = proposals.filter((p) => p.status === 'lost').length;
  const pending   = proposals.filter((p) => ['sent', 'viewed'].includes(p.status)).length;
  const draft     = proposals.filter((p) => p.status === 'draft').length;
  const win_rate  = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  const total_value = proposals.reduce((s, p) => s + (p.value ?? 0), 0);
  const won_value   = proposals.filter((p) => p.status === 'won').reduce((s, p) => s + (p.value ?? 0), 0);
  const lost_value  = proposals.filter((p) => p.status === 'lost').reduce((s, p) => s + (p.value ?? 0), 0);
  const avg_value   = total > 0 ? total_value / total : 0;

  // Average days to close (created_at → updated_at for won/lost)
  const closedProposals = proposals.filter((p) => p.status === 'won' || p.status === 'lost');
  const avg_days_to_close = closedProposals.length > 0
    ? Math.round(closedProposals.reduce((s, p) => {
        const days = (new Date(p.updated_at).getTime() - new Date(p.created_at).getTime()) / 86400000;
        return s + days;
      }, 0) / closedProposals.length)
    : null;

  // By month (last 6 months)
  const months: Record<string, { won: number; lost: number; sent: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months[key] = { won: 0, lost: 0, sent: 0 };
  }
  for (const p of proposals) {
    const d = new Date(p.updated_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (months[key]) {
      if (p.status === 'won') months[key]!.won++;
      else if (p.status === 'lost') months[key]!.lost++;
      else if (['sent', 'viewed'].includes(p.status)) months[key]!.sent++;
    }
  }
  const by_month = Object.entries(months).map(([month, v]) => ({ month, ...v }));

  // By client (top 10)
  const clientMap: Record<string, { won: number; lost: number; total: number }> = {};
  for (const p of proposals) {
    const clientName = (p.clients as { name: string; company: string | null } | null)?.name ?? 'Unknown';
    if (!clientMap[clientName]) clientMap[clientName] = { won: 0, lost: 0, total: 0 };
    clientMap[clientName]!.total++;
    if (p.status === 'won') clientMap[clientName]!.won++;
    if (p.status === 'lost') clientMap[clientName]!.lost++;
  }
  const by_client = Object.entries(clientMap)
    .map(([client, v]) => ({
      client,
      ...v,
      win_rate: v.won + v.lost > 0 ? Math.round((v.won / (v.won + v.lost)) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Loss reasons (from notes field containing keywords)
  const lossKeywords: Record<string, string[]> = {
    'Price too high': ['price', 'expensive', 'cost', 'budget'],
    'Lost to competitor': ['competitor', 'competition', 'another', 'chose'],
    'No response': ['no response', 'ghost', 'unresponsive'],
    'Requirements changed': ['changed', 'pivot', 'different direction'],
    'Timeline mismatch': ['timeline', 'schedule', 'deadline', 'too long'],
  };
  const reasonCounts: Record<string, number> = {};
  for (const p of proposals.filter((p) => p.status === 'lost')) {
    const notes = (p.notes ?? '').toLowerCase();
    let matched = false;
    for (const [reason, keywords] of Object.entries(lossKeywords)) {
      if (keywords.some((k) => notes.includes(k))) {
        reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) reasonCounts['Other'] = (reasonCounts['Other'] ?? 0) + 1;
  }
  const loss_reasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  return {
    data: {
      total, won, lost, pending, draft, win_rate,
      total_value, won_value, lost_value, avg_value, avg_days_to_close,
      by_month, by_client, loss_reasons,
    },
  };
}

function emptyData(): WinLossData {
  return {
    total: 0, won: 0, lost: 0, pending: 0, draft: 0,
    win_rate: 0, total_value: 0, won_value: 0, lost_value: 0,
    avg_value: 0, avg_days_to_close: null,
    by_month: [], by_client: [], loss_reasons: [],
  };
}

export async function markProposalOutcome(
  id: string,
  outcome: 'won' | 'lost',
  notes?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updateData: Record<string, string> = {
    status: outcome,
    updated_at: new Date().toISOString(),
  };
  if (notes) updateData['notes'] = notes;

  const { error } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath(`/proposals/${id}`);
  revalidatePath('/analytics');
  revalidatePath('/dashboard');
  return {};
}
