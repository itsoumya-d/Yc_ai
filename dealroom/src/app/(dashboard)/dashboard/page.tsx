'use client';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency, getDealScoreBg, getDealScoreColor, formatDate, daysUntil } from '@/lib/utils';
import { Brain, TrendingUp, AlertTriangle, DollarSign, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className={`rounded-full px-2.5 py-1 text-xs font-bold ${getDealScoreBg(score)}`}>{score}</div>
  );
}

function HealthDot({ health }: { health: string }) {
  const colors: Record<string, string> = { healthy: 'bg-win', at_risk: 'bg-warning', critical: 'bg-risk', stalled: 'bg-text-tertiary' };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[health]}`} />;
}

export default function DashboardPage() {
  const { deals, forecast, reps } = useAppStore();
  const openDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const atRiskDeals = openDeals.filter(d => d.health === 'at_risk' || d.health === 'critical' || d.health === 'stalled');
  const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
  const currentForecast = forecast[0];
  const topRep = [...reps].sort((a, b) => b.attainment - a.attainment)[0];

  return (
    <div className="p-8 max-w-6xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sales Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Q1 2025 · Last updated 2 min ago</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-2"><Brain className="h-4 w-4" />AI Scan</button>
      </div>

      {/* Alerts */}
      {atRiskDeals.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <p className="text-sm font-medium text-text-primary">
              <span className="text-warning font-bold">{atRiskDeals.length} deals</span> need attention — {formatCurrency(atRiskDeals.reduce((s, d) => s + d.value, 0))} at risk
            </p>
          </div>
          <Link href="/pipeline?filter=risk" className="text-xs font-semibold text-warning hover:underline flex items-center gap-1">
            Review <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Open Pipeline', value: formatCurrency(pipelineValue), icon: DollarSign, color: 'text-text-primary', bg: 'bg-primary/10', icolor: 'text-primary' },
          { label: 'Q1 Committed', value: formatCurrency(currentForecast.committed), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', icolor: 'text-primary' },
          { label: 'At-Risk Deals', value: atRiskDeals.length.toString(), icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', icolor: 'text-warning' },
          { label: 'Won This Month', value: formatCurrency(currentForecast.won), icon: DollarSign, color: 'text-win', bg: 'bg-win/10', icolor: 'text-win' },
        ].map(({ label, value, icon: Icon, color, bg, icolor }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-tertiary uppercase tracking-wide">{label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-4 w-4 ${icolor}`} /></div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Deals Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">Active Deals</h2>
          <Link href="/pipeline" className="text-xs text-primary hover:underline flex items-center gap-1">Full Pipeline <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-root text-xs font-medium text-text-tertiary uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Deal</th>
                <th className="px-5 py-3 text-left">Stage</th>
                <th className="px-5 py-3 text-right">Value</th>
                <th className="px-5 py-3 text-center">AI Score</th>
                <th className="px-5 py-3 text-left">Close Date</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {openDeals.slice(0, 6).map((deal) => {
                const days = daysUntil(deal.close_date);
                return (
                  <tr key={deal.id} className="hover:bg-bg-root/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <HealthDot health={deal.health} />
                        <div>
                          <Link href={`/pipeline/${deal.id}`} className="text-sm font-semibold text-text-primary hover:text-primary transition-colors">{deal.name}</Link>
                          <p className="text-xs text-text-tertiary">{deal.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-card border border-border px-2.5 py-0.5 text-xs text-text-secondary capitalize">{deal.stage.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-text-primary">{formatCurrency(deal.value)}</td>
                    <td className="px-5 py-4 text-center"><ScoreBadge score={deal.ai_score} /></td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-text-primary">{formatDate(deal.close_date)}</p>
                      <p className={`text-[10px] ${days < 7 ? 'text-risk' : days < 21 ? 'text-warning' : 'text-text-tertiary'}`}>{days > 0 ? `${days}d away` : 'Overdue'}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-secondary">{deal.owner}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-intel shrink-0" />
                        <span className="text-xs text-text-secondary line-clamp-1">{deal.next_action}</span>
                      </div>
                    </td>
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
