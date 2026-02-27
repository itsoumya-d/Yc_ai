'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency, getDealScoreBg, daysUntil, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Brain, Filter } from 'lucide-react';
import type { DealStage } from '@/types';

const STAGES: { stage: DealStage; label: string }[] = [
  { stage: 'prospecting', label: 'Prospecting' },
  { stage: 'qualified', label: 'Qualified' },
  { stage: 'proposal', label: 'Proposal' },
  { stage: 'negotiation', label: 'Negotiation' },
];

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-win/10 border-win/20',
  at_risk: 'bg-warning/10 border-warning/20',
  critical: 'bg-risk/10 border-risk/20',
  stalled: 'bg-border border-border',
};

const HEALTH_DOT: Record<string, string> = { healthy: 'bg-win', at_risk: 'bg-warning', critical: 'bg-risk', stalled: 'bg-text-tertiary' };

export default function PipelinePage() {
  const { deals } = useAppStore();
  const openDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');

  return (
    <div className="p-8 max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
          <p className="text-sm text-text-secondary mt-1">{formatCurrency(openDeals.reduce((s, d) => s + d.value, 0))} total pipeline · {openDeals.length} deals</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-2"><Brain className="h-4 w-4" />Add Deal</button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-4 pb-4 overflow-x-auto">
        {STAGES.map(({ stage, label }) => {
          const stageDeals = openDeals.filter(d => d.stage === stage);
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage} className="min-w-56">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-primary uppercase tracking-wide">{label}</p>
                  <p className="text-xs text-text-tertiary">{stageDeals.length} deals · {formatCurrency(stageValue)}</p>
                </div>
              </div>
              <div className="space-y-3">
                {stageDeals.map((deal) => {
                  const days = daysUntil(deal.close_date);
                  return (
                    <Link key={deal.id} href={`/pipeline/${deal.id}`} className={`block rounded-xl border p-4 transition-all hover:shadow-lg hover:shadow-black/20 ${HEALTH_COLORS[deal.health]}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${HEALTH_DOT[deal.health]}`} />
                          <p className="text-xs font-semibold text-text-primary line-clamp-2">{deal.name}</p>
                        </div>
                        <div className={`rounded-full px-2 py-0.5 text-xs font-bold shrink-0 ${getDealScoreBg(deal.ai_score)}`}>{deal.ai_score}</div>
                      </div>
                      <p className="text-xs text-text-secondary mb-2">{deal.company}</p>
                      <p className="text-sm font-bold text-text-primary mb-2">{formatCurrency(deal.value)}</p>
                      <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                        <span>{deal.owner.split(' ')[0]}</span>
                        <span className={days < 7 ? 'text-risk font-medium' : days < 21 ? 'text-warning font-medium' : ''}>
                          {days > 0 ? `${days}d` : 'Overdue'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
