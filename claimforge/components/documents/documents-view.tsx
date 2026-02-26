'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { uploadDocument, deleteDocument } from '@/lib/actions/documents';
import { analyzeDocument } from '@/lib/actions/analysis';
import {
  Upload,
  FileText,
  FileImage,
  File,
  Search,
  CheckCircle2,
  Clock,
  Flag,
  ScanLine,
  Loader2,
  Trash2,
  Zap,
} from 'lucide-react';
import type { Document, DocumentType, Case } from '@/types/database';

interface DocumentsViewProps {
  documents: Document[];
  cases: Array<{ id: string; title: string; case_number: string }>;
}

function getFileIcon(fileType: string) {
  if (fileType?.includes('pdf')) return FileText;
  if (fileType?.includes('image')) return FileImage;
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
  return labels[type] || type;
}

export function DocumentsView({ documents, cases }: DocumentsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [docType, setDocType] = useState<DocumentType>('other');

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0 || !selectedCaseId) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('document_type', docType);
      formData.set('title', file.name.replace(/\.[^.]+$/, ''));

      await uploadDocument(selectedCaseId, formData);
    }

    setUploading(false);
    setShowUpload(false);
    router.refresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (selectedCaseId) {
      handleFileUpload(e.dataTransfer.files);
    } else {
      setShowUpload(true);
    }
  }

  function handleAnalyze(docId: string) {
    setAnalyzingId(docId);
    startTransition(async () => {
      await analyzeDocument(docId);
      setAnalyzingId(null);
      router.refresh();
    });
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => setShowUpload(true)}
        className={cn(
          'rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer',
          dragOver
            ? 'border-primary bg-primary-muted'
            : 'border-border-default bg-bg-surface hover:border-border-emphasis',
        )}
      >
        {uploading ? (
          <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
        ) : (
          <Upload className={cn('mx-auto h-8 w-8', dragOver ? 'text-primary-light' : 'text-text-tertiary')} />
        )}
        <p className="mt-2 text-sm text-text-secondary">
          {uploading ? 'Uploading...' : 'Drag & drop files here, or click to upload'}
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          PDF, XLSX, CSV, EML, DOCX, images up to 100MB
        </p>
      </div>

      {/* Upload form modal */}
      {showUpload && (
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Case</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary"
              >
                <option value="invoice">Invoice</option>
                <option value="contract">Contract</option>
                <option value="payment_record">Payment Record</option>
                <option value="correspondence">Correspondence</option>
                <option value="audit_report">Audit Report</option>
                <option value="regulatory_filing">Regulatory Filing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedCaseId || uploading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-raised"
              >
                Cancel
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.csv,.eml,.docx,.png,.jpg,.jpeg,.tiff"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      )}

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
              <th className="px-4 py-3 font-medium">OCR</th>
              <th className="px-4 py-3 font-medium">Entities</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Uploaded</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-tertiary">
                  {documents.length === 0 ? 'No documents uploaded yet.' : 'No matching documents.'}
                </td>
              </tr>
            ) : (
              filtered.map((doc) => {
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
                          <span className="text-xs text-warning">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{doc.entity_count || 0}</td>
                    <td className="px-4 py-3 text-text-tertiary">{formatFileSize(doc.file_size)}</td>
                    <td className="px-4 py-3 text-text-tertiary">{formatDate(doc.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!doc.processed && (
                          <button
                            onClick={() => handleAnalyze(doc.id)}
                            disabled={analyzingId === doc.id}
                            className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary-muted"
                            title="Analyze with AI"
                          >
                            {analyzingId === doc.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Zap className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this document?')) {
                              startTransition(async () => {
                                await deleteDocument(doc.id, doc.case_id);
                                router.refresh();
                              });
                            }
                          }}
                          className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-fraud-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
