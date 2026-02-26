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
  Download,
  Network,
  BarChart3,
  CheckCircle,
  XCircle,
  Link2,
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

const entities: Array<{ id: string; name: string; type: EntityType; mentions: number; flagged: boolean; connected: string[] }> = [
  { id: 'e1', name: 'Apex Health Systems', type: 'organization', mentions: 189, flagged: true, connected: ['Dr. Robert Chen', 'Invoice #AH-2023-4421'] },
  { id: 'e2', name: 'Dr. Robert Chen', type: 'person', mentions: 67, flagged: true, connected: ['Apex Health Systems', 'Service Agreement 2022'] },
  { id: 'e3', name: 'Medicare Region 4', type: 'organization', mentions: 45, flagged: false, connected: ['Apex Health Systems'] },
  { id: 'e4', name: 'Invoice #AH-2023-4421', type: 'payment', mentions: 12, flagged: true, connected: ['Apex Health Systems', 'Dr. Robert Chen'] },
  { id: 'e5', name: 'Service Agreement 2022', type: 'contract', mentions: 23, flagged: false, connected: ['Dr. Robert Chen'] },
  { id: 'e6', name: 'New York, NY', type: 'location', mentions: 34, flagged: false, connected: ['Apex Health Systems'] },
  { id: 'e7', name: 'MedBill Consulting LLC', type: 'organization', mentions: 18, flagged: true, connected: ['Apex Health Systems', 'Dr. Robert Chen'] },
  { id: 'e8', name: 'Patricia Alvarez', type: 'person', mentions: 9, flagged: false, connected: ['Medicare Region 4'] },
];

const patterns: Array<{ id: string; type: FraudPatternType; confidence_level: ConfidenceLevel; amount: number; description: string; evidence_count: number }> = [
  { id: 'p1', type: 'overbilling', confidence_level: 'high', amount: 340_000, description: 'Consistent 40-60% markup above Medicare allowable rates for CPT codes 99213-99215.', evidence_count: 47 },
  { id: 'p2', type: 'upcoding', confidence_level: 'critical', amount: 560_000, description: '78% of office visits billed at highest complexity level (99215) vs. industry average of 12%.', evidence_count: 132 },
  { id: 'p3', type: 'duplicate_billing', confidence_level: 'high', amount: 180_000, description: '34 instances of same-day duplicate billing for identical procedures across 3 facilities.', evidence_count: 34 },
  { id: 'p4', type: 'round_number', confidence_level: 'low', amount: 45_000, description: 'Abnormal frequency of round-number amounts in submitted claims ($500, $1000, $2500).', evidence_count: 12 },
  { id: 'p5', type: 'time_anomaly', confidence_level: 'medium', amount: 75_000, description: 'Claims submitted for services during facility closure dates (weekends, holidays).', evidence_count: 9 },
];

const documents = [
  { id: 'd1', name: 'Q4-2023-Invoices-Batch.pdf', type: 'invoice', size: '4.2 MB', date: '2024-03-18', entities: 34, flagged: true, status: 'processed' as const },
  { id: 'd2', name: 'Apex-Medicare-Agreement-2022.pdf', type: 'contract', size: '1.8 MB', date: '2024-03-10', entities: 12, flagged: false, status: 'processed' as const },
  { id: 'd3', name: 'Internal-Billing-Memo-Jan2024.docx', type: 'correspondence', size: '0.3 MB', date: '2024-02-28', entities: 8, flagged: true, status: 'processed' as const },
  { id: 'd4', name: 'Q3-2023-Claims-Records.xlsx', type: 'payment_record', size: '2.6 MB', date: '2024-02-20', entities: 67, flagged: true, status: 'processed' as const },
  { id: 'd5', name: 'Facility-Audit-Report-2023.pdf', type: 'audit_report', size: '8.1 MB', date: '2024-01-30', entities: 23, flagged: false, status: 'processing' as const },
];

const timeline = [
  { id: 't1', date: '2024-03-20', title: 'New pattern detected', description: 'AI detected upcoding pattern in recent batch', type: 'milestone' as const, flagged: true },
  { id: 't2', date: '2024-03-18', title: '45 documents processed', description: 'Batch OCR completed for Q4 2023 invoices', type: 'document' as const, flagged: false },
  { id: 't3', date: '2024-03-15', title: 'Payment of $125,000', description: 'Medicare reimbursement to Apex Health — flagged as potentially inflated', type: 'payment' as const, flagged: true },
  { id: 't4', date: '2024-03-10', title: 'Internal memo obtained', description: 'Whistleblower provided internal communications about billing practices', type: 'communication' as const, flagged: true },
  { id: 't5', date: '2024-02-28', title: 'Entity network expanded', description: '12 new entities identified connecting Apex Health to shell companies', type: 'milestone' as const, flagged: false },
  { id: 't6', date: '2024-02-15', title: 'Duplicate billing detected', description: '34 instances of same-day duplicate billing found across 3 facilities', type: 'milestone' as const, flagged: true },
  { id: 't7', date: '2024-01-15', title: 'Case opened', description: 'Investigation initiated based on whistleblower disclosure', type: 'milestone' as const, flagged: false },
];

const evidence = [
  { id: 'ev1', title: 'Upcoding Pattern — 78% Billing at Highest Level', doc: 'Q4-2023-Invoices-Batch.pdf', pattern: 'Upcoding', confidence: 'critical' as ConfidenceLevel, amount: 560_000, verified: true },
  { id: 'ev2', title: 'Duplicate Claim #AH-2023-4421 (3× submitted)', doc: 'Q3-2023-Claims-Records.xlsx', pattern: 'Duplicate Billing', confidence: 'high' as ConfidenceLevel, amount: 15_000, verified: true },
  { id: 'ev3', title: 'Weekend/Holiday Claims — 9 Instances', doc: 'Q4-2023-Invoices-Batch.pdf', pattern: 'Time Anomaly', confidence: 'medium' as ConfidenceLevel, amount: 75_000, verified: false },
  { id: 'ev4', title: 'Round-Number Billing Cluster ($500 ×47)', doc: 'Q3-2023-Claims-Records.xlsx', pattern: 'Round Number', confidence: 'low' as ConfidenceLevel, amount: 23_500, verified: false },
  { id: 'ev5', title: 'Internal Memo Acknowledging Billing Override', doc: 'Internal-Billing-Memo-Jan2024.docx', pattern: 'Overbilling', confidence: 'high' as ConfidenceLevel, amount: 0, verified: true },
];

const typeIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="h-4 w-4" />,
  contract: <Link2 className="h-4 w-4" />,
  correspondence: <FileText className="h-4 w-4" />,
  payment_record: <BarChart3 className="h-4 w-4" />,
  audit_report: <Search className="h-4 w-4" />,
};

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

        {/* OVERVIEW TAB */}
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
                  <div className="text-[10px] text-text-tertiary">Lead Investigator</div>
                  <div className="mt-0.5 text-sm text-text-primary">{caseData.lead_investigator}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Filed</div>
                  <div className="mt-0.5 text-sm text-text-primary">{formatDate(caseData.created_at)}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                <h3 className="legal-heading text-sm text-text-primary">Key Entities</h3>
                <button className="text-xs text-text-link hover:underline" onClick={() => setActiveTab('Entities')}>View All</button>
              </div>
              <div className="divide-y divide-border-muted">
                {entities.slice(0, 5).map((e) => (
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
                    <span className="shrink-0 text-xs text-text-tertiary">{formatDate(t.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'Documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="legal-heading text-sm text-text-primary">{documents.length} documents in this case</h3>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-text-on-color hover:bg-primary-hover transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload Document
              </button>
            </div>
            <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-bg-surface-raised">
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Document</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Type</th>
                    <th className="text-center px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Entities</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Uploaded</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-bg-surface-raised transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {doc.flagged && <Flag className="h-3 w-3 text-fraud-red shrink-0" />}
                          <span className="text-sm text-text-primary font-medium">{doc.name}</span>
                          <span className="text-[10px] text-text-tertiary">{doc.size}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          {typeIcons[doc.type]}
                          <span className="text-xs capitalize">{doc.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-text-secondary">{doc.entities}</td>
                      <td className="px-4 py-3 text-xs text-text-tertiary">{formatDate(doc.date)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', doc.status === 'processed' ? 'bg-verified-green/10 text-verified-green' : 'bg-yellow-500/10 text-yellow-500')}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"><Download className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ENTITIES TAB */}
        {activeTab === 'Entities' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="legal-heading text-sm text-text-primary">{entities.length} entities extracted</h3>
              <div className="flex items-center gap-2 ml-auto">
                {(['person','organization','payment','contract','location'] as EntityType[]).map((type) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getEntityColor(type) }} />
                    <span className="text-[10px] text-text-tertiary capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {entities.map((e) => (
                <div key={e.id} className="rounded-xl border border-border-default bg-bg-surface p-4 hover:bg-bg-surface-raised transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: getEntityColor(e.type) }} />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{e.name}</div>
                        <div className="text-[10px] text-text-tertiary">{getEntityLabel(e.type)} · {e.mentions} mentions</div>
                      </div>
                    </div>
                    {e.flagged && (
                      <span className="rounded-full bg-fraud-red/10 px-2 py-0.5 text-[10px] font-medium text-fraud-red flex items-center gap-1">
                        <Flag className="h-2.5 w-2.5" /> Flagged
                      </span>
                    )}
                  </div>
                  {e.connected.length > 0 && (
                    <div>
                      <div className="text-[10px] text-text-tertiary mb-1.5 flex items-center gap-1">
                        <Network className="h-3 w-3" /> Connected to
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {e.connected.map((c) => (
                          <span key={c} className="rounded-md bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-secondary border border-border-muted">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PATTERNS TAB */}
        {activeTab === 'Patterns' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-fraud-red/20 bg-fraud-red/5 p-4">
                <div className="text-[10px] text-text-tertiary">Total Fraud Detected</div>
                <div className="financial-figure mt-1 text-2xl font-semibold text-fraud-red">{formatCurrency(patterns.reduce((a, p) => a + p.amount, 0))}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Patterns Detected</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{patterns.length}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Critical Patterns</div>
                <div className="mt-1 text-2xl font-semibold text-fraud-red">{patterns.filter(p => p.confidence_level === 'critical').length}</div>
              </div>
            </div>
            <div className="space-y-3">
              {patterns.map((p) => (
                <div key={p.id} className="rounded-xl border border-border-default bg-bg-surface p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-fraud-red" />
                        <span className="text-sm font-semibold text-text-primary">{getFraudPatternLabel(p.type)}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(p.confidence_level))}>
                          {p.confidence_level}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="financial-figure text-lg font-semibold text-fraud-red">{formatCurrency(p.amount)}</div>
                      <div className="text-[10px] text-text-tertiary">{p.evidence_count} evidence items</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-bg-surface-raised rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.amount / 1_200_000) * 100}%`,
                        background: p.confidence_level === 'critical' ? '#DC2626' : p.confidence_level === 'high' ? '#EA580C' : p.confidence_level === 'medium' ? '#D97706' : '#6B7280',
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-text-tertiary">
                    <span>{((p.amount / 1_200_000) * 100).toFixed(1)}% of total estimated fraud</span>
                    <button className="text-text-link hover:underline">View evidence →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'Timeline' && (
          <div className="space-y-4">
            <h3 className="legal-heading text-sm text-text-primary">Case Timeline — {timeline.length} events</h3>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border-default" />
              <div className="space-y-1">
                {timeline.map((t, i) => (
                  <div key={t.id} className={cn('relative flex gap-4 rounded-xl p-4 transition-colors hover:bg-bg-surface', i < timeline.length - 1 && 'mb-1')}>
                    <div className={cn('relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', t.flagged ? 'border-fraud-red bg-fraud-red/10' : 'border-border-emphasis bg-bg-root')}>
                      <div className={cn('h-1.5 w-1.5 rounded-full', t.flagged ? 'bg-fraud-red' : 'bg-border-emphasis')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{t.title}</span>
                            {t.flagged && (
                              <span className="rounded-full bg-fraud-red/10 px-2 py-0.5 text-[9px] font-medium text-fraud-red flex items-center gap-0.5">
                                <Flag className="h-2 w-2" /> Flagged
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-text-secondary">{t.description}</p>
                        </div>
                        <span className="shrink-0 text-xs text-text-tertiary whitespace-nowrap">{formatDate(t.date)}</span>
                      </div>
                      <span className={cn('mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium',
                        t.type === 'payment' ? 'bg-fraud-red/10 text-fraud-red' :
                        t.type === 'document' ? 'bg-primary-muted text-primary-light' :
                        t.type === 'communication' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-bg-surface-raised text-text-tertiary'
                      )}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === 'Evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="legal-heading text-sm text-text-primary">{evidence.length} evidence items</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-verified-green">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {evidence.filter(e => e.verified).length} verified
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <XCircle className="h-3.5 w-3.5" />
                  {evidence.filter(e => !e.verified).length} pending
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {evidence.map((ev, i) => (
                <div key={ev.id} className="rounded-xl border border-border-default bg-bg-surface p-5 hover:bg-bg-surface-raised transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-text-tertiary">#{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-semibold text-text-primary">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <FileText className="h-3 w-3" />
                          {ev.doc}
                        </div>
                        <span className="text-text-tertiary">·</span>
                        <span className="text-xs text-text-secondary">{ev.pattern}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(ev.confidence))}>
                          {ev.confidence}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {ev.amount > 0 && (
                        <div className="financial-figure text-base font-semibold text-fraud-red mb-1">{formatCurrency(ev.amount)}</div>
                      )}
                      <div className={cn('flex items-center justify-end gap-1 text-xs', ev.verified ? 'text-verified-green' : 'text-text-tertiary')}>
                        {ev.verified ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {ev.verified ? 'Verified' : 'Pending review'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border-muted bg-bg-surface-raised p-4 text-center">
              <p className="text-sm text-text-secondary mb-3">Ready to generate the evidence package for this case?</p>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color hover:bg-primary-hover transition-colors">
                <Download className="h-4 w-4" />
                Generate Evidence Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
