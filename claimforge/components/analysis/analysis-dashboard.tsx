'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn, formatCurrency, getConfidenceColor, getFraudPatternLabel, getEntityColor, getEntityLabel } from '@/lib/utils';
import {
  AlertTriangle,
  Zap,
  Loader2,
} from 'lucide-react';
import type { FraudPatternType, EntityType, BenfordAnalysis, StatisticalAnomaly, EntityRelationship, Entity } from '@/types/database';
import type { FraudSummaryRow } from '@/lib/actions/analysis';
import { runFullAnalysis } from '@/lib/actions/analysis';

interface AnalysisDashboardProps {
  fraudSummary: FraudSummaryRow[];
  entities: Array<Entity & { connections: number; flagged: boolean }>;
  relationships: EntityRelationship[];
  benford: BenfordAnalysis[];
  anomalies: StatisticalAnomaly[];
  unprocessedDocCount: number;
}

const analysisTabs = ['Fraud Patterns', 'Entity Network', "Benford's Law", 'Statistical Anomalies'];

export function AnalysisDashboard({
  fraudSummary,
  entities,
  relationships,
  benford,
  anomalies,
  unprocessedDocCount,
}: AnalysisDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Fraud Patterns');
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const totalFraud = fraudSummary.reduce((sum, f) => sum + f.total_amount, 0);
  const totalPatterns = fraudSummary.reduce((sum, f) => sum + f.count, 0);

  const handleRunAnalysis = () => {
    setAnalysisResult(null);
    startTransition(async () => {
      const result = await runFullAnalysis();
      if (result.error) {
        setAnalysisResult(`Error: ${result.error}`);
      } else if (result.data) {
        setAnalysisResult(
          `Processed ${result.data.processed} document(s)${result.data.errors > 0 ? `, ${result.data.errors} error(s)` : ''}`
        );
        router.refresh();
      }
    });
  };

  // Build a simple network layout from entities and relationships
  const topEntities = entities.slice(0, 12);
  const entityIdSet = new Set(topEntities.map((e) => e.id));
  const visibleRelationships = relationships.filter(
    (r) => entityIdSet.has(r.source_entity_id) && entityIdSet.has(r.target_entity_id)
  );

  // Assign positions in a circle layout for network graph
  const nodePositions = new Map<string, { x: number; y: number }>();
  topEntities.forEach((e, i) => {
    const angle = (2 * Math.PI * i) / topEntities.length - Math.PI / 2;
    const rx = 300;
    const ry = 150;
    nodePositions.set(e.id, {
      x: 400 + rx * Math.cos(angle),
      y: 200 + ry * Math.sin(angle),
    });
  });

  const getNodeColor = (type: EntityType) => {
    const colors: Record<EntityType, string> = {
      person: '#3B82F6',
      organization: '#B45309',
      payment: '#059669',
      contract: '#8B5CF6',
      location: '#DC2626',
      date: '#6B7280',
    };
    return colors[type] ?? '#6B7280';
  };

  const hasData = fraudSummary.length > 0 || entities.length > 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Analysis</h1>
          <p className="text-xs text-text-tertiary">Cross-case fraud pattern and statistical analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {analysisResult && (
            <span className="text-xs text-text-secondary">{analysisResult}</span>
          )}
          <button
            onClick={handleRunAnalysis}
            disabled={isPending || unprocessedDocCount === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isPending ? 'Analyzing...' : `Run Analysis${unprocessedDocCount > 0 ? ` (${unprocessedDocCount} docs)` : ''}`}
          </button>
        </div>
      </div>

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
        {!hasData && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="h-10 w-10 text-text-tertiary" />
            <h3 className="mt-4 text-sm font-medium text-text-primary">No analysis data yet</h3>
            <p className="mt-1 text-xs text-text-tertiary max-w-sm">
              Upload documents to your cases and run analysis to see fraud patterns, entity networks, and statistical anomalies here.
            </p>
          </div>
        )}

        {/* Fraud Patterns Tab */}
        {activeTab === 'Fraud Patterns' && hasData && (
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
                {fraudSummary.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-text-tertiary">No fraud patterns detected yet.</div>
                )}
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
          </>
        )}

        {/* Entity Network Tab */}
        {activeTab === 'Entity Network' && hasData && (
          <>
            {topEntities.length > 0 ? (
              <div className="rounded-xl border border-border-default bg-bg-surface p-1">
                <svg viewBox="0 0 800 400" className="h-80 w-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#57534E" />
                    </marker>
                  </defs>
                  {/* Edges from real relationships */}
                  {visibleRelationships.map((r) => {
                    const src = nodePositions.get(r.source_entity_id);
                    const tgt = nodePositions.get(r.target_entity_id);
                    if (!src || !tgt) return null;
                    return (
                      <line
                        key={r.id}
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={r.strength > 0.7 ? '#DC2626' : '#44403C'}
                        strokeWidth={r.strength > 0.7 ? 2 : 1.5}
                        strokeDasharray={r.strength > 0.7 ? '4' : undefined}
                        markerEnd="url(#arrowhead)"
                        opacity={0.6 + r.strength * 0.4}
                      />
                    );
                  })}
                  {/* Nodes from real entities */}
                  {topEntities.map((e) => {
                    const pos = nodePositions.get(e.id);
                    if (!pos) return null;
                    const radius = Math.max(14, Math.min(28, 10 + e.connections * 3));
                    const initials = e.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 3);
                    return (
                      <g key={e.id}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          fill={getNodeColor(e.entity_type)}
                          opacity={e.flagged ? 0.9 : 0.6}
                        />
                        {e.flagged && (
                          <circle cx={pos.x} cy={pos.y} r={radius + 3} fill="none" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3" />
                        )}
                        <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">
                          {initials}
                        </text>
                        <text x={pos.x} y={pos.y + radius + 14} textAnchor="middle" fontSize="8" fill="#A8A29E">
                          {e.name.length > 15 ? e.name.slice(0, 15) + '...' : e.name}
                        </text>
                      </g>
                    );
                  })}
                  {/* Legend */}
                  <circle cx="40" cy="370" r="5" fill="#3B82F6" />
                  <text x="52" y="374" fontSize="9" fill="#78716C">Person</text>
                  <rect x="95" y="365" width="10" height="10" rx="2" fill="#B45309" />
                  <text x="112" y="374" fontSize="9" fill="#78716C">Org</text>
                  <circle cx="155" cy="370" r="5" fill="#059669" />
                  <text x="168" y="374" fontSize="9" fill="#78716C">Payment</text>
                  <circle cx="225" cy="370" r="5" fill="#8B5CF6" />
                  <text x="238" y="374" fontSize="9" fill="#78716C">Contract</text>
                  <line x1="290" y1="370" x2="315" y2="370" stroke="#DC2626" strokeWidth="2" strokeDasharray="4" />
                  <text x="322" y="374" fontSize="9" fill="#78716C">Strong Link</text>
                </svg>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center text-xs text-text-tertiary">
                No entities extracted yet. Run analysis on uploaded documents to build the network.
              </div>
            )}

            <div className="rounded-xl border border-border-default bg-bg-surface">
              <div className="border-b border-border-default px-4 py-3">
                <h3 className="legal-heading text-sm text-text-primary">Entity Directory</h3>
              </div>
              <div className="divide-y divide-border-muted">
                {entities.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-text-tertiary">No entities found.</div>
                )}
                {entities.slice(0, 20).map((n) => (
                  <div key={n.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getEntityColor(n.entity_type) }} />
                    <div className="flex-1">
                      <span className="text-sm text-text-primary">{n.name}</span>
                      <span className="ml-2 text-[10px] text-text-tertiary">{getEntityLabel(n.entity_type)}</span>
                    </div>
                    <span className="text-xs text-text-tertiary">{n.connections} connections</span>
                    {n.flagged && <AlertTriangle className="h-3 w-3 text-fraud-red" />}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Benford's Law Tab */}
        {activeTab === "Benford's Law" && hasData && (
          <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <div className="mb-4">
              <h3 className="legal-heading text-sm text-text-primary">First-Digit Frequency Analysis</h3>
              <p className="mt-1 text-xs text-text-secondary">
                Comparing the distribution of leading digits in fraud-related amounts against the expected Benford&apos;s Law distribution.
                Significant deviations may indicate fabricated or manipulated data.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
                {benford.map((d) => {
                  const maxVal = 35;
                  const expectedHeight = (d.expected_frequency / maxVal) * 100;
                  const actualHeight = (d.actual_frequency / maxVal) * 100;
                  return (
                    <div key={d.digit} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-end justify-center gap-1" style={{ height: 180 }}>
                        <div
                          className="w-5 rounded-t bg-primary opacity-40"
                          style={{ height: `${expectedHeight}%` }}
                          title={`Expected: ${d.expected_frequency}%`}
                        />
                        <div
                          className={cn('w-5 rounded-t', d.suspicious ? 'bg-fraud-red' : 'bg-verified-green')}
                          style={{ height: `${actualHeight}%` }}
                          title={`Actual: ${d.actual_frequency}%`}
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

            <div className="rounded-lg border border-border-muted">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-muted text-left text-xs text-text-tertiary">
                    <th className="px-3 py-2 font-medium">Digit</th>
                    <th className="px-3 py-2 font-medium">Expected</th>
                    <th className="px-3 py-2 font-medium">Actual</th>
                    <th className="px-3 py-2 font-medium">Deviation</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {benford.map((d) => (
                    <tr key={d.digit} className={cn(d.suspicious && 'bg-fraud-red-muted')}>
                      <td className="px-3 py-2 financial-figure font-medium text-text-primary">{d.digit}</td>
                      <td className="px-3 py-2 financial-figure text-text-secondary">{d.expected_frequency}%</td>
                      <td className="px-3 py-2 financial-figure text-text-secondary">{d.actual_frequency}%</td>
                      <td className={cn('px-3 py-2 financial-figure font-medium', d.suspicious ? 'text-fraud-red' : 'text-verified-green')}>
                        {d.deviation > 0 ? '+' : ''}{d.deviation}%
                      </td>
                      <td className="px-3 py-2">
                        {d.suspicious ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-fraud-red">
                            <AlertTriangle className="h-3 w-3" /> Anomalous
                          </span>
                        ) : (
                          <span className="text-xs text-verified-green">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistical Anomalies Tab */}
        {activeTab === 'Statistical Anomalies' && hasData && (
          <div className="rounded-xl border border-border-default bg-bg-surface">
            <div className="border-b border-border-default px-4 py-3">
              <h3 className="legal-heading text-sm text-text-primary">Detected Anomalies</h3>
            </div>
            <div className="divide-y divide-border-muted">
              {anomalies.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-text-tertiary">
                  No statistical anomalies detected. More data may reveal patterns.
                </div>
              )}
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
                        <div>
                          <span className="text-text-tertiary">Metric: </span>
                          <span className="text-text-secondary">{a.metric}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Expected: </span>
                          <span className="text-text-secondary">{a.expected_value}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Actual: </span>
                          <span className="financial-figure text-fraud-red">{a.actual_value}</span>
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
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
    </>
  );
}
