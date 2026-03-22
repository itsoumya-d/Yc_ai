'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import type { Claim } from '@/types/database';
import {
  getClaimDocuments,
  generateExport,
  generateBatesStamp,
  getExportHistory,
  downloadExport,
  type ClaimDocument,
  type ExportOptions,
  type ExportRecord,
} from '@/lib/actions/court-export';
import { formatFileSize, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Hash,
  Loader2,
  Package,
  Settings2,
  Shield,
  Eye,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

/* ── Wizard Steps ── */

const STEPS = [
  { id: 1, label: 'Select Documents', icon: FileText },
  { id: 2, label: 'Bates Numbering', icon: Hash },
  { id: 3, label: 'Export Options', icon: Settings2 },
  { id: 4, label: 'Review & Generate', icon: Package },
] as const;

/* ── Component ── */

interface Props {
  claim: Claim | null;
  error?: string;
}

export function ExportWizardClient({ claim, error }: Props) {
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportResult, setExportResult] = useState<ExportRecord | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExportRecord[]>([]);

  // Bates config
  const [batesPrefix, setBatesPrefix] = useState(claim?.claim_number || 'CLM');
  const [batesStart, setBatesStart] = useState(1);
  const [batesPadding, setBatesPadding] = useState(6);
  const [batesSeparator, setBatesSeparator] = useState<'-' | '.' | ''>('-');

  // Export options
  const [includeIndex, setIncludeIndex] = useState(true);
  const [includePrivilegeLog, setIncludePrivilegeLog] = useState(true);
  const [includeCoverSheet, setIncludeCoverSheet] = useState(true);
  const [format, setFormat] = useState<'pdf_bundle' | 'zip'>('pdf_bundle');
  const [confidentiality, setConfidentiality] = useState<ExportOptions['confidentiality']>('none');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Bates preview
  const [batesPreview, setBatesPreview] = useState('');

  useEffect(() => {
    generateBatesStamp(batesPrefix, batesStart, batesPadding, batesSeparator).then(setBatesPreview);
  }, [batesPrefix, batesStart, batesPadding, batesSeparator]);

  // Fetch documents on mount
  useEffect(() => {
    if (!claim) return;
    setLoadingDocs(true);
    Promise.all([
      getClaimDocuments(claim.id),
      getExportHistory(claim.id),
    ]).then(([docResult, histResult]) => {
      if (docResult.data) setDocuments(docResult.data);
      if (histResult.data) setHistory(histResult.data);
      setLoadingDocs(false);
    });
  }, [claim]);

  // Selection helpers
  const toggleDoc = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(documents.map((d) => d.id)));
  }, [documents]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedDocs = useMemo(
    () => documents.filter((d) => selectedIds.has(d.id)),
    [documents, selectedIds]
  );

  const totalSize = useMemo(
    () => selectedDocs.reduce((sum, d) => sum + d.file_size, 0),
    [selectedDocs]
  );

  // Generate export
  const handleGenerate = async () => {
    if (!claim) return;
    setGenerating(true);
    setProgress(0);
    setExportError(null);

    // Simulate progress steps
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 15;
      });
    }, 500);

    const options: ExportOptions = {
      documentIds: Array.from(selectedIds),
      bates: {
        prefix: batesPrefix,
        startNumber: batesStart,
        padding: batesPadding,
        separator: batesSeparator,
      },
      includeIndex,
      includePrivilegeLog,
      includeCoverSheet,
      format,
      confidentiality,
      dateRangeStart: dateRangeStart || undefined,
      dateRangeEnd: dateRangeEnd || undefined,
    };

    const result = await generateExport(claim.id, options);

    clearInterval(progressInterval);
    setProgress(100);

    if (result.error) {
      setExportError(result.error);
    } else if (result.data) {
      setExportResult(result.data);
    }

    setGenerating(false);
  };

  const handleDownload = async (exportId: string) => {
    const result = await downloadExport(exportId);
    if (result.data?.url) {
      window.open(result.data.url, '_blank');
    }
  };

  // Error / not found state
  if (error || !claim) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Export Not Available" subtitle="Unable to load claim">
          <Link
            href="/claims"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </PageHeader>
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-fraud-red/20 bg-fraud-red-muted p-6 text-center">
            <p className="text-sm text-fraud-red">{error || 'Claim not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const canAdvance =
    step === 1 ? selectedIds.size > 0 :
    step === 2 ? batesPrefix.length > 0 && batesPadding >= 6 :
    step === 3 ? true :
    true;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Court-Ready Export"
        subtitle={`${claim.claim_number} · Bates-numbered document production`}
      >
        <Link
          href={`/claims/${claim.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Claim
        </Link>
      </PageHeader>

      {/* Step indicator */}
      <div className="flex items-center gap-1 border-b border-border-default px-6 py-3">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = step === s.id;
          const isComplete = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              {i > 0 && (
                <ChevronRight className="mx-2 h-3.5 w-3.5 text-text-tertiary" />
              )}
              <button
                onClick={() => {
                  if (isComplete) setStep(s.id);
                }}
                disabled={!isComplete && !isActive}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                  isActive
                    ? 'bg-primary-muted text-primary-light font-medium'
                    : isComplete
                      ? 'text-verified-green cursor-pointer hover:bg-bg-surface-raised'
                      : 'text-text-tertiary'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
                {s.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl"
          >
            {/* ── Step 1: Document Selection ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="legal-heading text-sm text-text-primary">Select Documents</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <button onClick={selectAll} className="text-primary-light hover:underline">
                      Select All
                    </button>
                    <span className="text-text-tertiary">|</span>
                    <button onClick={selectNone} className="text-primary-light hover:underline">
                      Select None
                    </button>
                  </div>
                </div>

                {loadingDocs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
                    <span className="ml-2 text-sm text-text-tertiary">Loading documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-text-tertiary mb-2" />
                    <p className="text-sm text-text-tertiary">No documents found for this claim</p>
                    <p className="text-xs text-text-tertiary mt-1">Upload documents to the claim first, then return here to export</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {documents.map((doc) => {
                        const isSelected = selectedIds.has(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'border-primary-light/40 bg-primary-muted/30'
                                : 'border-border-default bg-bg-surface hover:bg-bg-surface-raised'
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                isSelected
                                  ? 'border-primary-light bg-primary-light text-white'
                                  : 'border-border-emphasis bg-bg-surface'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-text-primary truncate">{doc.display_name}</div>
                              <div className="flex items-center gap-3 text-[10px] text-text-tertiary mt-0.5">
                                <span className="capitalize">{doc.document_type.replace(/_/g, ' ')}</span>
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span>{doc.page_count} page{doc.page_count !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selection summary */}
                    <div className="rounded-lg border border-border-default bg-bg-surface-raised px-4 py-2.5 text-xs text-text-secondary flex items-center justify-between">
                      <span>
                        {selectedIds.size} of {documents.length} document{documents.length !== 1 ? 's' : ''} selected
                      </span>
                      <span>Estimated size: {formatFileSize(totalSize)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Step 2: Bates Numbering ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="legal-heading text-sm text-text-primary">Bates Numbering Configuration</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-text-tertiary mb-1">Prefix</label>
                    <input
                      type="text"
                      value={batesPrefix}
                      onChange={(e) => setBatesPrefix(e.target.value)}
                      placeholder="CLM-2026-0001"
                      className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                    />
                    <p className="text-[10px] text-text-tertiary mt-1">Usually the case or claim number</p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-tertiary mb-1">Starting Number</label>
                    <input
                      type="number"
                      value={batesStart}
                      onChange={(e) => setBatesStart(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-tertiary mb-1">Zero-Padding Digits</label>
                    <select
                      value={batesPadding}
                      onChange={(e) => setBatesPadding(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                    >
                      {[6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} digits</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-tertiary mb-1">Separator</label>
                    <select
                      value={batesSeparator}
                      onChange={(e) => setBatesSeparator(e.target.value as '-' | '.' | '')}
                      className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                    >
                      <option value="-">Hyphen ( - )</option>
                      <option value=".">Period ( . )</option>
                      <option value="">None</option>
                    </select>
                  </div>
                </div>

                {/* Live preview */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                  <div className="text-[10px] text-text-tertiary mb-2">Live Preview</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-tertiary w-16">First:</span>
                      <span className="font-mono text-sm text-primary-light font-medium">{batesPreview}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-tertiary w-16">Last:</span>
                      <BatesPreviewLast
                        prefix={batesPrefix}
                        start={batesStart}
                        count={selectedIds.size}
                        padding={batesPadding}
                        separator={batesSeparator}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-tertiary w-16">Range:</span>
                      <span className="text-xs text-text-secondary">
                        {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''} will be numbered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Export Options ── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="legal-heading text-sm text-text-primary">Export Options</h2>

                {/* Inclusions */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-3">
                  <div className="text-[10px] text-text-tertiary mb-1">Include in Export</div>

                  <ToggleOption
                    label="Index Page (Table of Contents)"
                    description="Lists all documents with their Bates ranges"
                    checked={includeIndex}
                    onChange={setIncludeIndex}
                  />
                  <ToggleOption
                    label="Privilege Log (CSV)"
                    description="Document, Bates range, privilege type, and basis for each item"
                    checked={includePrivilegeLog}
                    onChange={setIncludePrivilegeLog}
                  />
                  <ToggleOption
                    label="Cover Sheet"
                    description="Case details, production summary, and date"
                    checked={includeCoverSheet}
                    onChange={setIncludeCoverSheet}
                  />
                </div>

                {/* Format */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-3">
                  <div className="text-[10px] text-text-tertiary mb-1">Export Format</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormat('pdf_bundle')}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        format === 'pdf_bundle'
                          ? 'border-primary-light/40 bg-primary-muted/30'
                          : 'border-border-default hover:bg-bg-surface-raised'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
                        <FileText className="h-4 w-4" />
                        PDF Bundle
                      </div>
                      <p className="text-[10px] text-text-tertiary mt-1">Single merged PDF with all documents</p>
                    </button>
                    <button
                      onClick={() => setFormat('zip')}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        format === 'zip'
                          ? 'border-primary-light/40 bg-primary-muted/30'
                          : 'border-border-default hover:bg-bg-surface-raised'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
                        <Package className="h-4 w-4" />
                        ZIP Archive
                      </div>
                      <p className="text-[10px] text-text-tertiary mt-1">Individual PDFs in a compressed archive</p>
                    </button>
                  </div>
                </div>

                {/* Confidentiality */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-3">
                  <div className="text-[10px] text-text-tertiary mb-1">Confidentiality Stamp</div>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'none', label: 'None', desc: 'No watermark applied' },
                      { value: 'confidential', label: 'Confidential', desc: 'Standard confidentiality designation' },
                      { value: 'attorneys_eyes_only', label: "Attorneys' Eyes Only", desc: 'Restricted to counsel only' },
                      { value: 'highly_confidential', label: 'Highly Confidential', desc: 'Most restrictive designation' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setConfidentiality(opt.value)}
                        className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          confidentiality === opt.value
                            ? 'border-primary-light/40 bg-primary-muted/30'
                            : 'border-border-default hover:bg-bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {opt.value !== 'none' && <Shield className="h-3 w-3 text-warning" />}
                          <span className="text-xs text-text-primary font-medium">{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range filter */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-3">
                  <div className="text-[10px] text-text-tertiary mb-1">Date Range Filter (optional)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-text-tertiary mb-1">From</label>
                      <input
                        type="date"
                        value={dateRangeStart}
                        onChange={(e) => setDateRangeStart(e.target.value)}
                        className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-tertiary mb-1">To</label>
                      <input
                        type="date"
                        value={dateRangeEnd}
                        onChange={(e) => setDateRangeEnd(e.target.value)}
                        className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Review & Generate ── */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="legal-heading text-sm text-text-primary">Review & Generate</h2>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                  <SummaryCard
                    label="Documents"
                    value={`${selectedIds.size}`}
                    sub={formatFileSize(totalSize)}
                  />
                  <SummaryCard
                    label="Bates Range"
                    value={batesPreview}
                    sub={`${selectedIds.size} numbers`}
                  />
                  <SummaryCard
                    label="Format"
                    value={format === 'pdf_bundle' ? 'PDF Bundle' : 'ZIP'}
                    sub={confidentiality === 'none' ? 'No stamp' : confidentiality.replace(/_/g, ' ')}
                  />
                </div>

                {/* Details */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-3">
                  <div className="text-[10px] text-text-tertiary mb-1">Export Configuration</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <SummaryRow label="Claim" value={claim.claim_number} />
                    <SummaryRow label="Bates Prefix" value={batesPrefix} />
                    <SummaryRow label="Starting Number" value={String(batesStart)} />
                    <SummaryRow label="Padding" value={`${batesPadding} digits`} />
                    <SummaryRow label="Separator" value={batesSeparator === '-' ? 'Hyphen' : batesSeparator === '.' ? 'Period' : 'None'} />
                    <SummaryRow label="Index Page" value={includeIndex ? 'Yes' : 'No'} />
                    <SummaryRow label="Privilege Log" value={includePrivilegeLog ? 'Yes' : 'No'} />
                    <SummaryRow label="Cover Sheet" value={includeCoverSheet ? 'Yes' : 'No'} />
                    {dateRangeStart && <SummaryRow label="Date From" value={dateRangeStart} />}
                    {dateRangeEnd && <SummaryRow label="Date To" value={dateRangeEnd} />}
                  </div>
                </div>

                {/* Selected documents list */}
                <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-2">
                  <div className="text-[10px] text-text-tertiary mb-2">Selected Documents</div>
                  {selectedDocs.map((doc, i) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-md px-3 py-1.5 text-xs text-text-secondary bg-bg-surface-raised"
                    >
                      <span className="font-mono text-text-tertiary w-8 text-right">{i + 1}.</span>
                      <FileText className="h-3 w-3 shrink-0 text-text-tertiary" />
                      <span className="flex-1 truncate">{doc.display_name}</span>
                      <span className="text-text-tertiary">{formatFileSize(doc.file_size)}</span>
                    </div>
                  ))}
                </div>

                {/* Generate button / progress */}
                {!exportResult && !exportError && (
                  <div className="space-y-3">
                    {generating && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span>Generating export...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-bg-surface-raised overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary-light"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleGenerate}
                      disabled={generating || selectedIds.size === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-light px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating Court Export...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4" />
                          Generate Court-Ready Export
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Success */}
                {exportResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-verified-green/30 bg-verified-green-muted p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-verified-green" />
                      <span className="text-sm font-medium text-verified-green">Export Generated Successfully</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                      <span>Documents: {exportResult.document_count}</span>
                      <span>Size: {exportResult.file_size_bytes ? formatFileSize(exportResult.file_size_bytes) : 'N/A'}</span>
                      <span>Bates: {exportResult.bates_start} - {exportResult.bates_end}</span>
                      <span>Completed: {exportResult.completed_at ? formatDate(exportResult.completed_at) : 'Now'}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(exportResult.id)}
                      className="flex items-center gap-2 rounded-lg bg-verified-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-verified-green/90"
                    >
                      <Download className="h-4 w-4" />
                      Download Export
                    </button>
                  </motion.div>
                )}

                {/* Error */}
                {exportError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-fraud-red/20 bg-fraud-red-muted p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-fraud-red" />
                      <span className="text-sm font-medium text-fraud-red">Export Failed</span>
                    </div>
                    <p className="text-xs text-fraud-red/80">{exportError}</p>
                    <button
                      onClick={() => { setExportError(null); setProgress(0); }}
                      className="text-xs text-primary-light hover:underline"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Export history */}
        {history.length > 0 && step === 4 && (
          <div className="max-w-3xl mt-8">
            <h3 className="legal-heading text-xs text-text-tertiary mb-3">Previous Exports</h3>
            <div className="space-y-1.5">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-xs"
                >
                  {h.status === 'completed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-verified-green shrink-0" />
                  ) : h.status === 'failed' ? (
                    <XCircle className="h-3.5 w-3.5 text-fraud-red shrink-0" />
                  ) : h.status === 'generating' ? (
                    <Loader2 className="h-3.5 w-3.5 text-primary-light animate-spin shrink-0" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary">
                      {h.bates_prefix}{h.bates_start}–{h.bates_end ?? '?'}
                    </span>
                    <span className="text-text-tertiary ml-2">
                      {h.document_count} doc{h.document_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-text-tertiary">{formatDate(h.created_at)}</span>
                  {h.status === 'completed' && (
                    <button
                      onClick={() => handleDownload(h.id)}
                      className="flex items-center gap-1 text-primary-light hover:underline"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      {!exportResult && (
        <div className="flex items-center justify-between border-t border-border-default px-6 py-3">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="text-xs text-text-tertiary">
            Step {step} of {STEPS.length}
          </div>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canAdvance}
              className="flex items-center gap-1.5 rounded-lg bg-primary-light px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div /> // spacer — generate button is in the step content
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function BatesPreviewLast({
  prefix,
  start,
  count,
  padding,
  separator,
}: {
  prefix: string;
  start: number;
  count: number;
  padding: number;
  separator: string;
}) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (count <= 0) {
      setPreview('(none selected)');
      return;
    }
    generateBatesStamp(prefix, start + count - 1, padding, separator).then(setPreview);
  }, [prefix, start, count, padding, separator]);

  return <span className="font-mono text-sm text-primary-light font-medium">{preview}</span>;
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-bg-surface-raised transition-colors"
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-primary-light bg-primary-light text-white'
            : 'border-border-emphasis bg-bg-surface'
        }`}
      >
        {checked && <Check className="h-3 w-3" />}
      </div>
      <div>
        <div className="text-sm text-text-primary">{label}</div>
        <div className="text-[10px] text-text-tertiary">{description}</div>
      </div>
    </button>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4">
      <div className="text-[10px] text-text-tertiary mb-1">{label}</div>
      <div className="font-mono text-sm font-semibold text-text-primary truncate">{value}</div>
      <div className="text-[10px] text-text-tertiary mt-0.5">{sub}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-tertiary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}
