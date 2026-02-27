'use client';

import { useState, useTransition } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatDate } from '@/lib/utils';
import {
  FileText,
  Plus,
  Eye,
  Edit3,
  FileDown,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { Case } from '@/types/database';
import {
  createReport,
  updateReportStatus,
  deleteReport,
  generateReportContent,
  saveReportContent,
  type Report,
  type ReportType,
  type ReportStatus,
} from '@/lib/actions/reports';

const REPORT_TEMPLATES: { type: ReportType; name: string; description: string; sections: number }[] =
  [
    { type: 'preliminary', name: 'Preliminary Findings', description: 'Initial assessment of fraud indicators and evidence summary', sections: 6 },
    { type: 'full_investigation', name: 'Full Investigation Report', description: 'Comprehensive report with complete evidence chain and analysis', sections: 15 },
    { type: 'evidence_package', name: 'Evidence Package', description: 'Court-ready evidence compilation with chain of custody', sections: 12 },
    { type: 'executive_summary', name: 'Executive Summary', description: 'High-level overview for stakeholders and decision makers', sections: 4 },
    { type: 'whistleblower', name: 'Qui Tam / Whistleblower Filing', description: 'False Claims Act complaint package with supporting evidence', sections: 8 },
  ];

function getReportTypeLabel(type: ReportType): string {
  return REPORT_TEMPLATES.find((t) => t.type === type)?.name ?? type;
}

function getStatusBadge(status: ReportStatus): { color: string; label: string } {
  const map: Record<ReportStatus, { color: string; label: string }> = {
    draft: { color: 'bg-bg-surface-raised text-text-tertiary', label: 'Draft' },
    review: { color: 'bg-warning-muted text-warning', label: 'Under Review' },
    finalized: { color: 'bg-verified-green-muted text-verified-green', label: 'Finalized' },
  };
  return map[status];
}

function getNextStatus(current: ReportStatus): ReportStatus | null {
  if (current === 'draft') return 'review';
  if (current === 'review') return 'finalized';
  return null;
}

interface ReportsViewProps {
  initialReports: Report[];
  cases: Case[];
}

export function ReportsView({ initialReports, cases }: ReportsViewProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    case_id: '',
    report_type: 'preliminary' as ReportType,
  });

  function handleSelectTemplate(type: ReportType) {
    const template = REPORT_TEMPLATES.find((t) => t.type === type);
    setCreateForm((f) => ({
      ...f,
      report_type: type,
      title: f.title || (template?.name ?? ''),
    }));
  }

  function handleCreate() {
    if (!createForm.title.trim()) {
      setFormError('Title is required');
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const result = await createReport({
        title: createForm.title,
        case_id: createForm.case_id || undefined,
        report_type: createForm.report_type,
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.data) {
        setReports((prev) => [result.data!, ...prev]);
      }

      setCreateForm({ title: '', case_id: '', report_type: 'preliminary' });
      setShowTemplates(false);
    });
  }

  function handleAdvanceStatus(report: Report) {
    const next = getNextStatus(report.status);
    if (!next) return;

    startTransition(async () => {
      const result = await updateReportStatus(report.id, next);
      if (result.error) return;
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: next } : r)));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteReport(id);
      if (result.error) return;
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (viewingReport?.id === id) setViewingReport(null);
    });
  }

  function handleGenerate(report: Report) {
    if (!report.case_id) {
      setFormError('This report is not linked to a case. Link to a case first to generate content.');
      return;
    }

    setGeneratingId(report.id);
    startTransition(async () => {
      const result = await generateReportContent(report.case_id!, report.report_type);

      if (result.error || !result.data) {
        setGeneratingId(null);
        setFormError(result.error ?? 'Generation failed');
        return;
      }

      // Save the generated content
      const saveResult = await saveReportContent(report.id, result.data.content);
      setGeneratingId(null);

      if (saveResult.data) {
        const updated = saveResult.data;
        setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, ...updated } : r)));
        setViewingReport({ ...report, content: result.data!.content });
      }
    });
  }

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
        {/* Create Form */}
        {showTemplates && (
          <div className="rounded-xl border border-primary bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="legal-heading text-sm text-text-primary">Create New Report</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="rounded-md p-1 text-text-tertiary hover:bg-bg-surface-raised"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Report Title *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Preliminary Findings - Apex Health"
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Linked Case (optional)
                </label>
                <select
                  value={createForm.case_id}
                  onChange={(e) => setCreateForm((f) => ({ ...f, case_id: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">No case linked</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h4 className="mb-3 text-xs font-medium text-text-secondary">Choose Template</h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {REPORT_TEMPLATES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => handleSelectTemplate(t.type)}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-all',
                    createForm.report_type === t.type
                      ? 'border-primary shadow-glow-primary'
                      : 'border-border-default hover:border-primary'
                  )}
                >
                  <div className="text-sm font-medium text-text-primary">{t.name}</div>
                  <p className="mt-1 text-xs text-text-secondary">{t.description}</p>
                  <div className="mt-2 text-[10px] text-text-tertiary">{t.sections} sections</div>
                </button>
              ))}
            </div>

            {formError && <p className="mt-2 text-xs text-fraud-red">{formError}</p>}

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create Report'}
              </button>
              <button
                onClick={() => setShowTemplates(false)}
                className="rounded-lg border border-border-default px-4 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Report viewer */}
        {viewingReport && (
          <div className="rounded-xl border border-border-default bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <div>
                <h3 className="text-sm font-medium text-text-primary">{viewingReport.title}</h3>
                <p className="text-[10px] text-text-tertiary">
                  {getReportTypeLabel(viewingReport.report_type)}
                </p>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="rounded-md p-1 text-text-tertiary hover:bg-bg-surface-raised"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {viewingReport.content ? (
              <div className="prose prose-sm max-w-none p-5 text-text-primary">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-secondary">
                  {viewingReport.content}
                </pre>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-text-tertiary">
                  No content yet — click "Generate" to create AI-drafted content
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reports List */}
        <div className="rounded-xl border border-border-default bg-bg-surface">
          <div className="border-b border-border-default px-4 py-3">
            <h3 className="legal-heading text-sm text-text-primary">
              Generated Reports ({reports.length})
            </h3>
          </div>

          {reports.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <FileText className="h-8 w-8 text-text-tertiary" />
              <p className="mt-2 text-sm text-text-tertiary">No reports yet — create your first report</p>
            </div>
          ) : (
            <div className="divide-y divide-border-muted">
              {reports.map((r) => {
                const badge = getStatusBadge(r.status);
                const nextStatus = getNextStatus(r.status);
                const isGenerating = generatingId === r.id;

                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-bg-surface-raised"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-text-tertiary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {r.title}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            badge.color
                          )}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
                        {r.case_number && (
                          <span className="font-mono">{r.case_number}</span>
                        )}
                        <span>{getReportTypeLabel(r.report_type)}</span>
                        {r.sections > 0 && <span>{r.sections} sections</span>}
                        {r.pages > 0 && <span>{r.pages} pages</span>}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs text-text-secondary">{r.created_by}</div>
                      <div className="text-[10px] text-text-tertiary">
                        Updated {formatDate(r.updated_at)}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {/* View */}
                      <button
                        onClick={() => setViewingReport(viewingReport?.id === r.id ? null : r)}
                        title="View"
                        className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {/* Generate content (AI) */}
                      {r.case_id && (
                        <button
                          onClick={() => handleGenerate(r)}
                          disabled={isPending || isGenerating}
                          title="Generate AI content"
                          className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-primary-light disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Edit3 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}

                      {/* Advance status */}
                      {nextStatus && (
                        <button
                          onClick={() => handleAdvanceStatus(r)}
                          disabled={isPending}
                          title={`Advance to ${nextStatus}`}
                          className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-verified-green disabled:opacity-50"
                        >
                          {nextStatus === 'review' ? (
                            <Clock className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}

                      {/* Export placeholder */}
                      <button
                        title="Download"
                        className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={isPending}
                        title="Delete"
                        className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-fraud-red-muted hover:text-fraud-red disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
