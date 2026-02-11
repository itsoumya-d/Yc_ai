'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  FileText,
  Plus,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  FileDown,
  Printer,
  Send,
} from 'lucide-react';
import type { CaseStatus } from '@/types/database';

interface Report {
  id: string;
  title: string;
  case_number: string;
  case_title: string;
  type: 'preliminary' | 'full_investigation' | 'evidence_package' | 'executive_summary' | 'whistleblower';
  status: 'draft' | 'review' | 'finalized';
  sections: number;
  pages: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const demoReports: Report[] = [
  { id: 'r1', title: 'Preliminary Findings - Apex Health Overbilling', case_number: 'CF-2024-001', case_title: 'Medicare Overbilling', type: 'preliminary', status: 'finalized', sections: 6, pages: 24, created_by: 'Sarah Chen', created_at: '2024-02-15', updated_at: '2024-03-01' },
  { id: 'r2', title: 'Evidence Package - TechDefense Contract Fraud', case_number: 'CF-2024-002', case_title: 'DOD Contract Fraud', type: 'evidence_package', status: 'review', sections: 12, pages: 67, created_by: 'Michael Torres', created_at: '2024-03-10', updated_at: '2024-03-19' },
  { id: 'r3', title: 'Executive Summary - Metro Housing Kickbacks', case_number: 'CF-2024-003', case_title: 'HUD Kickback Scheme', type: 'executive_summary', status: 'draft', sections: 4, pages: 8, created_by: 'Lisa Park', created_at: '2024-03-15', updated_at: '2024-03-20' },
  { id: 'r4', title: 'Full Investigation Report - CarePlus', case_number: 'CF-2024-004', case_title: 'Medicaid Phantom Billing', type: 'full_investigation', status: 'finalized', sections: 15, pages: 112, created_by: 'David Kim', created_at: '2024-01-20', updated_at: '2024-03-10' },
  { id: 'r5', title: 'Qui Tam Filing Package - Apex Health', case_number: 'CF-2024-001', case_title: 'Medicare Overbilling', type: 'whistleblower', status: 'draft', sections: 8, pages: 35, created_by: 'Sarah Chen', created_at: '2024-03-18', updated_at: '2024-03-20' },
];

const reportTemplates = [
  { id: 't1', name: 'Preliminary Findings', description: 'Initial assessment of fraud indicators and evidence summary', sections: 6 },
  { id: 't2', name: 'Full Investigation Report', description: 'Comprehensive report with complete evidence chain and analysis', sections: 15 },
  { id: 't3', name: 'Evidence Package', description: 'Court-ready evidence compilation with chain of custody', sections: 12 },
  { id: 't4', name: 'Executive Summary', description: 'High-level overview for stakeholders and decision makers', sections: 4 },
  { id: 't5', name: 'Qui Tam / Whistleblower Filing', description: 'False Claims Act complaint package with supporting evidence', sections: 8 },
];

function getReportTypeLabel(type: Report['type']): string {
  const labels: Record<Report['type'], string> = {
    preliminary: 'Preliminary',
    full_investigation: 'Full Investigation',
    evidence_package: 'Evidence Package',
    executive_summary: 'Executive Summary',
    whistleblower: 'Qui Tam Filing',
  };
  return labels[type];
}

function getStatusBadge(status: Report['status']): { color: string; label: string } {
  const map: Record<Report['status'], { color: string; label: string }> = {
    draft: { color: 'bg-bg-surface-raised text-text-tertiary', label: 'Draft' },
    review: { color: 'bg-warning-muted text-warning', label: 'Under Review' },
    finalized: { color: 'bg-verified-green-muted text-verified-green', label: 'Finalized' },
  };
  return map[status];
}

export default function ReportsPage() {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Reports" subtitle="Generate and manage investigation reports">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New Report
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Template Selector */}
        {showTemplates && (
          <div className="rounded-xl border border-primary bg-bg-surface p-5">
            <h3 className="legal-heading mb-4 text-sm text-text-primary">Choose Report Template</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reportTemplates.map((t) => (
                <button
                  key={t.id}
                  className="rounded-lg border border-border-default p-4 text-left transition-all hover:border-primary hover:shadow-glow-primary"
                >
                  <div className="text-sm font-medium text-text-primary">{t.name}</div>
                  <p className="mt-1 text-xs text-text-secondary">{t.description}</p>
                  <div className="mt-2 text-[10px] text-text-tertiary">{t.sections} sections</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="rounded-xl border border-border-default bg-bg-surface">
          <div className="border-b border-border-default px-4 py-3">
            <h3 className="legal-heading text-sm text-text-primary">Generated Reports</h3>
          </div>
          <div className="divide-y divide-border-muted">
            {demoReports.map((r) => {
              const badge = getStatusBadge(r.status);
              return (
                <div key={r.id} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-bg-surface-raised">
                  <FileText className="h-5 w-5 shrink-0 text-text-tertiary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">{r.title}</span>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', badge.color)}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
                      <span className="font-mono">{r.case_number}</span>
                      <span>{getReportTypeLabel(r.type)}</span>
                      <span>{r.sections} sections</span>
                      <span>{r.pages} pages</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-text-secondary">{r.created_by}</div>
                    <div className="text-[10px] text-text-tertiary">Updated {formatDate(r.updated_at)}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary">
                      <FileDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-5">
          <h3 className="legal-heading mb-4 text-sm text-text-primary">Export Options</h3>
          <div className="grid grid-cols-4 gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
              <FileDown className="h-4 w-4" /> Export as PDF
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
              <FileText className="h-4 w-4" /> Export as DOCX
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised">
              <Send className="h-4 w-4" /> Send to Counsel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
