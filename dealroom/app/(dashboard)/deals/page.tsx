import { getDeals } from '@/lib/actions/deals';
import { StageBadge, HealthBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Briefcase } from 'lucide-react';
import type { Deal } from '@/types/database';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function AiScorePill({ score }: { score: number }) {
  const s = Number(score);
  if (s < 40) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      {s}%
    </span>
  );
  if (s < 70) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      {s}%
    </span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      {s}%
    </span>
  );
}

export default async function DealsPage() {
  const { data: deals = [], error } = await getDeals();

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
        Failed to load deals: {error}
      </div>
    );
  }

  const allDeals = deals ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-sm text-gray-500 mt-1">
            {allDeals.length} deal{allDeals.length !== 1 ? 's' : ''} in your pipeline
          </p>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </Link>
      </div>

      {/* Deals table */}
      <Card className="overflow-hidden">
        {allDeals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-violet-600" />
            </div>
            <p className="text-base font-semibold text-gray-900">No deals yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              Add your first deal to start tracking with AI.
            </p>
            <Link
              href="/deals/new"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first deal
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Company
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Stage
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    AI Score
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Health
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Close Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                    Next Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allDeals.map((deal: Deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/deals/${deal.id}`} className="block">
                        <p className="font-semibold text-gray-900 hover:text-violet-700 transition-colors">
                          {deal.company_name}
                        </p>
                        {deal.contact_name && (
                          <p className="text-xs text-gray-500 mt-0.5">{deal.contact_name}</p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <StageBadge stage={deal.stage} />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(Number(deal.amount), deal.currency)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <AiScorePill score={Number(deal.ai_score)} />
                    </td>
                    <td className="px-4 py-4">
                      <HealthBadge health={deal.health_status} />
                    </td>
                    <td className="px-4 py-4 text-gray-500 hidden md:table-cell">
                      {formatDate(deal.close_date)}
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      {deal.next_action ? (
                        <p className="text-xs text-gray-600 max-w-xs truncate">{deal.next_action}</p>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
