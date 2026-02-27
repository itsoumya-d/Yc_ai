'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, getConfidenceColor, getFraudPatternLabel, getEntityColor, getEntityLabel } from '@/lib/utils';
import {
  AlertTriangle,
  Zap,
} from 'lucide-react';
import type { FraudSummaryItem, EntityNetworkNode } from '@/lib/actions/analysis-aggregate';

interface AnalysisViewProps {
  fraudSummary: FraudSummaryItem[];
  networkNodes: EntityNetworkNode[];
}

const analysisTabs = ['Fraud Patterns', 'Entity Network'];

export function AnalysisView({ fraudSummary, networkNodes }: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState('Fraud Patterns');

  const totalFraud = fraudSummary.reduce((sum, f) => sum + f.total_amount, 0);
  const totalPatterns = fraudSummary.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Analysis" subtitle="Cross-case fraud pattern and entity analysis">
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
        {/* Fraud Patterns Tab */}
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

            {fraudSummary.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-secondary">No fraud patterns detected yet</p>
                  <p className="mt-1 text-xs text-text-tertiary">Upload and analyze documents to detect patterns</p>
                </div>
              </div>
            ) : (
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
            )}
          </>
        )}

        {/* Entity Network Tab */}
        {activeTab === 'Entity Network' && (
          <>
            {networkNodes.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-secondary">No entities extracted yet</p>
                  <p className="mt-1 text-xs text-text-tertiary">Analyze documents to build entity network</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Entity Directory ({networkNodes.length})</h3>
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
