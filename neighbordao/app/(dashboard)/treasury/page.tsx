'use client';

import { useState } from 'react';
import { Plus, Download, TrendingUp, TrendingDown, Banknote, Receipt } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import type { TreasuryEntry } from '@/types/database';

const DEMO_ENTRIES: TreasuryEntry[] = [
  { id: 't1', neighborhood_id: 'n1', created_by: 'u1', type: 'income', amount: 50, category: 'dues', description: 'Monthly dues — Mike T.', receipt_url: null, date: new Date(Date.now() - 1 * 86_400_000).toISOString(), created_at: '', author: { id: 'u1', full_name: 'Mike T.', display_name: 'Mike T.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' } },
  { id: 't2', neighborhood_id: 'n1', created_by: 'u2', type: 'expense', amount: 89, category: 'supplies', description: 'Mulch delivery fee (split from group order)', receipt_url: 'receipt.pdf', date: new Date(Date.now() - 2 * 86_400_000).toISOString(), created_at: '', author: { id: 'u2', full_name: 'David K.', display_name: 'David K.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' } },
  { id: 't3', neighborhood_id: 'n1', created_by: 'u3', type: 'income', amount: 50, category: 'dues', description: 'Monthly dues — Sarah M.', receipt_url: null, date: new Date(Date.now() - 3 * 86_400_000).toISOString(), created_at: '', author: { id: 'u3', full_name: 'Sarah M.', display_name: 'Sarah M.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' } },
  { id: 't4', neighborhood_id: 'n1', created_by: 'u4', type: 'income', amount: 50, category: 'dues', description: 'Monthly dues — Lisa R.', receipt_url: null, date: new Date(Date.now() - 4 * 86_400_000).toISOString(), created_at: '', author: { id: 'u4', full_name: 'Lisa R.', display_name: 'Lisa R.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' } },
  { id: 't5', neighborhood_id: 'n1', created_by: 'u5', type: 'expense', amount: 223.50, category: 'event', description: 'Block party supplies — food and decorations', receipt_url: 'receipt2.pdf', date: new Date(Date.now() - 6 * 86_400_000).toISOString(), created_at: '', author: { id: 'u5', full_name: 'Ann P.', display_name: 'Ann P.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' } },
  { id: 't6', neighborhood_id: 'n1', created_by: 'u6', type: 'income', amount: 200, category: 'donation', description: 'Anonymous donation for community garden', receipt_url: null, date: new Date(Date.now() - 10 * 86_400_000).toISOString(), created_at: '', author: { id: 'u6', full_name: 'Anonymous', display_name: 'Anonymous', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' } },
];

const CATEGORY_COLORS: Record<string, string> = {
  dues: '#16A34A', donation: '#0369A1', event: '#7C3AED',
  maintenance: '#F59E0B', supplies: '#A16207', other: '#78716C', fine: '#DC2626',
};

const BUDGET_PROPOSALS = [
  { title: 'Summer Pool Party Budget', amount: 450, yes: 12, no: 3 },
  { title: 'Holiday Lights — Neighborhood Entrance', amount: 300, yes: 18, no: 2 },
];

export default function TreasuryPage() {
  const [tab, setTab] = useState<'ledger' | 'proposals'>('ledger');

  const income = DEMO_ENTRIES.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expenses = DEMO_ENTRIES.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = 1247.50; // Total balance including history
  const net = income - expenses;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Neighborhood Treasury
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Transparent community finances</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Download className="h-4 w-4" /> CSV
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#CA8A04] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A16207] active:scale-[0.97]">
            <Plus className="h-4 w-4" /> Add Entry
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="col-span-2 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Banknote className="h-4 w-4 text-[#CA8A04]" /> Current Balance
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#CA8A04]" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
            {formatCurrency(balance)}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <TrendingUp className="h-3.5 w-3.5 text-[#16A34A]" /> Income (month)
          </div>
          <div className="mt-1 text-xl font-bold text-[#16A34A]">{formatCurrency(income)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <TrendingDown className="h-3.5 w-3.5 text-[#DC2626]" /> Expenses (month)
          </div>
          <div className="mt-1 text-xl font-bold text-[#DC2626]">−{formatCurrency(expenses)}</div>
        </div>
      </div>

      {/* Net banner */}
      <div className={cn('mb-5 flex items-center justify-between rounded-xl border px-4 py-3', net >= 0 ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-[#FECACA] bg-[#FEF2F2]')}>
        <span className="text-sm font-medium" style={{ color: net >= 0 ? '#15803D' : '#DC2626' }}>
          Monthly Net: {net >= 0 ? '+' : ''}{formatCurrency(net)}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Updated just now</span>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex border-b" style={{ borderColor: 'var(--border)' }}>
        {[['ledger', 'Recent Transactions'], ['proposals', `Budget Proposals (${BUDGET_PROPOSALS.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'ledger' | 'proposals')}
            className={cn('px-4 py-2.5 text-sm font-medium', tab === key ? 'border-b-2 border-[#CA8A04] text-[#A16207]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'ledger' && (
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ENTRIES.map(entry => (
                <tr key={entry.id} className="border-b transition-colors hover:bg-[var(--bg-page)]" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className={cn('px-4 py-3 text-right text-sm font-semibold font-mono', entry.type === 'income' ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
                    {entry.type === 'income' ? '+' : '−'}{formatCurrency(entry.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-[4px] px-2 py-0.5 text-xs font-medium text-white" style={{ background: CATEGORY_COLORS[entry.category] ?? '#78716C' }}>
                      {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      {entry.description}
                      {entry.receipt_url && <Receipt className="h-3.5 w-3.5 text-[#16A34A] shrink-0" aria-label="Receipt attached" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'proposals' && (
        <div className="space-y-3">
          {BUDGET_PROPOSALS.map(p => {
            const total = p.yes + p.no;
            const yesPct = Math.round((p.yes / total) * 100);
            return (
              <div key={p.title} className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>{p.title}</h3>
                  <span className="text-base font-bold" style={{ color: '#CA8A04', fontFamily: 'monospace' }}>{formatCurrency(p.amount)}</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[#16A34A] font-medium">{p.yes} yes</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{p.no} no</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#FEE2E2' }}>
                    <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${yesPct}%` }} />
                  </div>
                </div>
                <button className="mt-3 text-sm font-medium text-[#16A34A] hover:underline">View Details →</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
