'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { TimelineView } from '@/components/cases/timeline-view';
import {
  cn,
  formatCurrency,
  formatDate,
  formatFileSize,
  getCaseStatusColor,
  getCaseStatusLabel,
  getConfidenceColor,
  getFraudPatternLabel,
  getEntityColor,
  getEntityLabel,
} from '@/lib/utils';
import {
  FileText,
  Users,
  Search,
  Clock,
  AlertTriangle,
  Flag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type {
  Case,
  Document,
  Entity,
  FraudPattern,
  TimelineEvent,
} from '@/types/database';

const TABS = ['Overview', 'Documents', 'Entities', 'Patterns', 'Timeline'];

interface CaseDetailViewProps {
  caseData: Case;
  documents: Document[];
  entities: Entity[];
  patterns: FraudPattern[];
  timeline: TimelineEvent[];
}

export function CaseDetailView({
  caseData,
  documents,
  entities,
  patterns,
  timeline,
}: CaseDetailViewProps) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={caseData.title}
        subtitle={`${caseData.case_number} • ${caseData.defendant_name}`}
      >
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            getCaseStatusColor(caseData.status)
          )}
        >
          {getCaseStatusLabel(caseData.status)}
        </span>
        <button className="rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
          Edit Case
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-default px-6 py-1.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs transition-colors',
              activeTab === tab
                ? 'bg-bg-surface-hover text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* ── Overview Tab ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Estimated Fraud</div>
                <div className="financial-figure mt-1 text-2xl font-semibold text-fraud-red">
                  {formatCurrency(caseData.estimated_fraud_amount)}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                  <FileText className="h-3 w-3" /> Documents
                </div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">
                  {caseData.document_count}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                  <Users className="h-3 w-3" /> Entities
                </div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">
                  {caseData.entity_count}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                  <Search className="h-3 w-3" /> Patterns
                </div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">
                  {caseData.pattern_count}
                </div>
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
                  <div className="text-[10px] text-text-tertiary">Defendant Type</div>
                  <div className="mt-0.5 text-sm capitalize text-text-primary">
                    {caseData.defendant_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Opened</div>
                  <div className="mt-0.5 text-sm text-text-primary">
                    {formatDate(caseData.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Entities */}
            {entities.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Key Entities</h3>
                  <button
                    onClick={() => setActiveTab('Entities')}
                    className="text-xs text-text-link hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-border-muted">
                  {entities.slice(0, 6).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getEntityColor(e.entity_type) }}
                      />
                      <div className="flex-1">
                        <span className="text-sm text-text-primary">{e.name}</span>
                        <span className="ml-2 text-[10px] text-text-tertiary">
                          {getEntityLabel(e.entity_type)}
                        </span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {e.mention_count} mentions
                      </span>
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
                    <div
                      key={p.id}
                      className="px-4 py-3 transition-colors hover:bg-bg-surface-raised"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {getFraudPatternLabel(p.pattern_type)}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              getConfidenceColor(p.confidence_level)
                            )}
                          >
                            {p.confidence_level}
                          </span>
                        </div>
                        <span className="financial-figure text-sm font-medium text-fraud-red">
                          {formatCurrency(p.affected_amount)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Timeline */}
            {timeline.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Recent Activity</h3>
                  <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                </div>
                <div className="divide-y divide-border-muted">
                  {timeline.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised"
                    >
                      <div className="mt-1 shrink-0">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            t.flagged ? 'bg-fraud-red' : 'bg-border-emphasis'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-text-primary">{t.title}</div>
                        <div className="mt-0.5 text-xs text-text-secondary">{t.description}</div>
                      </div>
                      <span className="shrink-0 text-xs text-text-tertiary">
                        {formatDate(t.event_date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Documents Tab ── */}
        {activeTab === 'Documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-tertiary">{documents.length} documents</p>
            </div>

            {documents.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <FileText className="h-8 w-8 text-text-tertiary" />
                <p className="mt-2 text-sm text-text-tertiary">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="divide-y divide-border-muted">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-bg-surface-raised"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-primary truncate">{doc.title}</span>
                          {doc.flagged && <Flag className="h-3 w-3 shrink-0 text-fraud-red" />}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[10px] text-text-tertiary">
                          <span className="capitalize">{doc.document_type.replace(/_/g, ' ')}</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{doc.page_count} pages</span>
                          <span>{doc.entity_count} entities</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {doc.processed ? (
                          <span className="flex items-center gap-1 rounded-full bg-verified-green-muted px-2 py-0.5 text-[10px] font-medium text-verified-green">
                            <CheckCircle2 className="h-3 w-3" /> Processed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-warning-muted px-2 py-0.5 text-[10px] font-medium text-warning">
                            <XCircle className="h-3 w-3" /> Pending
                          </span>
                        )}
                        <span className="text-[10px] text-text-tertiary">
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Entities Tab ── */}
        {activeTab === 'Entities' && (
          <div className="space-y-4">
            <p className="text-xs text-text-tertiary">{entities.length} entities identified</p>

            {entities.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <Users className="h-8 w-8 text-text-tertiary" />
                <p className="mt-2 text-sm text-text-tertiary">
                  No entities extracted yet — upload and analyze documents
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="divide-y divide-border-muted">
                  {entities.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-bg-surface-raised"
                    >
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getEntityColor(e.entity_type) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{e.name}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: getEntityColor(e.entity_type) + '22',
                              color: getEntityColor(e.entity_type),
                            }}
                          >
                            {getEntityLabel(e.entity_type)}
                          </span>
                        </div>
                        {e.metadata && (e.metadata as Record<string, unknown>).context && (
                          <p className="mt-0.5 text-xs text-text-secondary truncate">
                            {String((e.metadata as Record<string, unknown>).context)}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-medium text-text-primary">
                          {e.mention_count} mentions
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          {Math.round(e.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Patterns Tab ── */}
        {activeTab === 'Patterns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-tertiary">{patterns.length} patterns detected</p>
              {patterns.length > 0 && (
                <div className="text-xs text-text-tertiary">
                  Total exposure:{' '}
                  <span className="font-medium text-fraud-red">
                    {formatCurrency(patterns.reduce((s, p) => s + (p.affected_amount || 0), 0))}
                  </span>
                </div>
              )}
            </div>

            {patterns.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <Search className="h-8 w-8 text-text-tertiary" />
                <p className="mt-2 text-sm text-text-tertiary">
                  No patterns detected yet — run document analysis
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patterns.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:bg-bg-surface-raised"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            {getFraudPatternLabel(p.pattern_type)}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              getConfidenceColor(p.confidence_level)
                            )}
                          >
                            {p.confidence_level}
                          </span>
                          <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary capitalize">
                            {p.detection_method}
                          </span>
                          {p.verified && (
                            <span className="flex items-center gap-0.5 rounded-full bg-verified-green-muted px-2 py-0.5 text-[10px] font-medium text-verified-green">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-text-secondary">{p.description}</p>
                        {p.evidence_summary && (
                          <p className="mt-1 text-xs text-text-tertiary">{p.evidence_summary}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="financial-figure text-base font-semibold text-fraud-red">
                          {formatCurrency(p.affected_amount)}
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          {Math.round(p.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Timeline Tab ── */}
        {activeTab === 'Timeline' && (
          <TimelineView caseId={caseData.id} initialEvents={timeline} />
        )}
      </div>
    </div>
  );
}
