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
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  Flag,
  ScanLine,
} from 'lucide-react';
import type { DocumentType } from '@/types/database';

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

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const filtered = demoDocuments.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.case_number.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Documents" subtitle={`${demoDocuments.length} documents across all cases`}>
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
