'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface FraudScoreData {
  caseId: string;
  caseTitle: string;
  score: number;
  estimatedAmount: number;
  patterns: number;
  status: string;
}

interface FraudScoreChartProps {
  data: FraudScoreData[];
  totalAtRisk: number;
  totalRecovered: number;
  successRate: number;
}

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80 ? '#EF4444' :
    score >= 60 ? '#F97316' :
    score >= 40 ? '#EAB308' :
    '#22C55E';

  const radius = 36;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="56" viewBox="0 0 100 56">
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="-mt-3 text-center">
        <div className="text-2xl font-bold tabular-nums" style={{ color }}>{score}</div>
        <div className="text-[10px] text-[var(--muted-foreground)]">Risk Score</div>
      </div>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">CRITICAL</span>;
  if (score >= 60) return <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">HIGH</span>;
  if (score >= 40) return <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">MEDIUM</span>;
  return <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">LOW</span>;
}

export function FraudScoreChart({ data, totalAtRisk, totalRecovered, successRate }: FraudScoreChartProps) {
  const highRisk = data.filter((d) => d.score >= 60).length;

  const summaryStats = [
    { label: 'At Risk', value: formatCurrency(totalAtRisk), icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Recovered', value: formatCurrency(totalRecovered), icon: DollarSign, color: 'text-green-400' },
    { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'High Risk Cases', value: String(highRisk), icon: Activity, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <span className="text-xs text-[var(--muted-foreground)]">{s.label}</span>
            </div>
            <div className={cn('text-xl font-bold tabular-nums', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Case fraud scores */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
          Case Fraud Score Heatmap
        </h3>
        {data.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted-foreground)] py-8">No cases to display</p>
        ) : (
          <div className="space-y-3">
            {data
              .sort((a, b) => b.score - a.score)
              .map((item) => (
                <div key={item.caseId} className="flex items-center gap-4">
                  <div className="w-36 flex-shrink-0">
                    <div className="truncate text-xs font-medium">{item.caseTitle}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RiskBadge score={item.score} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-[10px] text-[var(--muted-foreground)]">
                      <span>{item.patterns} patterns</span>
                      <span>{formatCurrency(item.estimatedAmount)}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          item.score >= 80 ? 'bg-red-500' :
                          item.score >= 60 ? 'bg-orange-500' :
                          item.score >= 40 ? 'bg-yellow-500' :
                          'bg-green-500',
                        )}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-10 text-right text-sm font-bold tabular-nums">{item.score}</div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Score distribution */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="mb-4 text-sm font-semibold">Score Distribution</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Critical (80+)', count: data.filter((d) => d.score >= 80).length, color: 'text-red-400 bg-red-500/10' },
            { label: 'High (60-79)', count: data.filter((d) => d.score >= 60 && d.score < 80).length, color: 'text-orange-400 bg-orange-500/10' },
            { label: 'Medium (40-59)', count: data.filter((d) => d.score >= 40 && d.score < 60).length, color: 'text-yellow-400 bg-yellow-500/10' },
            { label: 'Low (<40)', count: data.filter((d) => d.score < 40).length, color: 'text-green-400 bg-green-500/10' },
          ].map(({ label, count, color }) => (
            <div key={label} className={cn('rounded-xl p-3', color.split(' ')[1])}>
              <div className={cn('text-2xl font-bold tabular-nums', color.split(' ')[0])}>{count}</div>
              <div className="mt-1 text-[10px] text-[var(--muted-foreground)] leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
