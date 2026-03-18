'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PresenceAvatars } from '@/components/PresenceAvatars';
import { AIClaimAssist } from '@/components/cases/AIClaimAssist';
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
  Upload,
  Eye,
  Download,
  CheckCircle2,
  File,
  FileImage,
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

/* ── Documents tab data ── */
const caseDocuments = [
  { id: 'd1', name: 'Q4-2023-Medicare-Invoices.pdf', type: 'invoice', ocr: 98, entities: 14, pages: 42, size: 3_840_000, date: '2024-03-18', flagged: true },
  { id: 'd2', name: 'Apex-Service-Agreement-2022.pdf', type: 'contract', ocr: 95, entities: 8, pages: 18, size: 1_200_000, date: '2024-02-10', flagged: false },
  { id: 'd3', name: 'Billing-Audit-Report-Jan2024.pdf', type: 'audit_report', ocr: 92, entities: 22, pages: 67, size: 5_100_000, date: '2024-01-28', flagged: true },
  { id: 'd4', name: 'Internal-Memo-Billing-Feb2024.docx', type: 'correspondence', ocr: 99, entities: 6, pages: 4, size: 420_000, date: '2024-03-10', flagged: true },
  { id: 'd5', name: 'Medicare-EOB-Statements-Q3.pdf', type: 'payment_record', ocr: 97, entities: 19, pages: 88, size: 7_200_000, date: '2024-01-22', flagged: false },
  { id: 'd6', name: 'CMS-Regulatory-Filing-2023.pdf', type: 'regulatory_filing', ocr: 91, entities: 11, pages: 31, size: 2_600_000, date: '2024-01-15', flagged: false },
];

const docTypeLabel: Record<string, string> = {
  invoice: 'Invoice',
  contract: 'Contract',
  audit_report: 'Audit Report',
  correspondence: 'Correspondence',
  payment_record: 'Payment Record',
  regulatory_filing: 'Regulatory Filing',
};

const docTypeColor: Record<string, string> = {
  invoice: 'bg-primary-muted text-primary-light',
  contract: 'bg-accent-muted text-accent-light',
  audit_report: 'bg-fraud-red-muted text-fraud-red',
  correspondence: 'bg-warning-muted text-warning',
  payment_record: 'bg-verified-green-muted text-verified-green',
  regulatory_filing: 'bg-info-muted text-info',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Entities tab data ── */
const entitiesDetail: Array<{
  id: string;
  name: string;
  type: EntityType;
  mentions: number;
  relationships: number;
  flagged: boolean;
  role: string;
}> = [
  { id: 'e1', name: 'Apex Health Systems', type: 'organization', mentions: 189, relationships: 12, flagged: true, role: 'Primary defendant. Operates 7 outpatient facilities across NY and NJ. Listed as billing entity on all flagged claims.' },
  { id: 'e2', name: 'Dr. Robert Chen', type: 'person', mentions: 67, relationships: 8, flagged: true, role: 'Chief Medical Officer at Apex. Signature appears on 94% of highest-complexity billing codes.' },
  { id: 'e3', name: 'Medicare Region 4', type: 'organization', mentions: 45, relationships: 3, flagged: false, role: 'Federal payer. Reimbursed $1.2M to Apex over the investigation period under scrutiny.' },
  { id: 'e4', name: 'CMS Contractor #7741', type: 'organization', mentions: 28, relationships: 4, flagged: false, role: 'Third-party claims processor responsible for initial review of submitted invoices.' },
  { id: 'e5', name: 'Dr. Linda Park', type: 'person', mentions: 31, relationships: 5, flagged: true, role: 'Attending physician whose NPI number was used on 12 duplicate billing instances without her knowledge.' },
  { id: 'e6', name: 'Invoice #AH-2023-4421', type: 'payment', mentions: 12, relationships: 2, flagged: true, role: 'Disputed invoice for $48,500 — identical to Invoice #AH-2023-4422 filed same day, different facility.' },
  { id: 'e7', name: 'Service Agreement 2022', type: 'contract', mentions: 23, relationships: 6, flagged: false, role: 'Master services agreement between Apex and Medicare Region 4. Establishes allowable billing rates.' },
  { id: 'e8', name: 'New York, NY', type: 'location', mentions: 34, relationships: 7, flagged: false, role: 'Primary facility location. Highest concentration of flagged billing activity (61% of total).' },
  { id: 'e9', name: 'Invoice #AH-2023-4422', type: 'payment', mentions: 9, relationships: 2, flagged: true, role: 'Duplicate invoice matching #AH-2023-4421. Filed for Newark, NJ facility on the same service date.' },
  { id: 'e10', name: 'James Whitfield', type: 'person', mentions: 18, relationships: 3, flagged: false, role: 'Compliance Officer at Apex Health. Authored internal audit memo flagged by whistleblower.' },
];

/* ── Patterns tab data ── */
const patternsDetail: Array<{
  id: string;
  type: FraudPatternType;
  confidence_level: ConfidenceLevel;
  confidence_pct: number;
  amount: number;
  description: string;
  evidence_docs: number;
  detection: string;
  verified: boolean;
}> = [
  { id: 'p1', type: 'upcoding', confidence_level: 'critical', confidence_pct: 97, amount: 560_000, description: '78% of office visits billed at highest complexity level (99215) vs. industry average of 12%. Statistical deviation is 6.2 standard deviations above the regional mean for similar-sized practices.', evidence_docs: 88, detection: 'AI + Statistical', verified: true },
  { id: 'p2', type: 'overbilling', confidence_level: 'high', confidence_pct: 84, amount: 340_000, description: 'Consistent 40-60% markup above Medicare allowable rates for CPT codes 99213-99215. Excess billing persists across all 7 facilities with identical markup ratios.', evidence_docs: 54, detection: 'Rule-based', verified: true },
  { id: 'p3', type: 'duplicate_billing', confidence_level: 'high', confidence_pct: 91, amount: 180_000, description: '34 instances of same-day duplicate billing for identical procedures across 3 facilities. Same patient ID, same CPT code, different facility tax IDs.', evidence_docs: 34, detection: 'AI', verified: false },
  { id: 'p4', type: 'time_anomaly', confidence_level: 'medium', confidence_pct: 73, amount: 75_000, description: 'Claims submitted for services during facility closure dates: 14 weekend dates and 3 federal holidays where patient records show no admissions.', evidence_docs: 17, detection: 'Rule-based', verified: false },
  { id: 'p5', type: 'unbundling', confidence_level: 'medium', confidence_pct: 68, amount: 55_000, description: 'Procedure codes billed separately that should be grouped under a single bundled code per CMS guidelines. Pattern detected in 22 distinct claim sets.', evidence_docs: 22, detection: 'Statistical', verified: false },
  { id: 'p6', type: 'round_number', confidence_level: 'low', confidence_pct: 52, amount: 45_000, description: 'Abnormal frequency of round-number amounts in submitted claims ($500, $1,000, $2,500). Chi-square test indicates non-random distribution (p < 0.001).', evidence_docs: 11, detection: 'Statistical', verified: false },
];

/* ── Timeline tab data ── */
const timelineDetail: Array<{
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'document' | 'payment' | 'communication' | 'regulatory' | 'milestone';
  flagged: boolean;
  amount?: number;
}> = [
  { id: 'tl1', date: '2024-03-20', title: 'Critical Pattern Flagged — Upcoding', description: 'AI analysis of Q4 2023 batch identified upcoding across 88 documents. Confidence level elevated to Critical (97%). Case status updated to active investigation.', type: 'milestone', flagged: true },
  { id: 'tl2', date: '2024-03-18', title: 'Batch OCR — Q4 2023 Invoices', description: '45 invoice documents processed with 98% average OCR accuracy. 14 new entities extracted. 12 documents auto-flagged for human review.', type: 'document', flagged: false },
  { id: 'tl3', date: '2024-03-15', title: 'Medicare Reimbursement — $125,000', description: 'Medicare Region 4 disbursed $125,000 to Apex Health Systems for Q4 services. Amount flagged as 47% above expected allowable rate.', type: 'payment', flagged: true, amount: 125_000 },
  { id: 'tl4', date: '2024-03-10', title: 'Whistleblower Memo Obtained', description: 'Confidential internal memo from Compliance Officer James Whitfield disclosed, detailing awareness of billing irregularities. Document classified as key evidence.', type: 'communication', flagged: true },
  { id: 'tl5', date: '2024-03-05', title: 'Duplicate Billing Pattern Confirmed', description: '34 duplicate invoices matched across facilities. Pattern verified by lead investigator Sarah Chen. Estimated exposure: $180,000.', type: 'milestone', flagged: true },
  { id: 'tl6', date: '2024-02-28', title: 'Entity Network Expanded', description: '12 new entities added to the case graph. Network analysis links Apex Health to 3 previously unknown contractor entities sharing billing addresses.', type: 'milestone', flagged: false },
  { id: 'tl7', date: '2024-02-20', title: 'CMS Regulatory Records Received', description: 'Subpoena response from CMS provided 31-page regulatory filing history. Document processed and indexed into case dossier.', type: 'regulatory', flagged: false },
  { id: 'tl8', date: '2024-02-12', title: 'Medicare EOB Statements — Q3 2023', description: 'Explanation of Benefits statements for Q3 2023 received and uploaded (88 pages). Cross-referenced against submitted claims — 19 discrepancies identified.', type: 'document', flagged: false },
  { id: 'tl9', date: '2024-02-05', title: 'Payment Anomaly — $48,500 x2', description: 'Two identical payments of $48,500 issued same day to different facility accounts. Invoice numbers AH-2023-4421 and AH-2023-4422 flagged for duplicate review.', type: 'payment', flagged: true, amount: 97_000 },
  { id: 'tl10', date: '2024-01-28', title: 'Independent Audit Report Obtained', description: 'Third-party billing audit commissioned by CMS received. 67-page report identifies 22 areas of concern. Incorporated into case evidence.', type: 'document', flagged: false },
  { id: 'tl11', date: '2024-01-22', title: 'Service Agreement 2022 Analyzed', description: 'Original contract between Apex and Medicare Region 4 reviewed. Allowable rate schedules extracted and used as baseline for overbilling calculations.', type: 'regulatory', flagged: false },
  { id: 'tl12', date: '2024-01-15', title: 'Case Opened — CF-2024-001', description: 'Case formally opened by investigator Sarah Chen following referral from CMS Office of Inspector General. Initial document set of 18 files uploaded.', type: 'milestone', flagged: false },
];

const timelineTypeConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  document:      { label: 'Document',      color: 'bg-primary-muted text-primary-light',        dotColor: 'bg-[#3B82F6]' },
  payment:       { label: 'Payment',       color: 'bg-verified-green-muted text-verified-green', dotColor: 'bg-[#059669]' },
  communication: { label: 'Communication', color: 'bg-warning-muted text-warning',               dotColor: 'bg-[#D97706]' },
  regulatory:    { label: 'Regulatory',    color: 'bg-accent-muted text-accent-light',           dotColor: 'bg-[#8B5CF6]' },
  milestone:     { label: 'Milestone',     color: 'bg-info-muted text-info',                     dotColor: 'bg-[#6B7280]' },
};

/* ── Evidence tab data ── */
const evidenceItems: Array<{
  id: string;
  title: string;
  exhibit: string;
  evidence_type: 'Exhibit' | 'Witness Statement' | 'Expert Report' | 'Digital Record';
  date_obtained: string;
  relevance: number;
  status: 'verified' | 'pending' | 'under_review';
  source: string;
}> = [
  { id: 'ev1', title: 'Q4 2023 Medicare Invoice Batch', exhibit: 'EX-001', evidence_type: 'Exhibit', date_obtained: '2024-03-18', relevance: 98, status: 'verified', source: 'Apex Health Records Subpoena' },
  { id: 'ev2', title: 'Internal Compliance Memo — Feb 2024', exhibit: 'EX-002', evidence_type: 'Exhibit', date_obtained: '2024-03-10', relevance: 95, status: 'verified', source: 'Whistleblower Disclosure' },
  { id: 'ev3', title: 'CMS Independent Billing Audit Report', exhibit: 'EX-003', evidence_type: 'Expert Report', date_obtained: '2024-01-28', relevance: 91, status: 'verified', source: 'CMS Office of Inspector General' },
  { id: 'ev4', title: 'Dr. Linda Park — Testimony re: NPI Usage', exhibit: 'WS-001', evidence_type: 'Witness Statement', date_obtained: '2024-03-05', relevance: 87, status: 'verified', source: 'Voluntary Cooperation' },
  { id: 'ev5', title: 'Apex Health EMR System Logs', exhibit: 'EX-004', evidence_type: 'Digital Record', date_obtained: '2024-02-20', relevance: 82, status: 'under_review', source: 'CMS Regulatory Request' },
  { id: 'ev6', title: 'Statistical Analysis of CPT Code Distribution', exhibit: 'ER-001', evidence_type: 'Expert Report', date_obtained: '2024-03-01', relevance: 93, status: 'verified', source: 'Forensic Billing Expert — Dr. Anita Rao' },
  { id: 'ev7', title: 'Duplicate Invoice Comparison Matrix', exhibit: 'EX-005', evidence_type: 'Exhibit', date_obtained: '2024-03-05', relevance: 96, status: 'verified', source: 'AI-generated Analysis' },
  { id: 'ev8', title: 'James Whitfield — Compliance Officer Testimony', exhibit: 'WS-002', evidence_type: 'Witness Statement', date_obtained: '2024-03-12', relevance: 79, status: 'pending', source: 'Scheduled Interview' },
];

const evidenceTypeColor: Record<string, string> = {
  Exhibit:           'bg-primary-muted text-primary-light',
  'Witness Statement': 'bg-warning-muted text-warning',
  'Expert Report':   'bg-accent-muted text-accent-light',
  'Digital Record':  'bg-info-muted text-info',
};

const evidenceStatusConfig: Record<string, { label: string; color: string }> = {
  verified:     { label: 'Verified',     color: 'text-verified-green' },
  pending:      { label: 'Pending',      color: 'text-warning' },
  under_review: { label: 'Under Review', color: 'text-text-secondary' },
};

export default function CaseDetailPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [docSearch, setDocSearch] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [evidenceSearch, setEvidenceSearch] = useState('');

  const filteredDocs = caseDocuments.filter((d) =>
    d.name.toLowerCase().includes(docSearch.toLowerCase()),
  );

  const filteredEntities = entitiesDetail.filter((e) =>
    e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
    getEntityLabel(e.type).toLowerCase().includes(entitySearch.toLowerCase()),
  );

  const filteredEvidence = evidenceItems.filter((e) =>
    e.title.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
    e.exhibit.toLowerCase().includes(evidenceSearch.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={caseData.title} subtitle={`${caseData.case_number} • ${caseData.defendant}`}>
        <PresenceAvatars
          channelId={`case-${caseData.id}`}
          currentUser={{ id: 'current', name: 'You' }}
        />
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
        {/* ── Overview ── */}
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

            {/* AI Case Assistant */}
            <AIClaimAssist
              caseTitle={caseData.title}
              defendantName={caseData.defendant}
              estimatedFraudAmount={caseData.estimated_fraud_amount}
              jurisdiction={caseData.jurisdiction}
              status={caseData.status}
            />
          </div>
        )}

        {/* ── Documents tab ── */}
        {activeTab === 'Documents' && (
          <div className="space-y-4">
            {/* Upload zone */}
            <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-default bg-bg-surface px-6 py-8 transition-colors hover:border-border-emphasis hover:bg-bg-surface-raised">
              <Upload className="h-6 w-6 text-text-tertiary" />
              <p className="text-sm font-medium text-text-secondary">Drag files here or click to upload</p>
              <p className="text-xs text-text-tertiary">PDF, DOCX, XLSX, PNG, JPG — max 50 MB per file</p>
              <button className="mt-1 rounded-lg border border-border-default px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                Browse Files
              </button>
            </div>

            {/* Search + stats row */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-surface py-2 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border-emphasis"
                />
              </div>
              <span className="shrink-0 text-xs text-text-tertiary">{filteredDocs.length} of {caseDocuments.length} documents</span>
            </div>

            {/* Documents table */}
            <div className="rounded-xl border border-border-default bg-bg-surface">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-border-default px-4 py-2.5">
                {['Name', 'Type', 'OCR %', 'Entities', 'Pages', 'Size', 'Uploaded', 'Actions'].map((h) => (
                  <span key={h} className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-border-muted">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised',
                      doc.flagged && 'border-l-2 border-fraud-red',
                    )}
                  >
                    {/* Name */}
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-text-primary">{doc.name}</p>
                        {doc.flagged && (
                          <span className="text-[10px] text-fraud-red">Flagged for review</span>
                        )}
                      </div>
                    </div>
                    {/* Type */}
                    <span className={cn('w-fit rounded-full px-2 py-0.5 text-[10px] font-medium', docTypeColor[doc.type])}>
                      {docTypeLabel[doc.type]}
                    </span>
                    {/* OCR */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-bg-surface-raised">
                        <div className="h-full rounded-full bg-verified-green" style={{ width: `${doc.ocr}%` }} />
                      </div>
                      <span className="text-[10px] text-text-secondary">{doc.ocr}%</span>
                    </div>
                    {/* Entities */}
                    <span className="text-xs text-text-secondary">{doc.entities}</span>
                    {/* Pages */}
                    <span className="text-xs text-text-secondary">{doc.pages}</span>
                    {/* Size */}
                    <span className="text-xs text-text-secondary">{formatFileSize(doc.size)}</span>
                    {/* Date */}
                    <span className="text-xs text-text-tertiary">{formatDate(doc.date)}</span>
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-primary">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-primary">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Entities tab ── */}
        {activeTab === 'Entities' && (
          <div className="space-y-4">
            {/* Search + count */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search entities by name or type..."
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-surface py-2 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border-emphasis"
                />
              </div>
              <span className="shrink-0 text-xs text-text-tertiary">{filteredEntities.length} entities</span>
            </div>

            {/* Entity type legend */}
            <div className="flex flex-wrap items-center gap-3">
              {(['person', 'organization', 'payment', 'contract', 'location'] as EntityType[]).map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getEntityColor(t) }} />
                  <span className="text-[10px] text-text-tertiary">{getEntityLabel(t)}</span>
                </div>
              ))}
            </div>

            {/* Entity cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredEntities.map((entity) => (
                <div
                  key={entity.id}
                  className={cn(
                    'rounded-xl border bg-bg-surface p-4 transition-colors hover:bg-bg-surface-raised',
                    entity.flagged ? 'border-fraud-red/40' : 'border-border-default',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getEntityColor(entity.type) }} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{entity.name}</p>
                        <p className="text-[10px] text-text-tertiary">{getEntityLabel(entity.type)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {entity.flagged && <Flag className="h-3 w-3 text-fraud-red" />}
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-text-secondary">{entity.role}</p>

                  <div className="mt-3 flex items-center gap-4 border-t border-border-muted pt-3">
                    <div>
                      <div className="text-[10px] text-text-tertiary">Mentions</div>
                      <div className="text-xs font-medium text-text-primary">{entity.mentions}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-tertiary">Relationships</div>
                      <div className="text-xs font-medium text-text-primary">{entity.relationships}</div>
                    </div>
                    <div className="ml-auto">
                      {entity.flagged
                        ? <span className="rounded-full bg-fraud-red-muted px-2 py-0.5 text-[10px] font-medium text-fraud-red">Flagged</span>
                        : <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary">Clear</span>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Patterns tab ── */}
        {activeTab === 'Patterns' && (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><BarChart3 className="h-3 w-3" /> Total Patterns</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{patternsDetail.length}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Total Estimated Amount</div>
                <div className="financial-figure mt-1 text-2xl font-semibold text-fraud-red">
                  {formatCurrency(patternsDetail.reduce((s, p) => s + p.amount, 0))}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><CheckCircle2 className="h-3 w-3" /> Verified</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">
                  {patternsDetail.filter((p) => p.verified).length} / {patternsDetail.length}
                </div>
              </div>
            </div>

            {/* Pattern list */}
            <div className="space-y-3">
              {patternsDetail.map((p) => (
                <div key={p.id} className="rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:bg-bg-surface-raised">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: name + badges */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{getFraudPatternLabel(p.type)}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getConfidenceColor(p.confidence_level))}>
                          {p.confidence_level}
                        </span>
                        {p.verified && (
                          <span className="flex items-center gap-0.5 rounded-full bg-verified-green-muted px-2 py-0.5 text-[10px] font-medium text-verified-green">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                        <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary">{p.detection}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{p.description}</p>

                      {/* Evidence link count */}
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-text-tertiary">
                        <FileText className="h-3 w-3" />
                        <span>{p.evidence_docs} evidence documents linked</span>
                      </div>
                    </div>

                    {/* Right: amount */}
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-text-tertiary">Est. Exposure</div>
                      <div className="financial-figure text-lg font-semibold text-fraud-red">{formatCurrency(p.amount)}</div>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                      <span>Confidence</span>
                      <span>{p.confidence_pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-surface-raised">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          p.confidence_level === 'critical' ? 'bg-fraud-red'
                            : p.confidence_level === 'high' ? 'bg-verified-green'
                            : p.confidence_level === 'medium' ? 'bg-warning'
                            : 'bg-text-tertiary',
                        )}
                        style={{ width: `${p.confidence_pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Timeline tab ── */}
        {activeTab === 'Timeline' && (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(timelineTypeConfig).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={cn('h-2 w-2 rounded-full', cfg.dotColor)} />
                  <span className="text-[10px] text-text-tertiary">{cfg.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Flag className="h-3 w-3 text-fraud-red" />
                <span className="text-[10px] text-text-tertiary">Flagged event</span>
              </div>
            </div>

            {/* Timeline entries */}
            <div className="relative rounded-xl border border-border-default bg-bg-surface">
              {/* Vertical line */}
              <div className="absolute left-[2.75rem] top-4 bottom-4 w-px bg-border-muted" />

              <div className="divide-y divide-border-muted">
                {timelineDetail.map((event) => {
                  const cfg = timelineTypeConfig[event.type];
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'relative flex gap-4 px-4 py-4 transition-colors hover:bg-bg-surface-raised',
                        event.flagged && 'border-l-2 border-fraud-red',
                      )}
                    >
                      {/* Dot */}
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-default bg-bg-surface">
                        <div className={cn('h-2.5 w-2.5 rounded-full', event.flagged ? 'bg-fraud-red' : cfg.dotColor)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{event.title}</span>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', cfg.color)}>
                            {cfg.label}
                          </span>
                          {event.flagged && (
                            <span className="flex items-center gap-0.5 rounded-full bg-fraud-red-muted px-2 py-0.5 text-[10px] font-medium text-fraud-red">
                              <Flag className="h-2.5 w-2.5" /> Flagged
                            </span>
                          )}
                          {event.amount !== undefined && (
                            <span className="financial-figure text-[10px] font-medium text-fraud-red">
                              {formatCurrency(event.amount)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{event.description}</p>
                      </div>

                      {/* Date */}
                      <div className="shrink-0 pt-0.5 text-right">
                        <span className="text-xs text-text-tertiary">{formatDate(event.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Evidence tab ── */}
        {activeTab === 'Evidence' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search evidence by title or exhibit number..."
                  value={evidenceSearch}
                  onChange={(e) => setEvidenceSearch(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-surface py-2 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border-emphasis"
                />
              </div>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-hover">
                <Upload className="h-3.5 w-3.5" />
                Add Evidence
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary">Total Items</div>
                <div className="mt-1 text-2xl font-semibold text-text-primary">{evidenceItems.length}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><CheckCircle2 className="h-3 w-3" /> Verified</div>
                <div className="mt-1 text-2xl font-semibold text-verified-green">
                  {evidenceItems.filter((e) => e.status === 'verified').length}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary"><Clock className="h-3 w-3" /> Pending Review</div>
                <div className="mt-1 text-2xl font-semibold text-warning">
                  {evidenceItems.filter((e) => e.status !== 'verified').length}
                </div>
              </div>
            </div>

            {/* Evidence table */}
            <div className="rounded-xl border border-border-default bg-bg-surface">
              {/* Header */}
              <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border-default px-4 py-2.5">
                {['Exhibit', 'Title', 'Type', 'Date Obtained', 'Relevance', 'Status', 'Actions'].map((h) => (
                  <span key={h} className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-border-muted">
                {filteredEvidence.map((ev) => {
                  const statusCfg = evidenceStatusConfig[ev.status];
                  return (
                    <div key={ev.id} className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-raised">
                      {/* Exhibit # */}
                      <span className="rounded bg-bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">{ev.exhibit}</span>
                      {/* Title */}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-text-primary">{ev.title}</p>
                        <p className="truncate text-[10px] text-text-tertiary">{ev.source}</p>
                      </div>
                      {/* Type */}
                      <span className={cn('w-fit rounded-full px-2 py-0.5 text-[10px] font-medium', evidenceTypeColor[ev.evidence_type])}>
                        {ev.evidence_type}
                      </span>
                      {/* Date */}
                      <span className="text-xs text-text-tertiary">{formatDate(ev.date_obtained)}</span>
                      {/* Relevance bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="h-1 w-14 overflow-hidden rounded-full bg-bg-surface-raised">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${ev.relevance}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-secondary">{ev.relevance}%</span>
                      </div>
                      {/* Status */}
                      <div className="flex items-center gap-1">
                        {ev.status === 'verified' && <CheckCircle2 className="h-3 w-3 text-verified-green" />}
                        <span className={cn('text-xs font-medium', statusCfg.color)}>{statusCfg.label}</span>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-primary">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-primary">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-primary">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
