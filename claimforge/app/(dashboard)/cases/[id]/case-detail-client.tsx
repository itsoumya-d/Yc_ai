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
} from 'lucide-react';
import type { Case, Document, Entity, FraudPattern } from '@/types/database';

const tabs = ['Overview', 'Documents', 'Entities', 'Patterns', 'Timeline', 'Evidence'];

interface CaseDetailClientProps {
  caseData: Case;
  documents: Document[];
  entities: Entity[];
  patterns: FraudPattern[];
}

export function CaseDetailClient({ caseData, documents, entities, patterns }: CaseDetailClientProps) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={caseData.title} subtitle={`${caseData.case_number} • ${caseData.defendant_name}`}>
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', getCaseStatusColor(caseData.status))}>
          {getCaseStatusLabel(caseData.status)}
        </span>
        <button className="rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
          Edit Case
        </button>
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
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
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

            {/* Key Entities */}
            {entities.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Key Entities</h3>
                  <button className="text-xs text-text-link hover:underline">View All</button>
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Patterns */}
            {patterns.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Detected Patterns</h3>
                  <AlertTriangle className="h-3.5 w-3.5 text-fraud-red" />
                </div>
                <div className="divide-y divide-border-muted">
                  {patterns.map((p) => (
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

            {/* Empty state when no entities/patterns yet */}
            {entities.length === 0 && patterns.length === 0 && (
              <div className="flex h-40 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <Search className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-tertiary">No entities or patterns detected yet. Upload and analyze documents to populate.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
                <div className="text-center">
                  <FileText className="mx-auto h-8 w-8 text-text-tertiary" />
                  <p className="mt-2 text-sm text-text-tertiary">No documents uploaded yet.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-4 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Case Documents ({documents.length})</h3>
                </div>
                <div className="divide-y divide-border-muted">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-text-primary">{doc.title}</span>
                          {doc.flagged && <Flag className="h-3 w-3 text-fraud-red" />}
                        </div>
                        <div className="text-[10px] text-text-tertiary">{doc.file_name}</div>
                      </div>
                      <span className="text-xs text-text-tertiary">{formatDate(doc.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'Overview' && activeTab !== 'Documents' && (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
            <div className="text-center">
              <Search className="mx-auto h-8 w-8 text-text-tertiary" />
              <p className="mt-2 text-sm text-text-tertiary">{activeTab} view — connect backend to populate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
