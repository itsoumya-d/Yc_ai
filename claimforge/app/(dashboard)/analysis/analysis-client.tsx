'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, getConfidenceColor, getFraudPatternLabel, getEntityColor, getEntityLabel } from '@/lib/utils';
import {
  Search,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import type { Entity, FraudPattern, FraudPatternType } from '@/types/database';

const analysisTabs = ['Fraud Patterns', 'Entity Network', "Benford's Law", 'Statistical Anomalies'];

interface FraudSummaryRow {
  type: FraudPatternType;
  count: number;
  total_amount: number;
  avg_confidence: number;
}

function buildFraudSummary(patterns: FraudPattern[]): FraudSummaryRow[] {
  const map = new Map<FraudPatternType, { count: number; total_amount: number; confidence_sum: number }>();

  for (const p of patterns) {
    const existing = map.get(p.pattern_type);
    if (existing) {
      existing.count += 1;
      existing.total_amount += p.affected_amount;
      existing.confidence_sum += p.confidence;
    } else {
      map.set(p.pattern_type, { count: 1, total_amount: p.affected_amount, confidence_sum: p.confidence });
    }
  }

  return Array.from(map.entries()).map(([type, stats]) => ({
    type,
    count: stats.count,
    total_amount: stats.total_amount,
    avg_confidence: stats.count > 0 ? stats.confidence_sum / stats.count : 0,
  }));
}

// Static Benford's expected frequencies (these are mathematical constants, not mock data)
const benfordExpected = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];

interface AnalysisClientProps {
  entities: Entity[];
  patterns: FraudPattern[];
  caseTitle?: string;
}

export function AnalysisClient({ entities, patterns, caseTitle }: AnalysisClientProps) {
  const [activeTab, setActiveTab] = useState('Fraud Patterns');

  const fraudSummary = buildFraudSummary(patterns);
  const totalFraud = fraudSummary.reduce((sum, f) => sum + f.total_amount, 0);
  const totalPatterns = fraudSummary.reduce((sum, f) => sum + f.count, 0);

  const isEmpty = patterns.length === 0 && entities.length === 0;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Analysis"
        subtitle={caseTitle ? `Fraud pattern and statistical analysis — ${caseTitle}` : 'Cross-case fraud pattern and statistical analysis'}
      >
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
          <Zap className="h-4 w-4" />
          Run Full Analysis
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-default px-6 py-1.5">
        {analysisTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs transition-colors',
              activeTab === tab
                ? 'bg-bg-surface-hover text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* Empty state */}
        {isEmpty && (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
            <div className="text-center">
              <Search className="mx-auto h-8 w-8 text-text-tertiary" />
              <p className="mt-2 text-sm text-text-tertiary">No analysis data yet. Upload and analyze documents to detect fraud patterns.</p>
            </div>
          </div>
        )}

        {/* Fraud Patterns Tab */}
        {!isEmpty && activeTab === 'Fraud Patterns' && (
          <>
            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Total Fraud Detected</div>
                <div className="financial-figure mt-1 text-2xl font-semibold text-fraud-red">{formatCurrency(totalFraud)}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Patterns Identified</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{totalPatterns}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Pattern Types Active</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{fraudSummary.length}</div>
              </div>
            </div>

            {/* Pattern Breakdown */}
            {fraudSummary.length > 0 ? (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Pattern Breakdown</h3>
                </div>
                <div className="divide-y divide-border-muted">
                  {fraudSummary.map((f) => {
                    const pct = totalFraud > 0 ? f.total_amount / totalFraud : 0;
                    return (
                      <div key={f.type} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                        <div className="w-40">
                          <div className="text-sm font-medium text-text-primary">{getFraudPatternLabel(f.type)}</div>
                          <div className="text-[10px] text-text-tertiary">{f.count} instances</div>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-bg-surface-raised">
                            <div
                              className="h-2 rounded-full bg-fraud-red transition-all"
                              style={{ width: `${pct * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right">
                          <div className="financial-figure text-sm font-medium text-fraud-red">{formatCurrency(f.total_amount)}</div>
                          <div className="text-[10px] text-text-tertiary">{(pct * 100).toFixed(1)}%</div>
                        </div>
                        <div className="w-20 text-right">
                          <div className="financial-figure text-xs text-text-secondary">{(f.avg_confidence * 100).toFixed(0)}%</div>
                          <div className="text-[10px] text-text-tertiary">confidence</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <p className="text-sm text-text-tertiary">No fraud patterns detected for this case.</p>
              </div>
            )}
          </>
        )}

        {/* Entity Network Tab */}
        {!isEmpty && activeTab === 'Entity Network' && (
          <>
            {/* Entity List */}
            <div className="rounded-xl border border-border-default bg-bg-surface">
              <div className="border-b border-border-default px-4 py-3">
                <h3 className="legal-heading text-sm text-text-primary">Entity Directory ({entities.length})</h3>
              </div>
              {entities.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-sm text-text-tertiary">No entities extracted yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border-muted">
                  {entities.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getEntityColor(e.entity_type) }} />
                      <div className="flex-1">
                        <span className="text-sm text-text-primary">{e.name}</span>
                        <span className="ml-2 text-[10px] text-text-tertiary">{getEntityLabel(e.entity_type)}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">{e.mention_count} mentions</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Benford's Law Tab */}
        {!isEmpty && activeTab === "Benford's Law" && (
          <>
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <div className="mb-4">
                <h3 className="legal-heading text-sm text-text-primary">First-Digit Frequency Analysis</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Comparing the distribution of leading digits in billing amounts against the expected Benford distribution.
                  Significant deviations may indicate fabricated or manipulated data.
                </p>
              </div>

              {/* Expected frequencies table (static mathematical reference) */}
              <div className="rounded-lg border border-border-muted">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-muted text-left text-xs text-text-tertiary">
                      <th className="px-3 py-2 font-medium">Digit</th>
                      <th className="px-3 py-2 font-medium">Benford Expected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {benfordExpected.map((expected, i) => (
                      <tr key={i + 1}>
                        <td className="px-3 py-2 financial-figure font-medium text-text-primary">{i + 1}</td>
                        <td className="px-3 py-2 financial-figure text-text-secondary">{expected}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-text-tertiary">
                Upload and analyze financial documents to compute actual digit distribution for comparison.
              </p>
            </div>
          </>
        )}

        {/* Statistical Anomalies Tab */}
        {!isEmpty && activeTab === 'Statistical Anomalies' && (
          <div className="rounded-xl border border-border-default bg-bg-surface">
            <div className="border-b border-border-default px-4 py-3">
              <h3 className="legal-heading text-sm text-text-primary">Detected Anomalies</h3>
            </div>
            {patterns.filter((p) => p.confidence_level === 'critical' || p.confidence_level === 'high').length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-text-tertiary">No high-significance anomalies detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-muted">
                {patterns
                  .filter((p) => p.confidence_level === 'critical' || p.confidence_level === 'high')
                  .map((p) => (
                    <div key={p.id} className="px-4 py-4 transition-colors hover:bg-bg-surface-raised">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={cn(
                              'h-4 w-4',
                              p.confidence_level === 'critical' || p.confidence_level === 'high'
                                ? 'text-fraud-red'
                                : 'text-warning',
                            )} />
                            <span className="text-sm font-medium text-text-primary">{p.description}</span>
                          </div>
                          <div className="mt-2 text-xs text-text-secondary">{p.evidence_summary}</div>
                        </div>
                        <span className={cn(
                          'ml-4 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          p.confidence_level === 'critical' || p.confidence_level === 'high'
                            ? 'bg-fraud-red-muted text-fraud-red'
                            : 'bg-warning-muted text-warning',
                        )}>
                          {p.confidence_level}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
