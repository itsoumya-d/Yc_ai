'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { CSVImport } from '@/components/CSVImport';
import { OcrUpload } from '@/components/OcrUpload';
import {
  Upload,
  FileText,
  FileImage,
  File,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Flag,
  Loader2,
  Tag,
  X,
} from 'lucide-react';
import type { DocumentType } from '@/types/database';

// ── Document list types ───────────────────────────────────────────────────

interface DocumentItem {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: DocumentType;
  case_number: string;
  case_title: string;
  ocr_confidence: number | null;
  entity_count: number;
  page_count: number;
  processed: boolean;
  flagged: boolean;
  uploaded_by: string;
  created_at: string;
}

const demoDocuments: DocumentItem[] = [
  { id: 'd1', title: 'Q4 2023 Medicare Claims - Apex Health', file_name: 'apex_q4_2023_claims.pdf', file_type: 'application/pdf', file_size: 2_450_000, document_type: 'invoice', case_number: 'CF-2024-001', case_title: 'Medicare Overbilling', ocr_confidence: 0.97, entity_count: 23, page_count: 45, processed: true, flagged: true, uploaded_by: 'Sarah Chen', created_at: '2024-03-18' },
  { id: 'd2', title: 'TechDefense Labor Rate Schedule 2023', file_name: 'td_labor_rates_2023.xlsx', file_type: 'application/vnd.ms-excel', file_size: 890_000, document_type: 'contract', case_number: 'CF-2024-002', case_title: 'DOD Contract Fraud', ocr_confidence: null, entity_count: 12, page_count: 8, processed: true, flagged: false, uploaded_by: 'Michael Torres', created_at: '2024-03-17' },
  { id: 'd3', title: 'Metro Housing Vendor Payments 2022-2023', file_name: 'metro_vendor_payments.pdf', file_type: 'application/pdf', file_size: 5_200_000, document_type: 'payment_record', case_number: 'CF-2024-003', case_title: 'HUD Kickback Scheme', ocr_confidence: 0.94, entity_count: 45, page_count: 120, processed: true, flagged: true, uploaded_by: 'Lisa Park', created_at: '2024-03-15' },
  { id: 'd4', title: 'CarePlus Patient Records Audit', file_name: 'careplus_audit_report.pdf', file_type: 'application/pdf', file_size: 1_800_000, document_type: 'audit_report', case_number: 'CF-2024-004', case_title: 'Medicaid Phantom Billing', ocr_confidence: 0.99, entity_count: 67, page_count: 34, processed: true, flagged: true, uploaded_by: 'David Kim', created_at: '2024-03-12' },
  { id: 'd5', title: 'Internal Email Thread - Billing Practices', file_name: 'apex_internal_emails.eml', file_type: 'message/rfc822', file_size: 340_000, document_type: 'correspondence', case_number: 'CF-2024-001', case_title: 'Medicare Overbilling', ocr_confidence: null, entity_count: 8, page_count: 12, processed: true, flagged: true, uploaded_by: 'Sarah Chen', created_at: '2024-03-10' },
  { id: 'd6', title: 'GSA Schedule Contract', file_name: 'gsa_schedule_contract.pdf', file_type: 'application/pdf', file_size: 3_100_000, document_type: 'contract', case_number: 'CF-2024-005', case_title: 'GSA Supply Fraud', ocr_confidence: 0.96, entity_count: 15, page_count: 67, processed: true, flagged: false, uploaded_by: 'Sarah Chen', created_at: '2024-03-08' },
  { id: 'd7', title: 'Vendor Registration Forms Batch', file_name: 'vendor_registrations.pdf', file_type: 'application/pdf', file_size: 780_000, document_type: 'regulatory_filing', case_number: 'CF-2024-003', case_title: 'HUD Kickback Scheme', ocr_confidence: 0.91, entity_count: 19, page_count: 23, processed: true, flagged: false, uploaded_by: 'Lisa Park', created_at: '2024-03-05' },
  { id: 'd8', title: 'Billing Code Comparison Analysis', file_name: 'billing_analysis.pdf', file_type: 'application/pdf', file_size: 420_000, document_type: 'other', case_number: 'CF-2024-006', case_title: 'VA Healthcare Upcoding', ocr_confidence: 0.98, entity_count: 5, page_count: 8, processed: false, flagged: false, uploaded_by: 'Michael Torres', created_at: '2024-03-20' },
];

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('image')) return FileImage;
  return File;
}

function getDocTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    invoice: 'Invoice',
    contract: 'Contract',
    payment_record: 'Payment Record',
    correspondence: 'Correspondence',
    audit_report: 'Audit Report',
    regulatory_filing: 'Regulatory Filing',
    other: 'Other',
  };
  return labels[type];
}

// ── AI tagging types & helpers ────────────────────────────────────────────

type UploadStage = 'queued' | 'uploading' | 'tagging' | 'done';

interface TagChip {
  label: string;
  color: string;
}

interface PendingFile {
  id: string;
  name: string;
  size: number;
  fileType: string;
  stage: UploadStage;
  tags: TagChip[];
  relevance: number;
}

// Deterministic tag pool — assigned based on file name heuristics / round-robin for demo
const tagPool: TagChip[] = [
  { label: 'Medical Record', color: 'bg-blue-500/20 text-blue-300' },
  { label: 'Insurance', color: 'bg-violet-500/20 text-violet-300' },
  { label: 'Police Report', color: 'bg-red-500/20 text-red-300' },
  { label: 'Photo Evidence', color: 'bg-amber-500/20 text-amber-300' },
  { label: 'Legal Brief', color: 'bg-emerald-500/20 text-emerald-300' },
  { label: 'Invoice', color: 'bg-cyan-500/20 text-cyan-300' },
  { label: 'Contract', color: 'bg-pink-500/20 text-pink-300' },
];

function pickTags(fileName: string, index: number): TagChip[] {
  // Simple heuristic: pick 2-3 tags seeded by file name length + index
  const seed = (fileName.length + index) % tagPool.length;
  const count = 2 + (index % 2); // 2 or 3
  const result: TagChip[] = [];
  for (let i = 0; i < count; i++) {
    result.push(tagPool[(seed + i) % tagPool.length]);
  }
  return result;
}

function pickRelevance(fileName: string, index: number): number {
  // Returns a value between 72–98
  const base = 72 + ((fileName.length * 7 + index * 13) % 27);
  return Math.min(98, base);
}

function getFileTypeLabel(fileType: string): string {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('image')) return 'IMG';
  if (fileType.includes('word') || fileType.includes('document')) return 'DOC';
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'XLS';
  return 'FILE';
}

// ── BulkUploadZone ────────────────────────────────────────────────────────

function BulkUploadZone({ onFilesAdded }: { onFilesAdded: (files: File[]) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFilesAdded(files);
    },
    [onFilesAdded],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) onFilesAdded(files);
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [onFilesAdded],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all select-none',
        dragOver
          ? 'border-primary bg-primary-muted'
          : 'border-border-default bg-bg-surface hover:border-border-emphasis hover:bg-bg-surface-raised',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.eml"
        onChange={handleChange}
      />
      <motion.div
        animate={dragOver ? { scale: 1.08 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <Upload className={cn('mx-auto h-8 w-8 mb-2', dragOver ? 'text-primary-light' : 'text-text-tertiary')} />
      </motion.div>
      <p className="text-sm font-medium text-text-secondary">
        Drag & drop files here
      </p>
      <p className="mt-0.5 text-xs text-text-tertiary">
        or <span className="text-primary-light underline underline-offset-2">click to browse</span>
      </p>
      <p className="mt-1.5 text-[11px] text-text-tertiary">
        PDF, XLSX, CSV, EML, DOCX, images — up to 100 MB each
      </p>
      <p className="mt-1 text-[10px] text-text-tertiary opacity-60">
        Files are scanned by AI and auto-tagged after upload
      </p>
    </div>
  );
}

// ── UploadProcessingList ──────────────────────────────────────────────────

function UploadProcessingList({
  files,
  onDismiss,
}: {
  files: PendingFile[];
  onDismiss: (id: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="border-b border-border-default px-4 py-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-text-tertiary" />
        <h3 className="text-sm font-medium text-text-primary">Processing Queue</h3>
        <span className="ml-auto text-[10px] text-text-tertiary">{files.length} file{files.length > 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-border-muted">
        <AnimatePresence>
          {files.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3"
            >
              <div className="flex items-start gap-3">
                {/* File type badge */}
                <span className="flex-shrink-0 rounded-md bg-bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary font-mono mt-0.5">
                  {getFileTypeLabel(f.fileType)}
                </span>

                <div className="flex-1 min-w-0">
                  {/* File name + size */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-text-primary truncate">{f.name}</span>
                    <span className="text-[10px] text-text-tertiary flex-shrink-0">{formatFileSize(f.size)}</span>
                  </div>

                  {/* Stage indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    {f.stage === 'queued' && (
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Queued
                      </span>
                    )}
                    {f.stage === 'uploading' && (
                      <span className="text-[11px] text-primary-light flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                      </span>
                    )}
                    {f.stage === 'tagging' && (
                      <span className="text-[11px] text-accent-light flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> AI tagging…
                      </span>
                    )}
                    {f.stage === 'done' && (
                      <span className="text-[11px] text-verified-green flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Tagged
                      </span>
                    )}
                  </div>

                  {/* Tags + relevance score — shown after done */}
                  {f.stage === 'done' && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-wrap items-center gap-2"
                    >
                      {f.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', tag.color)}
                        >
                          {tag.label}
                        </span>
                      ))}
                      <span className="rounded-full bg-verified-green-muted px-2 py-0.5 text-[10px] font-semibold text-verified-green ml-auto flex-shrink-0">
                        {f.relevance}% relevant
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Dismiss button */}
                {f.stage === 'done' && (
                  <button
                    onClick={() => onDismiss(f.id)}
                    className="flex-shrink-0 p-1 text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const filtered = demoDocuments.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.case_number.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Simulate upload → tagging pipeline
  const handleFilesAdded = useCallback((files: File[]) => {
    const newEntries: PendingFile[] = files.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      size: file.size,
      fileType: file.type || 'application/octet-stream',
      stage: 'queued' as UploadStage,
      tags: [],
      relevance: 0,
    }));

    setPendingFiles((prev) => [...prev, ...newEntries]);

    // Stagger the pipeline for each file
    newEntries.forEach((entry, idx) => {
      const baseDelay = idx * 600;

      // Stage 1: uploading
      setTimeout(() => {
        setPendingFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, stage: 'uploading' } : f)),
        );
      }, baseDelay + 200);

      // Stage 2: tagging
      setTimeout(() => {
        setPendingFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, stage: 'tagging' } : f)),
        );
        // Stage transition: AI tagging in progress
      }, baseDelay + 1200);

      // Stage 3: done — assign tags + relevance
      setTimeout(() => {
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  stage: 'done',
                  tags: pickTags(entry.name, idx),
                  relevance: pickRelevance(entry.name, idx),
                }
              : f,
          ),
        );
      }, baseDelay + 2400);
    });
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <CSVImport />
      <PageHeader title="Documents" subtitle={`${demoDocuments.length} documents across all cases`}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
          <Upload className="h-4 w-4" />
          Upload Documents
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Bulk Upload Zone */}
        <BulkUploadZone onFilesAdded={handleFilesAdded} />

        {/* Processing Queue */}
        <UploadProcessingList files={pendingFiles} onDismiss={handleDismiss} />

        {/* AI OCR Document Intake */}
        <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
          <div className="border-b border-border-default px-4 py-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">AI OCR Document Intake</span>
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">GPT-4o Vision</span>
            <span className="ml-auto text-xs text-text-tertiary">Extracts text, dates, amounts &amp; key facts</span>
          </div>
          <div className="p-4">
            <OcrUpload
              caseId="general"
              onComplete={(result) => {
                // Future: refresh document list or show toast
              }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Document List */}
        <div className="rounded-xl border border-border-default bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-tertiary">
                <th className="px-4 py-3 font-medium">Document</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Case</th>
                <th className="px-4 py-3 font-medium">OCR</th>
                <th className="px-4 py-3 font-medium">Entities</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filtered.map((doc) => {
                const FileIcon = getFileIcon(doc.file_type);
                return (
                  <tr key={doc.id} className="transition-colors hover:bg-bg-surface-raised">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-4 w-4 shrink-0 text-text-tertiary" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-text-primary">{doc.title}</span>
                            {doc.flagged && <Flag className="h-3 w-3 text-fraud-red" />}
                          </div>
                          <div className="text-[10px] text-text-tertiary">{doc.file_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-secondary">
                        {getDocTypeLabel(doc.document_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[10px] text-text-tertiary">{doc.case_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      {doc.ocr_confidence != null ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-verified-green" />
                          <span className="financial-figure text-xs text-verified-green">{(doc.ocr_confidence * 100).toFixed(0)}%</span>
                        </div>
                      ) : doc.processed ? (
                        <span className="text-xs text-text-tertiary">N/A</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-warning" />
                          <span className="text-xs text-warning">Processing</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{doc.entity_count}</td>
                    <td className="px-4 py-3 text-text-tertiary">{formatFileSize(doc.file_size)}</td>
                    <td className="px-4 py-3 text-text-tertiary">{formatDate(doc.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
