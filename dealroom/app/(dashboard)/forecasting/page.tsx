import { getDeals } from '@/lib/actions/deals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StageBadge, HealthBadge } from '@/components/ui/badge';
import Link from 'next/link';
import { BarChart3, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import type { Deal, DealStage } from '@/types/database';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STAGE_ORDER: DealStage[] = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const STAGE_LABELS: Record<DealStage, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const STAGE_COLORS: Record<DealStage, string> = {
  prospecting: 'bg-gray-200',
  qualification: 'bg-blue-400',
  proposal: 'bg-violet-500',
  negotiation: 'bg-amber-400',
  closed_won: 'bg-green-500',
  closed_lost: 'bg-red-400',
};

export default async function ForecastingPage() {
  const { data: deals = [], error } = await getDeals();

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
        Failed to load deals: {error}
      </div>
    );
  }

  const allDeals = deals ?? [];

  // Group deals by stage
  const byStage: Record<DealStage, Deal[]> = {
    prospecting: [],
    qualification: [],
    proposal: [],
    negotiation: [],
    closed_won: [],
    closed_lost: [],
  };

  for (const deal of allDeals) {
    if (byStage[deal.stage]) {
      byStage[deal.stage].push(deal);
    }
  }

  // Pipeline value per stage (excluding closed_lost)
  const pipelineStages = STAGE_ORDER.filter((s) => s !== 'closed_lost');
  const stageValues = pipelineStages.map((stage) => ({
    stage,
    deals: byStage[stage],
    value: byStage[stage].reduce((sum, d) => sum + Number(d.amount), 0),
    count: byStage[stage].length,
  }));

  const totalPipeline = stageValues.reduce((sum, s) => sum + s.value, 0);
  const maxValue = Math.max(...stageValues.map((s) => s.value), 1);

  // Win rate
  const wonDeals = byStage.closed_won.length;
  const lostDeals = byStage.closed_lost.length;
  const closedTotal = wonDeals + lostDeals;
  const winRate = closedTotal > 0 ? Math.round((wonDeals / closedTotal) * 100) : 0;

  // Weighted forecast (probability * amount)
  const weightedForecast = allDeals
    .filter((d) => d.stage !== 'closed_lost' && d.stage !== 'closed_won')
    .reduce((sum, d) => sum + (Number(d.probability) / 100) * Number(d.amount), 0);

  // At-risk deals that need attention
  const atRiskDeals = allDeals.filter(
    (d) =>
      (d.health_status === 'critical' || d.health_status === 'at_risk') &&
      d.stage !== 'closed_won' &&
      d.stage !== 'closed_lost'
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forecasting</h1>
        <p className="text-sm text-gray-500 mt-1">Pipeline analysis and revenue projections</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPipeline)}</p>
                <p className="text-xs text-gray-500 mt-1">{pipelineStages.reduce((s, st) => s + byStage[st].length, 0)} active deals</p>
              </div>
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weighted Forecast</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(weightedForecast)}</p>
                <p className="text-xs text-gray-500 mt-1">Probability-adjusted pipeline</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{winRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {wonDeals} won of {closedTotal} closed
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline by stage */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stageValues.map(({ stage, deals: stageDeals, value, count }) => (
            <div key={stage}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <StageBadge stage={stage} />
                  <span className="text-xs text-gray-500">
                    {count} deal{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(value)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`${STAGE_COLORS[stage]} h-2 rounded-full transition-all`}
                  style={{ width: totalPipeline > 0 ? `${(value / maxValue) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}

          {totalPipeline === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No active deals to display. Add deals to see pipeline analysis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Closed deals summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Closed Won</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byStage.closed_won.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No won deals yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {byStage.closed_won.slice(0, 5).map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 truncate">{deal.company_name}</span>
                    <span className="text-sm font-semibold text-green-600 ml-4 flex-shrink-0">
                      {formatCurrency(Number(deal.amount), deal.currency)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Closed Lost</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byStage.closed_lost.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No lost deals.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {byStage.closed_lost.slice(0, 5).map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate block">{deal.company_name}</span>
                      {deal.lost_reason && (
                        <span className="text-xs text-gray-400 truncate block">{deal.lost_reason}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-red-600 ml-4 flex-shrink-0">
                      {formatCurrency(Number(deal.amount), deal.currency)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* At-risk deals */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <CardTitle>Deals Needing Attention</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {atRiskDeals.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">All deals are on track</p>
              <p className="text-xs text-gray-500 mt-1">No critical or at-risk deals detected.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Health</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Close Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {atRiskDeals.map((deal: Deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <Link href={`/deals/${deal.id}`} className="font-semibold text-gray-900 hover:text-violet-700 transition-colors">
                          {deal.company_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={deal.stage} />
                      </td>
                      <td className="px-4 py-3">
                        <HealthBadge health={deal.health_status} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(Number(deal.amount), deal.currency)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {formatDate(deal.close_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
