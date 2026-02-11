'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate, getCaseStatusColor, getCaseStatusLabel, getConfidenceColor, getFraudPatternLabel, getEntityColor, getEntityLabel } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  Users,
  Search,
  Clock,
  Network,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Flag,
} from 'lucide-react';
import type { FraudPatternType, ConfidenceLevel, EntityType } from '@/types/database';

const tabs = ['Overview', 'Documents', 'Entities', 'Patterns', 'Timeline', 'Evidence'];

const caseData = {
  id: '1',
  case_number: 'CF-2024-001',
  title: 'Medicare Overbilling Investigation',
  defendant: 'Apex Health Systems',
  defendant_type: 'corporation' as const,
  status: 'investigation' as const,
  estimated_fraud_amount: 1_200_000,
  jurisdiction: 'S.D.N.Y.',
  lead_investigator: 'Sarah Chen',
  description: 'Investigation into systematic Medicare overbilling by Apex Health Systems across multiple facilities. Initial analysis indicates inflated service codes, duplicate billing for the same procedures, and billing for services not rendered.',
  created_at: '2024-01-15',
  updated_at: '2024-03-20',
  document_count: 234,
  entity_count: 45,
  pattern_count: 8,
};

const entities: Array<{ id: string; name: string; type: EntityType; mentions: number; flagged: boolean }> = [
  { id: 'e1', name: 'Apex Health Systems', type: 'organization', mentions: 189, flagged: true },
  { id: 'e2', name: 'Dr. Robert Chen', type: 'person', mentions: 67, flagged: true },
  { id: 'e3', name: 'Medicare Region 4', type: 'organization', mentions: 45, flagged: false },
  { id: 'e4', name: 'Invoice #AH-2023-4421', type: 'payment', mentions: 12, flagged: true },
  { id: 'e5', name: 'Service Agreement 2022', type: 'contract', mentions: 23, flagged: false },
  { id: 'e6', name: 'New York, NY', type: 'location', mentions: 34, flagged: false },
];

const patterns: Array<{ id: string; type: FraudPatternType; confidence_level: ConfidenceLevel; amount: number; description: string }> = [
  { id: 'p1', type: 'overbilling', confidence_level: 'high', amount: 340_000, description: 'Consistent 40-60% markup above Medicare allowable rates for CPT codes 99213-99215.' },
  { id: 'p2', type: 'upcoding', confidence_level: 'critical', amount: 560_000, description: '78% of office visits billed at highest complexity level (99215) vs. industry average of 12%.' },
  { id: 'p3', type: 'duplicate_billing', confidence_level: 'high', amount: 180_000, description: '34 instances of same-day duplicate billing for identical procedures across 3 facilities.' },
  { id: 'p4', type: 'round_number', confidence_level: 'low', amount: 45_000, description: 'Abnormal frequency of round-number amounts in submitted claims ($500, $1000, $2500).' },
  { id: 'p5', type: 'time_anomaly', confidence_level: 'medium', amount: 75_000, description: 'Claims submitted for services during facility closure dates (weekends, holidays).' },
];

const timeline = [
  { id: 't1', date: '2024-03-20', title: 'New pattern detected', description: 'AI detected upcoding pattern in recent batch', type: 'milestone' as const, flagged: true },
  { id: 't2', date: '2024-03-18', title: '45 documents processed', description: 'Batch OCR completed for Q4 2023 invoices', type: 'document' as const, flagged: false },
  { id: 't3', date: '2024-03-15', title: 'Payment of $125,000', description: 'Medicare reimbursement to Apex Health - flagged as potentially inflated', type: 'payment' as const, flagged: true },
  { id: 't4', date: '2024-03-10', title: 'Internal memo obtained', description: 'Whistleblower provided internal communications about billing practices', type: 'communication' as const, flagged: true },
  { id: 't5', date: '2024-02-28', title: 'Entity network expanded', description: '12 new entities identified connecting Apex Health to shell companies', type: 'milestone' as const, flagged: false },
];

export default function CaseDetailPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={caseData.title} subtitle={`${caseData.case_number} • ${caseData.defendant}`}>
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
                  <div className="text-[10px] text-text-tertiary">Lead Investigator</div>
                  <div className="mt-0.5 text-sm text-text-primary">{caseData.lead_investigator}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Filed</div>
                  <div className="mt-0.5 text-sm text-text-primary">{formatDate(caseData.created_at)}</div>
                </div>
              </div>
            </div>

            {/* Top Entities */}
            <div className="rounded-xl border border-border-default bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                <h3 className="legal-heading text-sm text-text-primary">Key Entities</h3>
                <button className="text-xs text-text-link hover:underline">View All</button>
              </div>
              <div className="divide-y divide-border-muted">
                {entities.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getEntityColor(e.type) }} />
                    <div className="flex-1">
                      <span className="text-sm text-text-primary">{e.name}</span>
                      <span className="ml-2 text-[10px] text-text-tertiary">{getEntityLabel(e.type)}</span>
                    </div>
                    <span className="text-xs text-text-tertiary">{e.mentions} mentions</span>
                    {e.flagged && <Flag className="h-3 w-3 text-fraud-red" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Patterns */}
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
                        <span className="text-sm font-medium text-text-primary">{getFraudPatternLabel(p.type)}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(p.confidence_level))}>
                          {p.confidence_level}
                        </span>
                      </div>
                      <span className="financial-figure text-sm font-medium text-fraud-red">{formatCurrency(p.amount)}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border-default bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                <h3 className="legal-heading text-sm text-text-primary">Recent Activity</h3>
                <Clock className="h-3.5 w-3.5 text-text-tertiary" />
              </div>
              <div className="divide-y divide-border-muted">
                {timeline.map((t) => (
                  <div key={t.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                    <div className="mt-1 shrink-0">
                      <div className={cn('h-2 w-2 rounded-full', t.flagged ? 'bg-fraud-red' : 'bg-border-emphasis')} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-text-primary">{t.title}</div>
                      <div className="mt-0.5 text-xs text-text-secondary">{t.description}</div>
                    </div>
                    <span className="shrink-0 text-xs text-text-tertiary">{formatDate(t.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Overview' && (
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
