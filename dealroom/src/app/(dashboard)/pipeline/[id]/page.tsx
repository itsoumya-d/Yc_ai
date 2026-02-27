'use client';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency, getDealScoreBg, getDealScoreColor, formatDate, daysUntil } from '@/lib/utils';
import { Brain, ArrowLeft, Zap, Clock, Users, DollarSign, Mail, Phone, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const STAGE_ORDER = ['prospecting', 'qualified', 'proposal', 'negotiation', 'closed_won'];

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { deals, activities, updateDealStage } = useAppStore();
  const deal = deals.find(d => d.id === id);
  const dealActivities = activities.filter(a => a.deal_id === id);

  if (!deal) return <div className="p-8 text-text-secondary">Deal not found.</div>;

  const days = daysUntil(deal.close_date);
  const currentStageIdx = STAGE_ORDER.indexOf(deal.stage);

  const ACTIVITY_ICONS: Record<string, typeof Mail> = { email: Mail, call: Phone, meeting: Calendar, note: Clock, stage_change: ChevronRight };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <Link href="/pipeline" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-2">
        <ArrowLeft className="h-4 w-4" />Back to Pipeline
      </Link>

      {/* Header */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{deal.name}</h1>
            <p className="text-sm text-text-secondary">{deal.company}</p>
          </div>
          <div className={`rounded-full px-3 py-1.5 text-lg font-bold ${getDealScoreBg(deal.ai_score)}`}>{deal.ai_score}</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-bg-root p-3 text-center">
            <p className="text-xl font-bold text-text-primary">{formatCurrency(deal.value)}</p>
            <p className="text-xs text-text-tertiary">Deal Value</p>
          </div>
          <div className="rounded-lg bg-bg-root p-3 text-center">
            <p className={`text-xl font-bold ${days < 7 ? 'text-risk' : days < 21 ? 'text-warning' : 'text-text-primary'}`}>{days > 0 ? `${days}d` : 'Overdue'}</p>
            <p className="text-xs text-text-tertiary">To Close Date</p>
          </div>
          <div className="rounded-lg bg-bg-root p-3 text-center">
            <p className="text-xl font-bold text-text-primary">{deal.contacts}</p>
            <p className="text-xs text-text-tertiary">Contacts Engaged</p>
          </div>
        </div>

        {/* Stage pipeline */}
        <div>
          <p className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">Stage</p>
          <div className="flex gap-1">
            {STAGE_ORDER.slice(0, 4).map((s, i) => (
              <button
                key={s}
                onClick={() => updateDealStage(deal.id, s as any)}
                className={`flex-1 rounded py-1.5 text-xs font-medium transition-all ${i <= currentStageIdx ? 'bg-primary text-white' : 'bg-border text-text-tertiary hover:bg-border-emphasis'}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      {deal.ai_insight && (
        <div className="rounded-xl border border-intel/30 bg-intel/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-intel/20">
              <Brain className="h-4 w-4 text-intel" />
            </div>
            <div>
              <p className="text-xs font-semibold text-intel mb-1">AI Deal Intelligence</p>
              <p className="text-sm text-text-secondary leading-relaxed">{deal.ai_insight}</p>
            </div>
          </div>
          {deal.next_action && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-intel/10 p-3">
              <Zap className="h-4 w-4 text-intel shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-intel">Recommended Next Action</p>
                <p className="text-sm text-text-primary">{deal.next_action}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Activity Timeline</h2>
        {dealActivities.length === 0 ? (
          <p className="text-sm text-text-tertiary">No activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {dealActivities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || Clock;
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-root">
                    <Icon className="h-4 w-4 text-text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-text-tertiary mb-0.5 flex items-center gap-2 capitalize">
                      {activity.type.replace('_', ' ')} · {activity.author} · {formatDate(activity.created_at)}
                    </p>
                    <p className="text-sm text-text-secondary">{activity.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
