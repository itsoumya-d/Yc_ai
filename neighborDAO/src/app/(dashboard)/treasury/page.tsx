'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const monthlyData = [
  { month: 'Sep', income: 4200, expenses: 1800 },
  { month: 'Oct', income: 5100, expenses: 3600 },
  { month: 'Nov', income: 3800, expenses: 4200 },
  { month: 'Dec', income: 6200, expenses: 2100 },
  { month: 'Jan', income: 4900, expenses: 1400 },
  { month: 'Feb', income: 3200, expenses: 1650 },
];

export default function TreasuryPage() {
  const { stats, transactions } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Treasury</h1>
          <p className="text-sm text-text-secondary mt-1">Financial overview and transactions</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface transition-colors">
          <Plus className="h-4 w-4" />
          Record Transaction
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Balance</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(stats.treasury_balance)}</p>
          <p className="text-xs text-text-tertiary mt-1">Total available</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Monthly Income</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthly_income)}</p>
          <p className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-green-500" />
            +12% vs last month
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Monthly Expenses</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.monthly_expenses)}</p>
          <p className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3 text-red-500" />
            -5% vs last month
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-text-primary mb-4">Income vs Expenses (6 Months)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barGap={4}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name === 'income' ? 'Income' : 'Expenses']} />
            <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">Transactions</h2>
          <div className="flex gap-1">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  filter === f ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {tx.type === 'income'
                    ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                    : <ArrowDownRight className="h-4 w-4 text-red-500" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-tertiary">{tx.category}</span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-xs text-text-tertiary">{formatDate(tx.date)}</span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-xs text-text-tertiary">approved by {tx.approved_by}</span>
                  </div>
                </div>
              </div>
              <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
