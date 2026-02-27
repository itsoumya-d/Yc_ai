import { getDeal } from '@/lib/actions/deals';
import { getActivities } from '@/lib/actions/activities';
import { analyzeDeal } from '@/lib/actions/ai';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StageBadge, HealthBadge } from '@/components/ui/badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Users,
  FileText,
  CheckSquare,
  DollarSign,
  Calendar,
  Brain,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import type { DealActivity, ActivityType } from '@/types/database';

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Users,
  note: FileText,
  task: CheckSquare,
};

const activityColors: Record<ActivityType, string> = {
  email: 'bg-blue-100 text-blue-600',
  call: 'bg-green-100 text-green-600',
  meeting: 'bg-purple-100 text-purple-600',
  note: 'bg-gray-100 text-gray-600',
  task: 'bg-amber-100 text-amber-600',
};

function AiScoreBar({ score }: { score: number }) {
  const s = Number(score);
  const color = s < 40 ? 'bg-red-500' : s < 70 ? 'bg-amber-500' : 'bg-green-500';
  const textColor = s < 40 ? 'text-red-700' : s < 70 ? 'text-amber-700' : 'text-green-700';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">AI Score</span>
        <span className={`text-sm font-bold ${textColor}`}>{s}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(100, s)}%` }}
        />
      </div>
    </div>
  );
}

async function AnalyzeDealForm({ dealId }: { dealId: string }) {
  async function handleAnalyze() {
    'use server';
    await analyzeDeal(dealId);
    redirect(`/deals/${dealId}`);
  }

  return (
    <form action={handleAnalyze}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Brain className="w-4 h-4" />
        Analyze with AI
      </button>
    </form>
  );
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: deal, error: dealError }, { data: activities }] = await Promise.all([
    getDeal(id),
    getActivities(id),
  ]);

  // Fetch latest prediction
  const supabase = await createClient();
  const { data: prediction } = await supabase
    .from('ai_predictions')
    .select('*')
    .eq('deal_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dealError || !deal) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
        Deal not found or access denied.
      </div>
    );
  }

  const allActivities = activities ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/deals"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-0.5 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{deal.company_name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StageBadge stage={deal.stage} />
              <HealthBadge health={deal.health_status} />
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(Number(deal.amount), deal.currency)}
              </span>
            </div>
          </div>
        </div>
        <AnalyzeDealForm dealId={id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Deal overview */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AiScoreBar score={Number(deal.ai_score)} />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Contact</p>
                  <p className="text-sm font-medium text-gray-900">
                    {deal.contact_name || '—'}
                  </p>
                  {deal.contact_email && (
                    <a
                      href={`mailto:${deal.contact_email}`}
                      className="text-xs text-violet-600 hover:underline"
                    >
                      {deal.contact_email}
                    </a>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Expected Close</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(deal.close_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Deal Value</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(Number(deal.amount), deal.currency)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Win Probability</p>
                  <p className="text-sm font-medium text-gray-900">{Number(deal.probability).toFixed(0)}%</p>
                </div>
              </div>

              {deal.description && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>
                </div>
              )}

              {deal.next_action && (
                <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-violet-700 mb-0.5">Next Action</p>
                  <p className="text-sm text-violet-900">{deal.next_action}</p>
                  {deal.next_action_due && (
                    <p className="text-xs text-violet-600 mt-1">Due: {formatDate(deal.next_action_due)}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {allActivities.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-gray-500">No activities recorded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Activities will appear here after running AI analysis or adding them manually.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {allActivities.map((activity: DealActivity) => {
                    const Icon = activityIcons[activity.activity_type] ?? FileText;
                    const colorClass = activityColors[activity.activity_type] ?? 'bg-gray-100 text-gray-600';
                    return (
                      <div key={activity.id} className="flex gap-4 px-6 py-4">
                        <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-400 flex-shrink-0">
                              {formatDateTime(activity.occurred_at)}
                            </p>
                          </div>
                          {activity.body && (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{activity.body}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1 capitalize">{activity.activity_type}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* AI Prediction */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-600" />
                AI Analysis
              </CardTitle>
              {prediction?.created_at && (
                <span className="text-xs text-gray-400">
                  {formatDate(prediction.created_at)}
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!prediction ? (
                <div className="text-center py-4">
                  <Brain className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-2">No AI analysis yet</p>
                  <p className="text-xs text-gray-400">
                    Click &quot;Analyze with AI&quot; to get deal insights.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  {prediction.analysis_summary && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {prediction.analysis_summary}
                    </p>
                  )}

                  {/* Close probability */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Close Probability</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-violet-600 h-1.5 rounded-full"
                          style={{ width: `${prediction.close_probability}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-violet-700">
                        {prediction.close_probability}%
                      </span>
                    </div>
                  </div>

                  {/* Risk factors */}
                  {prediction.risk_factors?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Risk Factors
                      </p>
                      <ul className="space-y-1.5">
                        {prediction.risk_factors.map((risk: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next actions */}
                  {prediction.next_actions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-green-500" />
                        Recommended Actions
                      </p>
                      <ul className="space-y-1.5">
                        {prediction.next_actions.map((action: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Deal meta */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900 font-medium">{formatDate(deal.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Updated</span>
                <span className="text-gray-900 font-medium">{formatDate(deal.updated_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Currency</span>
                <span className="text-gray-900 font-medium">{deal.currency}</span>
              </div>
              {deal.lost_reason && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Lost Reason</p>
                  <p className="text-sm text-red-700">{deal.lost_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
