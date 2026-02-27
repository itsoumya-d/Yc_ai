'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  FileText,
  Plus,
  Eye,
  Edit3,
  FileDown,
  Printer,
  Send,
} from 'lucide-react';
import type { Report } from '@/lib/actions/reports';

const reportTemplates = [
  { id: 't1', name: 'Preliminary Findings', description: 'Initial assessment of fraud indicators and evidence summary', sections: 6 },
  { id: 't2', name: 'Full Investigation Report', description: 'Comprehensive report with complete evidence chain and analysis', sections: 15 },
  { id: 't3', name: 'Evidence Package', description: 'Court-ready evidence compilation with chain of custody', sections: 12 },
  { id: 't4', name: 'Executive Summary', description: 'High-level overview for stakeholders and decision makers', sections: 4 },
  { id: 't5', name: 'Qui Tam / Whistleblower Filing', description: 'False Claims Act complaint package with supporting evidence', sections: 8 },
];

function getStatusBadge(status: Report['status']): { color: string; label: string } {
  const map: Record<Report['status'], { color: string; label: string }> = {
    draft: { color: 'bg-bg-surface-raised text-text-tertiary', label: 'Draft' },
    final: { color: 'bg-verified-green-muted text-verified-green', label: 'Final' },
  };
  return map[status];
}

interface ReportsClientProps {
  reports: Report[];
}

export function ReportsClient({ reports }: ReportsClientProps) {
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
          {reports.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-text-tertiary" />
                <p className="mt-2 text-sm text-text-tertiary">No reports yet. Create your first report from a template.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border-muted">
              {reports.map((r) => {
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
                        <span className="font-mono text-[10px]">{r.case_id}</span>
                        {r.pattern_count > 0 && <span>{r.pattern_count} patterns</span>}
                        {r.affected_amount > 0 && (
                          <span className="financial-figure text-fraud-red">{formatCurrency(r.affected_amount)}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-text-tertiary">Created {formatDate(r.created_at)}</div>
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
          )}
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
