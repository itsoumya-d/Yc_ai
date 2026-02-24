import { getDeals } from '@/lib/actions/deals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthBadge, StageBadge } from '@/components/ui/badge';
import Link from 'next/link';
import { DollarSign, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import type { Deal } from '@/types/database';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function DashboardPage() {
  const { data: deals = [], error } = await getDeals();

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
        Failed to load deals: {error}
      </div>
    );
  }

  const allDeals = deals ?? [];

  // Compute stats
  const activeDeals = allDeals.filter((d) => d.stage !== 'closed_lost');
  const totalPipeline = activeDeals.reduce((sum, d) => sum + Number(d.amount), 0);

  const atRiskDeals = allDeals.filter(
    (d) => d.health_status === 'critical' || d.health_status === 'at_risk'
  );

  const avgAiScore =
    allDeals.length > 0
      ? Math.round(allDeals.reduce((sum, d) => sum + Number(d.ai_score), 0) / allDeals.length)
      : 0;

  const wonDeals = allDeals.filter((d) => d.stage === 'closed_won').length;
  const closedDeals = allDeals.filter(
    (d) => d.stage === 'closed_won' || d.stage === 'closed_lost'
  ).length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  // Top 5 at-risk deals
  const topAtRisk = atRiskDeals.slice(0, 5);

  const statCards = [
    {
      title: 'Total Pipeline',
      value: formatCurrency(totalPipeline),
      icon: DollarSign,
      description: `${activeDeals.length} active deal${activeDeals.length !== 1 ? 's' : ''}`,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'At-Risk Deals',
      value: atRiskDeals.length.toString(),
      icon: AlertTriangle,
      description: 'Need immediate attention',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Avg AI Score',
      value: `${avgAiScore}%`,
      icon: TrendingUp,
      description: 'Across all deals',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Win Rate',
      value: `${winRate}%`,
      icon: Target,
      description: `${wonDeals} of ${closedDeals} closed deals`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your AI-powered sales overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* At-risk deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>At-Risk Deals</CardTitle>
          <Link
            href="/deals"
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            View all deals
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {topAtRisk.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">No at-risk deals</p>
              <p className="text-xs text-gray-500 mt-1">All your deals are looking healthy!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topAtRisk.map((deal: Deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {deal.company_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {deal.contact_name || 'No contact'} &middot; Close: {formatDate(deal.close_date)}
                    </p>
                    {deal.next_action && (
                      <p className="text-xs text-violet-600 mt-1 truncate">
                        Next: {deal.next_action}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <StageBadge stage={deal.stage} />
                    <HealthBadge health={deal.health_status} />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(deal.amount), deal.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
