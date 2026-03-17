'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, getConfidenceColor, getFraudPatternLabel, getEntityColor, getEntityLabel, formatPercentage } from '@/lib/utils';
import {
  BarChart3,
  Network,
  TrendingUp,
  Search,
  AlertTriangle,
  PieChart,
  Activity,
  Eye,
  Zap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  ListChecks,
  FileText,
} from 'lucide-react';
import type { CrossAnalysisData } from '@/lib/actions/analysis';

const analysisTabs = ['AI Summary', 'Fraud Patterns', 'Entity Network', "Benford's Law", 'Statistical Anomalies'];

// ── Types ──────────────────────────────────────────────────────────────────

interface Citation {
  id: string;
  label: string;
  href: string;
}

interface KeyFinding {
  id: number;
  severity: 'critical' | 'high' | 'medium';
  finding: string;
  citations: Citation[];
}

// ── Hardcoded anomalies (not critical path) ────────────────────────────────

const anomalies = [
  { id: 'a1', description: 'Invoice amounts cluster around $999 threshold', metric: 'Amount Distribution', expected: 'Normal', actual: 'Bimodal at $999', significance: 'high' as const },
  { id: 'a2', description: 'Billing frequency spikes at end of fiscal quarters', metric: 'Temporal Distribution', expected: 'Uniform', actual: '+340% Q4 spike', significance: 'high' as const },
  { id: 'a3', description: 'Vendor payment amounts show unusual rounding', metric: 'Digit Distribution', expected: 'Random last digits', actual: '67% end in 00', significance: 'medium' as const },
  { id: 'a4', description: 'Same-day submissions from different facilities', metric: 'Submission Timing', expected: '<5% overlap', actual: '23% overlap', significance: 'medium' as const },
  { id: 'a5', description: 'Service codes inconsistent with provider specialty', metric: 'Code Validity', expected: '95%+ match', actual: '72% match', significance: 'low' as const },
];

// ── Props ──────────────────────────────────────────────────────────────────

interface AnalysisClientProps {
  crossData: CrossAnalysisData;
}

export function AnalysisClient({ crossData }: AnalysisClientProps) {
  const [activeTab, setActiveTab] = useState('AI Summary');
  const summaryLoading = false;

  const fraudSummary = crossData.fraudSummary;
  const benfordData = crossData.benford;
  const networkNodes = crossData.entities;
  const totalFraud = crossData.totalFraud;
  const totalPatterns = crossData.totalPatterns;

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
            {tab === 'AI Summary' ? (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {tab}
              </span>
            ) : tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* ── AI Summary Tab ─────────────────────────────────────────── */}
        {activeTab === 'AI Summary' && (
          <AnimatePresence mode="wait">
            {summaryLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* AI Summary skeleton */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary-light animate-pulse" />
                    <div className="h-4 w-40 rounded-md bg-bg-surface-raised animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-bg-surface-raised animate-pulse" />
                    <div className="h-3 w-5/6 rounded bg-bg-surface-raised animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-bg-surface-raised animate-pulse" />
                    <div className="h-3 w-3/4 rounded bg-bg-surface-raised animate-pulse" />
                  </div>
                </div>
                {/* Evidence Strength skeleton */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                  <div className="h-4 w-36 rounded-md bg-bg-surface-raised animate-pulse mb-4" />
                  <div className="h-3 w-full rounded-full bg-bg-surface-raised animate-pulse" />
                </div>
                {/* Key Findings skeleton */}
                <div className="rounded-xl border border-border-default bg-bg-surface">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="px-5 py-4 border-b border-border-muted last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-bg-surface-raised animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-full rounded bg-bg-surface-raised animate-pulse" />
                          <div className="h-3 w-4/5 rounded bg-bg-surface-raised animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* AI Summary CTA card */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted">
                    <Sparkles className="h-6 w-6 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="legal-heading text-sm text-text-primary mb-1">AI Cross-Case Summary</h3>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                      Click &ldquo;Run Full Analysis&rdquo; to generate an AI-powered cross-case summary using your real case data.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
                    <Zap className="h-4 w-4" />
                    Run Full Analysis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Fraud Patterns Tab */}
        {activeTab === 'Fraud Patterns' && (
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
          </>
        )}

        {/* Entity Network Tab */}
        {activeTab === 'Entity Network' && (
          <>
            {/* Network Visualization Placeholder */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-1">
              <svg viewBox="0 0 800 400" className="h-80 w-full">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#57534E" />
                  </marker>
                </defs>
                {/* Edges */}
                <line x1="200" y1="180" x2="400" y2="120" stroke="#44403C" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <line x1="200" y1="180" x2="350" y2="280" stroke="#44403C" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="120" x2="550" y2="200" stroke="#DC2626" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="120" x2="600" y2="100" stroke="#44403C" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <line x1="350" y1="280" x2="550" y2="200" stroke="#DC2626" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowhead)" />
                <line x1="550" y1="200" x2="650" y2="300" stroke="#44403C" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="600" y1="100" x2="400" y2="120" stroke="#44403C" strokeWidth="1" />
                <line x1="200" y1="180" x2="650" y2="300" stroke="#44403C" strokeWidth="1" opacity="0.5" />

                {/* Nodes */}
                <circle cx="200" cy="180" r="24" fill="#1E40AF" opacity="0.8" className="node-glow" style={{ color: '#3B82F6' }} />
                <text x="200" y="184" textAnchor="middle" fontSize="9" fill="white" fontWeight="600">AHS</text>
                <text x="200" y="215" textAnchor="middle" fontSize="9" fill="#A8A29E">Apex Health</text>

                <circle cx="400" cy="120" r="18" fill="#3B82F6" opacity="0.8" />
                <text x="400" y="124" textAnchor="middle" fontSize="8" fill="white">RC</text>
                <text x="400" y="148" textAnchor="middle" fontSize="9" fill="#A8A29E">Dr. Chen</text>

                <rect x="320" y="260" width="60" height="40" rx="4" fill="#B45309" opacity="0.8" />
                <text x="350" y="284" textAnchor="middle" fontSize="8" fill="white">MedBill</text>
                <text x="350" y="312" textAnchor="middle" fontSize="9" fill="#A8A29E">MedBill LLC</text>

                <circle cx="550" cy="200" r="20" fill="#B45309" opacity="0.6" />
                <text x="550" y="204" textAnchor="middle" fontSize="8" fill="white">MR4</text>
                <text x="550" y="230" textAnchor="middle" fontSize="9" fill="#A8A29E">Medicare R4</text>

                <polygon points="600,80 620,100 600,120 580,100" fill="#059669" opacity="0.8" />
                <text x="600" y="104" textAnchor="middle" fontSize="7" fill="white">$</text>
                <text x="600" y="134" textAnchor="middle" fontSize="9" fill="#A8A29E">Pmt #4421</text>

                <circle cx="650" cy="300" r="14" fill="#8B5CF6" opacity="0.6" />
                <text x="650" y="304" textAnchor="middle" fontSize="7" fill="white">NY</text>
                <text x="650" y="324" textAnchor="middle" fontSize="9" fill="#A8A29E">NYC Office</text>

                {/* Legend */}
                <circle cx="40" cy="360" r="5" fill="#3B82F6" />
                <text x="52" y="364" fontSize="9" fill="#78716C">Person</text>
                <rect x="95" y="355" width="10" height="10" rx="2" fill="#B45309" />
                <text x="112" y="364" fontSize="9" fill="#78716C">Org</text>
                <polygon points="155,355 160,360 155,365 150,360" fill="#059669" />
                <text x="168" y="364" fontSize="9" fill="#78716C">Payment</text>
                <line x1="225" y1="360" x2="250" y2="360" stroke="#DC2626" strokeWidth="2" strokeDasharray="4" />
                <text x="258" y="364" fontSize="9" fill="#78716C">Flagged</text>
              </svg>
            </div>

            {/* Entity List */}
            <div className="rounded-xl border border-border-default bg-bg-surface">
              <div className="border-b border-border-default px-4 py-3">
                <h3 className="legal-heading text-sm text-text-primary">Entity Directory</h3>
              </div>
              <div className="divide-y divide-border-muted">
                {networkNodes.map((n) => (
                  <div key={n.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getEntityColor(n.type) }} />
                    <div className="flex-1">
                      <span className="text-sm text-text-primary">{n.label}</span>
                      <span className="ml-2 text-[10px] text-text-tertiary">{getEntityLabel(n.type)}</span>
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
        {activeTab === "Benford's Law" && (
          <>
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <div className="mb-4">
                <h3 className="legal-heading text-sm text-text-primary">First-Digit Frequency Analysis</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Comparing the distribution of leading digits in billing amounts against the expected distribution.
                  Significant deviations may indicate fabricated or manipulated data.
                </p>
              </div>

              {/* Bar Chart */}
              <div className="mb-6">
                <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
                  {benfordData.map((d) => {
                    const maxVal = 35;
                    const expectedHeight = (d.expected / maxVal) * 100;
                    const actualHeight = (d.actual / maxVal) * 100;
                    return (
                      <div key={d.digit} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex w-full items-end justify-center gap-1" style={{ height: 180 }}>
                          <div
                            className="w-5 rounded-t bg-primary opacity-40"
                            style={{ height: `${expectedHeight}%` }}
                            title={`Expected: ${d.expected}%`}
                          />
                          <div
                            className={cn('w-5 rounded-t', d.suspicious ? 'bg-fraud-red' : 'bg-verified-green')}
                            style={{ height: `${actualHeight}%` }}
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

              {/* Digit Table */}
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
                    {benfordData.map((d) => (
                      <tr key={d.digit} className={cn(d.suspicious && 'bg-fraud-red-muted')}>
                        <td className="px-3 py-2 financial-figure font-medium text-text-primary">{d.digit}</td>
                        <td className="px-3 py-2 financial-figure text-text-secondary">{d.expected}%</td>
                        <td className="px-3 py-2 financial-figure text-text-secondary">{d.actual}%</td>
                        <td className={cn('px-3 py-2 financial-figure font-medium', d.suspicious ? 'text-fraud-red' : 'text-verified-green')}>
                          {d.actual > d.expected ? '+' : ''}{(d.actual - d.expected).toFixed(1)}%
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
          </>
        )}

        {/* Statistical Anomalies Tab */}
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
                        <div>
                          <span className="text-text-tertiary">Metric: </span>
                          <span className="text-text-secondary">{a.metric}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Expected: </span>
                          <span className="text-text-secondary">{a.expected}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Actual: </span>
                          <span className="financial-figure text-fraud-red">{a.actual}</span>
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
    </div>
  );
}

// ── Evidence Strength Meter ────────────────────────────────────────────────

function EvidenceStrengthMeter({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const color =
    clampedScore >= 70
      ? { bar: 'bg-verified-green', text: 'text-verified-green', label: 'Strong' }
      : clampedScore >= 40
      ? { bar: 'bg-warning', text: 'text-warning', label: 'Moderate' }
      : { bar: 'bg-fraud-red', text: 'text-fraud-red', label: 'Weak' };

  const Icon = clampedScore >= 70 ? ShieldCheck : clampedScore >= 40 ? ShieldAlert : AlertTriangle;

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', color.text)} />
          <h3 className="legal-heading text-sm text-text-primary">Evidence Strength</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('financial-figure text-xl font-semibold', color.text)}>
            {clampedScore}%
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
            clampedScore >= 70 ? 'bg-verified-green-muted text-verified-green' :
            clampedScore >= 40 ? 'bg-warning-muted text-warning' :
            'bg-fraud-red-muted text-fraud-red',
          )}>
            {color.label}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="relative h-3 w-full rounded-full bg-bg-surface-raised overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
        {/* Threshold markers */}
        <div className="absolute top-0 left-[40%] h-full w-px bg-border-emphasis opacity-60" />
        <div className="absolute top-0 left-[70%] h-full w-px bg-border-emphasis opacity-60" />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-text-tertiary">
        <span>0%</span>
        <span className="ml-[calc(40%-8px)]">40% moderate</span>
        <span className="ml-[calc(30%-20px)]">70% strong</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ── Key Findings Card ──────────────────────────────────────────────────────

function KeyFindingsCard({ findings }: { findings: KeyFinding[] }) {
  const severityConfig = {
    critical: {
      badge: 'bg-fraud-red-muted text-fraud-red',
      dot: 'bg-fraud-red',
      label: 'Critical',
    },
    high: {
      badge: 'bg-warning-muted text-warning',
      dot: 'bg-warning',
      label: 'High',
    },
    medium: {
      badge: 'bg-info-muted text-info',
      dot: 'bg-info',
      label: 'Medium',
    },
  };

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface">
      <div className="border-b border-border-default px-5 py-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-text-tertiary" />
        <h3 className="legal-heading text-sm text-text-primary">Key Findings</h3>
        <span className="ml-auto text-[10px] text-text-tertiary">{findings.length} findings</span>
      </div>
      <div className="divide-y divide-border-muted">
        {findings.map((f, i) => {
          const cfg = severityConfig[f.severity];
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.07 }}
              className="px-5 py-4 hover:bg-bg-surface-raised transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Number badge */}
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-bg-surface-raised text-text-secondary text-xs font-semibold flex items-center justify-center mt-0.5">
                  {f.id}
                </span>
                <div className="flex-1 min-w-0">
                  {/* Severity badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1', cfg.badge)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full inline-block', cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Finding text */}
                  <p className="text-sm text-text-secondary leading-relaxed mb-2">{f.finding}</p>

                  {/* Citation links */}
                  {f.citations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {f.citations.map((cit) => (
                        <a
                          key={cit.id}
                          href={cit.href}
                          className="inline-flex items-center gap-1 rounded-md bg-accent-muted px-2 py-0.5 text-[10px] font-medium text-accent-light hover:bg-accent-muted/70 transition-colors"
                        >
                          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                          {cit.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
