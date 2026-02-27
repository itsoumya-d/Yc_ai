'use client';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

export default function TeamPage() {
  const { reps } = useAppStore();
  const sorted = [...reps].sort((a, b) => b.attainment - a.attainment);

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Team Performance</h1>
        <p className="text-sm text-text-secondary mt-1">Q1 2025 Leaderboard</p>
      </div>

      <div className="grid gap-4">
        {sorted.map((rep, idx) => (
          <div key={rep.id} className={`rounded-xl border p-5 ${idx === 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-card'}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary/20 text-primary'}`}>
                    {rep.avatar_initial}
                  </div>
                  {idx === 0 && <Trophy className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />}
                </div>
                <div>
                  <p className="font-bold text-text-primary">{rep.name}</p>
                  <p className="text-xs text-text-tertiary">{rep.deals_open} open deals · {formatCurrency(rep.pipeline_value)} pipeline</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-2xl font-bold ${rep.attainment >= 100 ? 'text-win' : rep.attainment >= 80 ? 'text-primary' : rep.attainment >= 60 ? 'text-warning' : 'text-risk'}`}>
                    {rep.attainment}%
                  </p>
                  <p className="text-xs text-text-tertiary">Quota Attainment</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-text-tertiary mb-1">
                <span>{formatCurrency(rep.won_ytd)} won</span>
                <span>{formatCurrency(rep.quota)} quota</span>
              </div>
              <div className="h-2 rounded-full bg-bg-root overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${rep.attainment >= 100 ? 'bg-win' : rep.attainment >= 60 ? 'bg-primary' : 'bg-warning'}`}
                  style={{ width: `${Math.min(rep.attainment, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Avg Deal Size', value: formatCurrency(rep.avg_deal_size) },
                { label: 'Win Rate', value: `${rep.win_rate}%` },
                { label: 'Open Deals', value: rep.deals_open.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-bg-root p-2 text-center">
                  <p className="text-sm font-bold text-text-primary">{value}</p>
                  <p className="text-[10px] text-text-tertiary">{label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
