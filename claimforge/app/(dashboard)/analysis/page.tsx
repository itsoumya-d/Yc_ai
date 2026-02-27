'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { NetworkGraph } from '@/components/cases/network-graph';
import { getNetworkData } from '@/lib/actions/network';
import { computeBenfordAnalysis, type BenfordResult } from '@/lib/actions/benford';
import { cn, formatCurrency, getFraudPatternLabel, getEntityColor, getEntityLabel } from '@/lib/utils';
import { AlertTriangle, Zap } from 'lucide-react';
import type { FraudPatternType, NetworkNode, NetworkEdge } from '@/types/database';

const analysisTabs = ['Fraud Patterns', 'Entity Network', "Benford's Law", 'Statistical Anomalies'];

// ── Static demo data (fraud patterns + anomalies) ─────────────────────────
const fraudSummary: Array<{
  type: FraudPatternType;
  count: number;
  total_amount: number;
  avg_confidence: number;
}> = [
  { type: 'overbilling', count: 12, total_amount: 1_240_000, avg_confidence: 0.87 },
  { type: 'duplicate_billing', count: 8, total_amount: 890_000, avg_confidence: 0.92 },
  { type: 'upcoding', count: 6, total_amount: 560_000, avg_confidence: 0.78 },
  { type: 'phantom_vendor', count: 3, total_amount: 450_000, avg_confidence: 0.65 },
  { type: 'round_number', count: 15, total_amount: 320_000, avg_confidence: 0.45 },
  { type: 'time_anomaly', count: 4, total_amount: 180_000, avg_confidence: 0.72 },
  { type: 'unbundling', count: 2, total_amount: 95_000, avg_confidence: 0.58 },
  { type: 'quality_substitution', count: 1, total_amount: 75_000, avg_confidence: 0.41 },
];

const anomalies = [
  { id: 'a1', description: 'Invoice amounts cluster around $999 threshold', metric: 'Amount Distribution', expected: 'Normal', actual: 'Bimodal at $999', significance: 'high' as const },
  { id: 'a2', description: 'Billing frequency spikes at end of fiscal quarters', metric: 'Temporal Distribution', expected: 'Uniform', actual: '+340% Q4 spike', significance: 'high' as const },
  { id: 'a3', description: 'Vendor payment amounts show unusual rounding', metric: 'Digit Distribution', expected: 'Random last digits', actual: '67% end in 00', significance: 'medium' as const },
  { id: 'a4', description: 'Same-day submissions from different facilities', metric: 'Submission Timing', expected: '<5% overlap', actual: '23% overlap', significance: 'medium' as const },
  { id: 'a5', description: 'Service codes inconsistent with provider specialty', metric: 'Code Validity', expected: '95%+ match', actual: '72% match', significance: 'low' as const },
];

// Fallback Benford data for demo / no live data
const FALLBACK_BENFORD = [
  { digit: 1, expected: 30.1, actual: 22.4, suspicious: true, count: 0 },
  { digit: 2, expected: 17.6, actual: 18.2, suspicious: false, count: 0 },
  { digit: 3, expected: 12.5, actual: 11.8, suspicious: false, count: 0 },
  { digit: 4, expected: 9.7, actual: 15.3, suspicious: true, count: 0 },
  { digit: 5, expected: 7.9, actual: 12.1, suspicious: true, count: 0 },
  { digit: 6, expected: 6.7, actual: 5.9, suspicious: false, count: 0 },
  { digit: 7, expected: 5.8, actual: 4.2, suspicious: false, count: 0 },
  { digit: 8, expected: 5.1, actual: 5.8, suspicious: false, count: 0 },
  { digit: 9, expected: 4.6, actual: 4.3, suspicious: false, count: 0 },
];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('Fraud Patterns');

  // Entity network state (lazy-loaded on tab visit)
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkEdges, setNetworkEdges] = useState<NetworkEdge[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkLoaded, setNetworkLoaded] = useState(false);

  // Benford state (lazy-loaded on tab visit)
  const [benfordResult, setBenfordResult] = useState<BenfordResult | null>(null);
  const [benfordLoading, setBenfordLoading] = useState(false);
  const [benfordLoaded, setBenfordLoaded] = useState(false);

  useEffect(() => {
    if (activeTab !== 'Entity Network' || networkLoaded) return;
    setNetworkLoading(true);
    getNetworkData().then(res => {
      if (res.data) { setNetworkNodes(res.data.nodes); setNetworkEdges(res.data.edges); }
      setNetworkLoading(false);
      setNetworkLoaded(true);
    });
  }, [activeTab, networkLoaded]);

  useEffect(() => {
    if (activeTab !== "Benford's Law" || benfordLoaded) return;
    setBenfordLoading(true);
    computeBenfordAnalysis().then(res => {
      if (res.data) setBenfordResult(res.data);
      setBenfordLoading(false);
      setBenfordLoaded(true);
    });
  }, [activeTab, benfordLoaded]);

  const totalFraud = fraudSummary.reduce((s, f) => s + f.total_amount, 0);
  const totalPatterns = fraudSummary.reduce((s, f) => s + f.count, 0);

  const benfordData = benfordResult?.digitData ?? FALLBACK_BENFORD;
  const isLiveBenford = benfordResult !== null && benfordResult.totalAmounts > 0;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Analysis" subtitle="Cross-case fraud pattern and statistical analysis">
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

        {/* ── Fraud Patterns Tab ─────────────────────────────────────────── */}
        {activeTab === 'Fraud Patterns' && (
          <>
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
                          <div className="h-2 rounded-full bg-fraud-red transition-all" style={{ width: `${pct * 100}%` }} />
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
          </>
        )}

        {/* ── Entity Network Tab ─────────────────────────────────────────── */}
        {activeTab === 'Entity Network' && (
          <>
            <NetworkGraph nodes={networkNodes} edges={networkEdges} loading={networkLoading} />

            {!networkLoading && networkNodes.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Entity Directory</h3>
                </div>
                <div className="divide-y divide-border-muted">
                  {networkNodes.map((n) => (
                    <div key={n.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: getEntityColor(n.type) }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-text-primary truncate block">{n.label}</span>
                        <span className="text-[10px] text-text-tertiary">{getEntityLabel(n.type)}</span>
                      </div>
                      <span className="text-xs text-text-tertiary shrink-0">
                        {networkEdges.filter(e => e.source === n.id || e.target === n.id).length} connections
                      </span>
                      {n.flagged && <AlertTriangle className="h-3.5 w-3.5 text-fraud-red shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!networkLoading && networkNodes.length === 0 && networkLoaded && (
              <div className="rounded-xl border border-border-default bg-bg-surface px-4 py-8 text-center">
                <p className="text-sm text-text-secondary">No entity data available</p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Upload and analyze documents in active cases to populate the entity network.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Benford's Law Tab ──────────────────────────────────────────── */}
        {activeTab === "Benford's Law" && (
          <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="legal-heading text-sm text-text-primary">First-Digit Frequency Analysis</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Comparing the distribution of leading digits in billing amounts against the expected Benford distribution.
                  Significant deviations may indicate fabricated or manipulated data.
                </p>
              </div>
              {isLiveBenford && benfordResult && (
                <div className="shrink-0 text-right">
                  <div className="text-[10px] text-text-tertiary">χ² Statistic</div>
                  <div className={cn(
                    'financial-figure text-xl font-semibold',
                    benfordResult.fraudIndicator === 'high' ? 'text-fraud-red' :
                    benfordResult.fraudIndicator === 'medium' ? 'text-warning' : 'text-verified-green',
                  )}>
                    {benfordResult.chiSquare}
                  </div>
                  <div className={cn('text-[10px] font-semibold uppercase tracking-wider',
                    benfordResult.fraudIndicator === 'high' ? 'text-fraud-red' :
                    benfordResult.fraudIndicator === 'medium' ? 'text-warning' : 'text-verified-green',
                  )}>
                    {benfordResult.fraudIndicator} risk
                  </div>
                </div>
              )}
            </div>

            {benfordLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Bar Chart */}
                <div className="mb-6">
                  <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
                    {benfordData.map((d) => {
                      const maxVal = 35;
                      return (
                        <div key={d.digit} className="flex flex-1 flex-col items-center gap-1">
                          <div className="flex w-full items-end justify-center gap-1" style={{ height: 180 }}>
                            <div
                              className="w-5 rounded-t bg-primary opacity-40"
                              style={{ height: `${(d.expected / maxVal) * 100}%` }}
                              title={`Expected: ${d.expected}%`}
                            />
                            <div
                              className={cn('w-5 rounded-t', d.suspicious ? 'bg-fraud-red' : 'bg-verified-green')}
                              style={{ height: `${(d.actual / maxVal) * 100}%` }}
                              title={`Actual: ${d.actual}%`}
                            />
                          </div>
                          <span className="text-xs font-medium text-text-secondary">{d.digit}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-6 text-[10px] text-text-tertiary">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-primary opacity-40" />
                      <span>Expected (Benford)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-verified-green" />
                      <span>Actual (Normal)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-fraud-red" />
                      <span>Actual (Suspicious)</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-border-muted">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-muted text-left text-xs text-text-tertiary">
                        <th className="px-3 py-2 font-medium">Digit</th>
                        <th className="px-3 py-2 font-medium">Expected</th>
                        <th className="px-3 py-2 font-medium">Actual</th>
                        <th className="px-3 py-2 font-medium">Deviation</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        {isLiveBenford && <th className="px-3 py-2 font-medium">Count</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-muted">
                      {benfordData.map((d) => (
                        <tr key={d.digit} className={cn(d.suspicious && 'bg-fraud-red-muted')}>
                          <td className="px-3 py-2 financial-figure font-medium text-text-primary">{d.digit}</td>
                          <td className="px-3 py-2 financial-figure text-text-secondary">{d.expected}%</td>
                          <td className="px-3 py-2 financial-figure text-text-secondary">{d.actual}%</td>
                          <td className={cn('px-3 py-2 financial-figure font-medium', d.suspicious ? 'text-fraud-red' : 'text-verified-green')}>
                            {d.actual > d.expected ? '+' : ''}{(d.actual - d.expected).toFixed(1)}%
                          </td>
                          <td className="px-3 py-2">
                            {d.suspicious
                              ? <span className="inline-flex items-center gap-1 text-xs font-medium text-fraud-red"><AlertTriangle className="h-3 w-3" /> Anomalous</span>
                              : <span className="text-xs text-verified-green">Normal</span>
                            }
                          </td>
                          {isLiveBenford && <td className="px-3 py-2 financial-figure text-text-tertiary">{d.count}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isLiveBenford && benfordResult && (
                  <p className="mt-3 text-[10px] text-text-tertiary">
                    Analysis based on {benfordResult.totalAmounts} amount samples. χ² critical values: p=0.05 → 15.507, p=0.01 → 20.09 (8 df).
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Statistical Anomalies Tab ──────────────────────────────────── */}
        {activeTab === 'Statistical Anomalies' && (
          <div className="rounded-xl border border-border-default bg-bg-surface">
            <div className="border-b border-border-default px-4 py-3">
              <h3 className="legal-heading text-sm text-text-primary">Detected Anomalies</h3>
            </div>
            <div className="divide-y divide-border-muted">
              {anomalies.map((a) => (
                <div key={a.id} className="px-4 py-4 transition-colors hover:bg-bg-surface-raised">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn(
                          'h-4 w-4',
                          a.significance === 'high' ? 'text-fraud-red' : a.significance === 'medium' ? 'text-warning' : 'text-text-tertiary',
                        )} />
                        <span className="text-sm font-medium text-text-primary">{a.description}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                        <div><span className="text-text-tertiary">Metric: </span><span className="text-text-secondary">{a.metric}</span></div>
                        <div><span className="text-text-tertiary">Expected: </span><span className="text-text-secondary">{a.expected}</span></div>
                        <div><span className="text-text-tertiary">Actual: </span><span className="financial-figure text-fraud-red">{a.actual}</span></div>
                      </div>
                    </div>
                    <span className={cn(
                      'ml-4 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      a.significance === 'high' ? 'bg-fraud-red-muted text-fraud-red' :
                      a.significance === 'medium' ? 'bg-warning-muted text-warning' :
                      'bg-bg-surface-raised text-text-tertiary',
                    )}>
                      {a.significance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
