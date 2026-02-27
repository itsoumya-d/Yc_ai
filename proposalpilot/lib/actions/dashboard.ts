'use server';

import { createClient } from '@/lib/supabase/server';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import type { ProposalWithClient } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

interface DashboardData {
  totalProposals: number;
  sentCount: number;
  wonCount: number;
  pipelineValue: number;
  wonValue: number;
  recentProposals: ProposalWithClient[];
  // Enhanced analytics
  winRate: number;
  avgDealSize: number;
  avgDaysToClose: number;
  monthlyTrends: { month: string; sent: number; won: number; lost: number; value: number }[];
  statusBreakdown: { status: string; count: number; value: number }[];
  topClients: { name: string; company: string | null; proposals: number; totalValue: number; wonValue: number }[];
}

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return { error: error.message };

  const all = (proposals ?? []) as ProposalWithClient[];
  const totalProposals = all.length;
  const sentCount = all.filter((p) => p.status === 'sent' || p.status === 'viewed').length;
  const wonCount = all.filter((p) => p.status === 'won').length;
  const lostCount = all.filter((p) => p.status === 'lost').length;
  const pipelineValue = all.filter((p) => ['draft', 'sent', 'viewed'].includes(p.status)).reduce((sum, p) => sum + (p.value || 0), 0);
  const wonValue = all.filter((p) => p.status === 'won').reduce((sum, p) => sum + (p.value || 0), 0);
  const recentProposals = all.slice(0, 5);

  // Win rate: won / (won + lost)
  const decidedCount = wonCount + lostCount;
  const winRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : 0;

  // Average deal size (won proposals)
  const wonProposals = all.filter((p) => p.status === 'won');
  const avgDealSize = wonProposals.length > 0
    ? Math.round(wonProposals.reduce((sum, p) => sum + (p.value || 0), 0) / wonProposals.length)
    : 0;

  // Average days to close (from created_at to updated_at for won proposals)
  const daysToClose = wonProposals.map((p) => {
    const created = new Date(p.created_at).getTime();
    const updated = new Date(p.updated_at).getTime();
    return Math.ceil((updated - created) / (1000 * 60 * 60 * 24));
  });
  const avgDaysToClose = daysToClose.length > 0
    ? Math.round(daysToClose.reduce((sum, d) => sum + d, 0) / daysToClose.length)
    : 0;

  // Monthly trends (last 6 months)
  const monthlyTrends: DashboardData['monthlyTrends'] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStr = format(monthDate, 'yyyy-MM');
    const monthLabel = format(monthDate, 'MMM yyyy');
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthProposals = all.filter((p) => {
      const d = new Date(p.created_at);
      return d >= monthStart && d <= monthEnd;
    });

    monthlyTrends.push({
      month: monthLabel,
      sent: monthProposals.filter((p) => ['sent', 'viewed'].includes(p.status)).length,
      won: monthProposals.filter((p) => p.status === 'won').length,
      lost: monthProposals.filter((p) => p.status === 'lost').length,
      value: monthProposals.reduce((sum, p) => sum + (p.value || 0), 0),
    });
  }

  // Status breakdown
  const statusMap = new Map<string, { count: number; value: number }>();
  for (const p of all) {
    const existing = statusMap.get(p.status) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += p.value || 0;
    statusMap.set(p.status, existing);
  }
  const statusBreakdown = Array.from(statusMap.entries()).map(([status, { count, value }]) => ({
    status,
    count,
    value,
  }));

  // Top clients by total value
  const clientMap = new Map<string, { name: string; company: string | null; proposals: number; totalValue: number; wonValue: number }>();
  for (const p of all) {
    if (!p.clients) continue;
    const key = p.clients.name;
    const existing = clientMap.get(key) || { name: p.clients.name, company: p.clients.company, proposals: 0, totalValue: 0, wonValue: 0 };
    existing.proposals += 1;
    existing.totalValue += p.value || 0;
    if (p.status === 'won') existing.wonValue += p.value || 0;
    clientMap.set(key, existing);
  }
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  return {
    data: {
      totalProposals,
      sentCount,
      wonCount,
      pipelineValue,
      wonValue,
      recentProposals,
      winRate,
      avgDealSize,
      avgDaysToClose,
      monthlyTrends,
      statusBreakdown,
      topClients,
    },
  };
}
