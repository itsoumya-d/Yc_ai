'use client';

import { useAppStore } from '@/stores/app-store';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, Users, FileText, DollarSign,
  Activity, ArrowUpRight, Clock,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const treasuryHistory = [
  { month: 'Sep', balance: 18000 },
  { month: 'Oct', balance: 21500 },
  { month: 'Nov', balance: 19800 },
  { month: 'Dec', balance: 24200 },
  { month: 'Jan', balance: 26900 },
  { month: 'Feb', balance: 28450 },
];

function StatCard({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string; sub?: string; icon: any; trend?: 'up' | 'down';
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
          {sub && (
            <p className={`mt-0.5 text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-text-tertiary'}`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
              {sub}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, proposals, transactions } = useAppStore();
  const activeProposals = proposals.filter((p) => p.status === 'active');
  const recentTx = transactions.slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Welcome back to {stats.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Treasury Balance"
          value={formatCurrency(stats.treasury_balance)}
          sub="+$1,550 this month"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          label="Total Members"
          value={stats.total_members.toString()}
          sub="+2 this month"
          icon={Users}
          trend="up"
        />
        <StatCard
          label="Active Proposals"
          value={stats.active_proposals.toString()}
          sub={`${stats.total_proposals} total`}
          icon={FileText}
        />
        <StatCard
          label="Participation"
          value={`${stats.voting_participation}%`}
          sub="Last 30 days"
          icon={Activity}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Treasury Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Treasury Over Time</h2>
            <span className="text-xs text-text-tertiary">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={treasuryHistory}>
              <defs>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Balance']} />
              <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} fill="url(#tGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Recent Transactions</h2>
            <a href="/treasury" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">{tx.description}</p>
                  <p className="text-xs text-text-tertiary">{tx.category}</p>
                </div>
                <span className={`ml-3 text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Proposals */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Active Proposals</h2>
          <a href="/proposals" className="text-xs text-primary hover:underline flex items-center gap-1">
            All proposals <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        {activeProposals.length === 0 ? (
          <p className="text-sm text-text-tertiary">No active proposals.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeProposals.slice(0, 4).map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
