'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate, getCaseStatusColor, getCaseStatusLabel, getConfidenceColor, getFraudPatternLabel, getEntityColor, getEntityLabel } from '@/lib/utils';
import {
  FileText,
  Users,
  Search,
  Clock,
  AlertTriangle,
  Flag,
  Upload,
  Eye,
} from 'lucide-react';
import type { Case, Document, Entity, FraudPattern, TimelineEvent } from '@/types/database';

interface CaseDetailViewProps {
  caseData: Case;
  documents: Document[];
  entities: Entity[];
  patterns: FraudPattern[];
  timeline: TimelineEvent[];
}

const tabs = ['Overview', 'Documents', 'Entities', 'Patterns', 'Timeline'];

export function CaseDetailView({ caseData, documents, entities, patterns, timeline }: CaseDetailViewProps) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={caseData.title} subtitle={`${caseData.case_number} • ${caseData.defendant_name}`}>
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', getCaseStatusColor(caseData.status))}>
          {getCaseStatusLabel(caseData.status)}
        </span>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-default px-6 py-1.5">
        {tabs.map((tab) => (
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
            {tab === 'Documents' && ` (${documents.length})`}
            {tab === 'Entities' && ` (${entities.length})`}
            {tab === 'Patterns' && ` (${patterns.length})`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Estimated Fraud</div>
                <div className="financial-figure mt-1 text-2xl font-semibold text-fraud-red">{formatCurrency(caseData.estimated_fraud_amount)}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><FileText className="h-3 w-3" /> Documents</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{caseData.document_count}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><Users className="h-3 w-3" /> Entities</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{caseData.entity_count}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><Search className="h-3 w-3" /> Patterns</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{caseData.pattern_count}</div>
              </div>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <h3 className="legal-heading mb-2 text-sm text-text-primary">Case Description</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{caseData.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border-muted pt-4">
                <div>
                  <div className="text-[10px] text-text-tertiary">Jurisdiction</div>
                  <div className="mt-0.5 text-sm text-text-primary">{caseData.jurisdiction}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Defendant</div>
                  <div className="mt-0.5 text-sm text-text-primary">{caseData.defendant_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Filed</div>
                  <div className="mt-0.5 text-sm text-text-primary">{formatDate(caseData.created_at)}</div>
                </div>
              </div>
            </div>

            {/* Top Entities */}
            {entities.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Key Entities</h3>
                  <button onClick={() => setActiveTab('Entities')} className="text-xs text-text-link hover:underline">View All</button>
                </div>
                <div className="divide-y divide-border-muted">
                  {entities.slice(0, 6).map((e) => (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getEntityColor(e.entity_type) }} />
                      <div className="flex-1">
                        <span className="text-sm text-text-primary">{e.name}</span>
                        <span className="ml-2 text-[10px] text-text-tertiary">{getEntityLabel(e.entity_type)}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">{e.mention_count} mentions</span>
                      {e.confidence > 0.8 && <Flag className="h-3 w-3 text-fraud-red" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Patterns */}
            {patterns.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Detected Patterns</h3>
                  <AlertTriangle className="h-3.5 w-3.5 text-fraud-red" />
                </div>
                <div className="divide-y divide-border-muted">
                  {patterns.slice(0, 5).map((p) => (
                    <div key={p.id} className="px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{getFraudPatternLabel(p.pattern_type)}</span>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(p.confidence_level))}>
                            {p.confidence_level}
                          </span>
                        </div>
                        <span className="financial-figure text-sm font-medium text-fraud-red">{formatCurrency(p.affected_amount)}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Preview */}
            {timeline.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Recent Activity</h3>
                  <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                </div>
                <div className="divide-y divide-border-muted">
                  {timeline.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="mt-1 shrink-0">
                        <div className={cn('h-2 w-2 rounded-full', t.flagged ? 'bg-fraud-red' : 'bg-border-emphasis')} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-text-primary">{t.title}</div>
                        <div className="mt-0.5 text-xs text-text-secondary">{t.description}</div>
                      </div>
                      <span className="shrink-0 text-xs text-text-tertiary">{formatDate(t.event_date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'Documents' && (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-secondary">No documents uploaded yet</p>
                  <p className="mt-1 text-xs text-text-tertiary">Upload documents to start analysis</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-default text-left text-xs text-text-tertiary">
                      <th className="px-4 py-3 font-medium">Document</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Entities</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="transition-colors hover:bg-bg-surface-raised">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-text-tertiary" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-text-primary">{doc.title}</span>
                                {doc.flagged && <Flag className="h-3 w-3 text-fraud-red" />}
                              </div>
                              <div className="text-[10px] text-text-tertiary">{doc.file_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-secondary">
                            {doc.document_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{doc.entity_count}</td>
                        <td className="px-4 py-3">
                          {doc.processed ? (
                            <span className="text-xs text-verified-green">Processed</span>
                          ) : (
                            <span className="text-xs text-warning">Processing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-tertiary">{formatDate(doc.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Entities Tab */}
        {activeTab === 'Entities' && (
          <div className="space-y-4">
            {entities.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <Users className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-secondary">No entities extracted yet</p>
                  <p className="mt-1 text-xs text-text-tertiary">Upload and analyze documents to extract entities</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="divide-y divide-border-muted">
                  {entities.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getEntityColor(e.entity_type) }} />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-text-primary">{e.name}</span>
                        <span className="ml-2 text-[10px] text-text-tertiary">{getEntityLabel(e.entity_type)}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">{e.mention_count} mentions</span>
                      <span className="financial-figure text-xs text-text-secondary">{(e.confidence * 100).toFixed(0)}%</span>
                      {e.confidence > 0.8 && <Flag className="h-3 w-3 text-fraud-red" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'Patterns' && (
          <div className="space-y-4">
            {patterns.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-secondary">No fraud patterns detected yet</p>
                  <p className="mt-1 text-xs text-text-tertiary">Analyze documents to detect patterns</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                    <div className="text-[10px] text-text-tertiary">Total Fraud Amount</div>
                    <div className="financial-figure mt-1 text-2xl font-semibold text-fraud-red">
                      {formatCurrency(patterns.reduce((s, p) => s + p.affected_amount, 0))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                    <div className="text-[10px] text-text-tertiary">Patterns Found</div>
                    <div className="mt-1 text-2xl font-semibold text-text-primary">{patterns.length}</div>
                  </div>
                  <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                    <div className="text-[10px] text-text-tertiary">Verified</div>
                    <div className="mt-1 text-2xl font-semibold text-verified-green">{patterns.filter((p) => p.verified).length}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-border-default bg-bg-surface">
                  <div className="divide-y divide-border-muted">
                    {patterns.map((p) => (
                      <div key={p.id} className="px-4 py-4 transition-colors hover:bg-bg-surface-raised">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{getFraudPatternLabel(p.pattern_type)}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(p.confidence_level))}>
                              {p.confidence_level}
                            </span>
                            {p.verified && <span className="text-[10px] text-verified-green">Verified</span>}
                            {p.false_positive && <span className="text-[10px] text-text-tertiary line-through">False Positive</span>}
                          </div>
                          <span className="financial-figure text-sm font-medium text-fraud-red">{formatCurrency(p.affected_amount)}</span>
                        </div>
                        <p className="mt-1 text-xs text-text-secondary">{p.description}</p>
                        {p.evidence_summary && (
                          <p className="mt-1 text-xs text-text-tertiary italic">{p.evidence_summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'Timeline' && (
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <Clock className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-secondary">No timeline events yet</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="divide-y divide-border-muted">
                  {timeline.map((t) => (
                    <div key={t.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <div className="mt-1 shrink-0">
                        <div className={cn('h-2 w-2 rounded-full', t.flagged ? 'bg-fraud-red' : 'bg-border-emphasis')} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-primary">{t.title}</span>
                          <span className="rounded-md bg-bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">{t.event_type}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-text-secondary">{t.description}</div>
                        {t.amount != null && t.amount > 0 && (
                          <div className="mt-1 financial-figure text-xs text-fraud-red">{formatCurrency(t.amount)}</div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-text-tertiary">{formatDate(t.event_date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
