'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProposalWithClient } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

interface ProposalAnalytics {
  totalProposals: number;
  sentCount: number;
  wonCount: number;
  lostCount: number;
  viewedCount: number;
  winRate: number; // percentage
  avgDaysToClose: number;
  pipelineValue: number;
  wonValue: number;
  lostValue: number;
  byStatus: { status: string; count: number; value: number }[];
  byMonth: { month: string; sent: number; won: number; value: number }[];
  topClients: { name: string; company: string | null; totalValue: number; proposalCount: number }[];
}

export async function getProposalAnalytics(): Promise<ActionResult<ProposalAnalytics>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  const all = (proposals ?? []) as ProposalWithClient[];

  const totalProposals = all.length;
  const sentCount = all.filter((p) => ['sent', 'viewed', 'won', 'lost'].includes(p.status)).length;
  const wonCount = all.filter((p) => p.status === 'won').length;
  const lostCount = all.filter((p) => p.status === 'lost').length;
  const viewedCount = all.filter((p) => p.status === 'viewed').length;
  const winRate = sentCount > 0 ? Math.round((wonCount / sentCount) * 100) : 0;
  const pipelineValue = all.filter((p) => ['draft', 'sent', 'viewed'].includes(p.status)).reduce((s, p) => s + (p.value || 0), 0);
  const wonValue = all.filter((p) => p.status === 'won').reduce((s, p) => s + (p.value || 0), 0);
  const lostValue = all.filter((p) => p.status === 'lost').reduce((s, p) => s + (p.value || 0), 0);

  // Avg days to close (won proposals)
  const wonProposals = all.filter((p) => p.status === 'won');
  const avgDaysToClose = wonProposals.length > 0
    ? Math.round(
        wonProposals.reduce((sum, p) => {
          const diffMs = new Date(p.updated_at).getTime() - new Date(p.created_at).getTime();
          return sum + diffMs / (1000 * 60 * 60 * 24);
        }, 0) / wonProposals.length
      )
    : 0;

  // By status
  const statusGroups: Record<string, { count: number; value: number }> = {};
  for (const p of all) {
    if (!statusGroups[p.status]) statusGroups[p.status] = { count: 0, value: 0 };
    statusGroups[p.status].count++;
    statusGroups[p.status].value += p.value || 0;
  }
  const byStatus = Object.entries(statusGroups).map(([status, v]) => ({ status, ...v }));

  // By month (last 6 months)
  const byMonth: { month: string; sent: number; won: number; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
    const monthProposals = all.filter((p) => p.created_at.startsWith(monthKey));
    byMonth.push({
      month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      sent: monthProposals.filter((p) => ['sent', 'viewed', 'won', 'lost'].includes(p.status)).length,
      won: monthProposals.filter((p) => p.status === 'won').length,
      value: monthProposals.filter((p) => p.status === 'won').reduce((s, p) => s + (p.value || 0), 0),
    });
  }

  // Top clients
  const clientMap: Record<string, { name: string; company: string | null; totalValue: number; proposalCount: number }> = {};
  for (const p of all) {
    const clientName = (p as any).clients?.name || 'Unknown';
    const company = (p as any).clients?.company || null;
    if (!clientMap[clientName]) clientMap[clientName] = { name: clientName, company, totalValue: 0, proposalCount: 0 };
    clientMap[clientName].totalValue += p.value || 0;
    clientMap[clientName].proposalCount++;
  }
  const topClients = Object.values(clientMap)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  return {
    data: {
      totalProposals, sentCount, wonCount, lostCount, viewedCount,
      winRate, avgDaysToClose, pipelineValue, wonValue, lostValue,
      byStatus, byMonth, topClients,
    },
  };
}

export async function trackProposalView(proposalId: string, viewerIp?: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Update proposal status to 'viewed' if it was 'sent'
  await supabase
    .from('proposals')
    .update({ status: 'viewed', updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .eq('status', 'sent');

  return {};
}
