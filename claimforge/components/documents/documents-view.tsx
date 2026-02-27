'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import {
  Upload,
  FileText,
  FileImage,
  File,
  Search,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';
import type { Document, DocumentType } from '@/types/database';

interface DocumentsViewProps {
  documents: Document[];
  caseMap: Record<string, { case_number: string; title: string }>;
}

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

export function DocumentsView({ documents, caseMap }: DocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Documents" subtitle={`${documents.length} documents across all cases`}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
          <Upload className="h-4 w-4" />
          Upload Documents
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={() => setDragOver(false)}
          className={cn(
            'rounded-xl border-2 border-dashed p-8 text-center transition-all',
            dragOver
              ? 'border-primary bg-primary-muted'
              : 'border-border-default bg-bg-surface hover:border-border-emphasis',
          )}
        >
          <Upload className={cn('mx-auto h-8 w-8', dragOver ? 'text-primary-light' : 'text-text-tertiary')} />
          <p className="mt-2 text-sm text-text-secondary">
            Drag & drop files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            PDF, XLSX, CSV, EML, DOCX, images up to 100MB
          </p>
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
        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
            <div className="text-center">
              <FileText className="mx-auto h-8 w-8 text-text-tertiary" />
              <p className="mt-2 text-sm text-text-secondary">
                {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
              </p>
            </div>
          </div>
        ) : (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filtered.map((doc) => {
                  const FileIcon = getFileIcon(doc.file_type);
                  const caseInfo = caseMap[doc.case_id];
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
                        <div className="font-mono text-[10px] text-text-tertiary">
                          {caseInfo?.case_number || '—'}
                        </div>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
