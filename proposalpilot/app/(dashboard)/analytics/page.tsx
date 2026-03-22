import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, Trophy, Clock, Users, DollarSign } from 'lucide-react';
import type { ProposalWithClient } from '@/types/database';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Analytics' };

async function getAnalyticsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const all = (proposals ?? []) as ProposalWithClient[];

  const total = all.length;
  const won = all.filter((p) => p.status === 'won');
  const lost = all.filter((p) => p.status === 'lost');
  const sent = all.filter((p) => ['sent', 'viewed', 'won', 'lost'].includes(p.status));

  const winRate = sent.length > 0 ? Math.round((won.length / sent.length) * 100) : 0;
  const wonValue = won.reduce((sum, p) => sum + (p.value || 0), 0);
  const avgDealSize = won.length > 0 ? wonValue / won.length : 0;
  const pipelineValue = all.filter((p) => ['draft', 'sent', 'viewed'].includes(p.status)).reduce((sum, p) => sum + (p.value || 0), 0);

  // Monthly breakdown (last 6 months)
  const now = new Date();
  const months: { label: string; sent: number; won: number; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const monthProposals = all.filter((p) => {
      const created = new Date(p.created_at);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    });
    months.push({
      label,
      sent: monthProposals.filter((p) => ['sent', 'viewed', 'won', 'lost'].includes(p.status)).length,
      won: monthProposals.filter((p) => p.status === 'won').length,
      value: monthProposals.filter((p) => p.status === 'won').reduce((sum, p) => sum + (p.value || 0), 0),
    });
  }

  // Status breakdown
  const statusCounts = {
    draft: all.filter((p) => p.status === 'draft').length,
    sent: all.filter((p) => p.status === 'sent').length,
    viewed: all.filter((p) => p.status === 'viewed').length,
    won: won.length,
    lost: lost.length,
  };

  return { total, winRate, wonValue, avgDealSize, pipelineValue, months, statusCounts, sentCount: sent.length };
}

export default async function AnalyticsPage() {
  const t = await getTranslations('analytics');
  const data = await getAnalyticsData();

  const statuses = [
    { key: 'draft', label: t('draft'), color: 'bg-slate-400' },
    { key: 'sent', label: t('sent'), color: 'bg-blue-500' },
    { key: 'viewed', label: t('viewed'), color: 'bg-amber-500' },
    { key: 'won', label: t('won'), color: 'bg-green-500' },
    { key: 'lost', label: t('lost'), color: 'bg-gray-400' },
  ];

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} description={t('description')} />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)]">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t('noDataAvailable')}</p>
          <p className="text-sm mt-1">{t('signInToSee')}</p>
        </div>
      </div>
    );
  }

  const maxMonthValue = Math.max(...data.months.map((m) => m.value), 1);

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Trophy}
          label={t('winRate')}
          value={`${data.winRate}%`}
          description={`${data.total} ${t('totalProposals')}`}
        />
        <StatCard
          icon={DollarSign}
          label={t('revenueWon')}
          value={formatCurrency(data.wonValue)}
          description={`${data.statusCounts.won} ${t('dealsClosed')}`}
        />
        <StatCard
          icon={TrendingUp}
          label={t('pipelineValue')}
          value={formatCurrency(data.pipelineValue)}
          description={t('activeProposals')}
        />
        <StatCard
          icon={BarChart3}
          label={t('avgDealSize')}
          value={formatCurrency(data.avgDealSize)}
          description={t('wonProposalsOnly')}
        />
        <StatCard
          icon={Users}
          label={t('sentActive')}
          value={data.sentCount.toString()}
          description={t('proposalsInMarket')}
        />
        <StatCard
          icon={Clock}
          label={t('totalProposalsLabel')}
          value={data.total.toString()}
          description={t('allTime')}
        />
      </div>

      {/* Status Breakdown */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-heading font-semibold text-[var(--foreground)] mb-4">{t('statusBreakdown')}</h2>
        <div className="space-y-3">
          {statuses.map((s) => {
            const count = data.statusCounts[s.key as keyof typeof data.statusCounts] ?? 0;
            const pct = data.total > 0 ? (count / data.total) * 100 : 0;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-16 text-sm text-[var(--muted-foreground)] text-right">{s.label}</div>
                <div className="flex-1 h-2.5 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-medium text-[var(--foreground)] text-right">{count}</div>
                <div className="w-10 text-xs text-[var(--muted-foreground)] text-right">{Math.round(pct)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-heading font-semibold text-[var(--foreground)] mb-1">{t('monthlyRevenueWon')}</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">{t('last6Months')}</p>
        <div className="flex items-end gap-2 h-32">
          {data.months.map((m) => {
            const heightPct = (m.value / maxMonthValue) * 100;
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-md bg-brand-500 transition-all duration-500 hover:bg-brand-600"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                    title={formatCurrency(m.value)}
                  />
                </div>
                <span className="text-xs text-[var(--muted-foreground)] truncate w-full text-center">{m.label}</span>
                {m.won > 0 && (
                  <span className="text-xs font-medium text-green-600">{m.won}W</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Sent vs Won */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-heading font-semibold text-[var(--foreground)] mb-4">{t('monthlyActivity')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left pb-2 text-[var(--muted-foreground)] font-medium">{t('month')}</th>
                <th className="text-right pb-2 text-[var(--muted-foreground)] font-medium">{t('sent')}</th>
                <th className="text-right pb-2 text-[var(--muted-foreground)] font-medium">{t('won')}</th>
                <th className="text-right pb-2 text-[var(--muted-foreground)] font-medium">{t('winRate')}</th>
                <th className="text-right pb-2 text-[var(--muted-foreground)] font-medium">{t('revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {data.months.map((m) => {
                const monthWinRate = m.sent > 0 ? Math.round((m.won / m.sent) * 100) : 0;
                return (
                  <tr key={m.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 font-medium text-[var(--foreground)]">{m.label}</td>
                    <td className="py-2.5 text-right text-[var(--muted-foreground)]">{m.sent}</td>
                    <td className="py-2.5 text-right text-green-600 font-medium">{m.won}</td>
                    <td className="py-2.5 text-right text-[var(--muted-foreground)]">{m.sent > 0 ? `${monthWinRate}%` : '—'}</td>
                    <td className="py-2.5 text-right font-medium text-[var(--foreground)]">{m.value > 0 ? formatCurrency(m.value) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
