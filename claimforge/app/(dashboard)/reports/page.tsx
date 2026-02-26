'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getCases } from '@/lib/actions/reports';
import {
  FileText,
  Plus,
  Download,
  Eye,
  FileDown,
  Printer,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { Case } from '@/types/database';

const reportTemplates = [
  { id: 't1', name: 'Preliminary Findings', description: 'Initial assessment of fraud indicators and evidence summary', sections: 6 },
  { id: 't2', name: 'Full Investigation Report', description: 'Comprehensive report with complete evidence chain and analysis', sections: 15 },
  { id: 't3', name: 'Evidence Package', description: 'Court-ready evidence compilation with chain of custody', sections: 12 },
  { id: 't4', name: 'Executive Summary', description: 'High-level overview for stakeholders and decision makers', sections: 4 },
  { id: 't5', name: 'Qui Tam / Whistleblower Filing', description: 'False Claims Act complaint package with supporting evidence', sections: 8 },
];

function getStatusBadge(status: Case['status']): { color: string; label: string } {
  const map: Record<string, { color: string; label: string }> = {
    open: { color: 'bg-primary/10 text-primary', label: 'Open' },
    under_review: { color: 'bg-warning-muted text-warning', label: 'Under Review' },
    pending_evidence: { color: 'bg-bg-surface-raised text-text-secondary', label: 'Pending Evidence' },
    closed: { color: 'bg-verified-green-muted text-verified-green', label: 'Closed' },
    archived: { color: 'bg-bg-surface-raised text-text-tertiary', label: 'Archived' },
  };
  return map[status] ?? { color: 'bg-bg-surface-raised text-text-tertiary', label: status };
}

export default function ReportsPage() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    getCases().then(result => {
      setLoading(false);
      if (result.error) setError(result.error);
      else setCases(result.data ?? []);
    });
  }, []);

  const handleExportPdf = (caseId: string) => {
    setGenerating(caseId);
    // Open in new tab — browser handles print/save
    window.open(`/api/cases/${caseId}/report`, '_blank');
    setTimeout(() => setGenerating(null), 1500);
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Reports" subtitle="Generate and export investigation reports as PDF">
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

        {/* Cases / Reports List */}
        <div className="rounded-xl border border-border-default bg-bg-surface">
          <div className="border-b border-border-default px-4 py-3 flex items-center justify-between">
            <h3 className="legal-heading text-sm text-text-primary">Cases — Export Investigation Reports</h3>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && cases.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-tertiary">
              No cases found. Create a case to generate reports.
            </div>
          )}

          <div className="divide-y divide-border-muted">
            {cases.map((c) => {
              const badge = getStatusBadge(c.status);
              const isGenerating = generating === c.id;
              return (
                <div key={c.id} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-bg-surface-raised">
                  <FileText className="h-5 w-5 shrink-0 text-text-tertiary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">{c.title}</span>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', badge.color)}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
                      <span className="font-mono">{c.case_number}</span>
                      <span>{c.defendant_name}</span>
                      {c.estimated_fraud_amount > 0 && (
                        <span className="text-fraud-red font-medium">
                          {formatCurrency(c.estimated_fraud_amount)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-text-secondary">{c.jurisdiction}</div>
                    <div className="text-[10px] text-text-tertiary">Updated {formatDate(c.updated_at)}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleExportPdf(c.id)}
                      disabled={isGenerating}
                      title="Export as PDF"
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                      ) : (
                        <><ExternalLink className="h-3 w-3" /> Export PDF</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Format Options */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-5">
          <h3 className="legal-heading mb-1 text-sm text-text-primary">Export Formats</h3>
          <p className="text-xs text-text-tertiary mb-4">Select a case above and choose your preferred export format.</p>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 p-3 text-sm text-primary font-medium">
              <FileDown className="h-4 w-4" /> PDF (Active)
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-tertiary opacity-50 cursor-not-allowed">
              <FileText className="h-4 w-4" /> DOCX (Coming soon)
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-tertiary opacity-50 cursor-not-allowed">
              <Printer className="h-4 w-4" /> Print (Coming soon)
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-sm text-text-tertiary opacity-50 cursor-not-allowed">
              <Send className="h-4 w-4" /> Send to Counsel (Coming soon)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
