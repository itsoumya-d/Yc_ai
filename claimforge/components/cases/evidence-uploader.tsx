'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X, CheckCircle, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

interface AnalysisResult {
  summary: string;
  riskScore: number;
  entities: Array<{ name: string; type: string }>;
  flaggedAmounts: number[];
  fraudIndicators: Array<{ description: string; severity: 'critical' | 'high' | 'medium' | 'low' }>;
}

interface EvidenceFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'analyzing' | 'done' | 'error';
  analysis?: AnalysisResult;
  error?: string;
  documentType: string;
}

const DOCUMENT_TYPES = [
  'Medical Record', 'Invoice', 'Contract', 'Financial Statement',
  'Email', 'Letter', 'Government Form', 'Lab Report', 'Other',
];

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt';
const MAX_FILE_SIZE_MB = 20;

async function simulateAnalysis(file: File): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
  const score = Math.floor(Math.random() * 60) + 25;
  return {
    summary: `Document "${file.name}" processed. ${file.type.includes('pdf') ? 'PDF' : 'Document'} contains potentially relevant information for False Claims Act investigation.`,
    riskScore: score,
    entities: [
      { name: 'United States', type: 'Government' },
      { name: file.name.replace(/\.[^.]+$/, ''), type: 'Document' },
    ],
    flaggedAmounts: [Math.round(Math.random() * 50000 + 1000), Math.round(Math.random() * 200000 + 5000)],
    fraudIndicators: score > 60 ? [
      { description: 'Inconsistent billing codes detected', severity: 'high' },
      { description: 'Unusual date patterns in submissions', severity: 'medium' },
    ] : [
      { description: 'Minor discrepancies in amounts', severity: 'low' },
    ],
  };
}

export function EvidenceUploader({ caseId }: { caseId: string }) {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (newFiles: File[]) => {
    const entries: EvidenceFile[] = newFiles
      .filter((f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024)
      .map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        status: 'pending' as const,
        documentType: 'Other',
      }));

    if (entries.length === 0) return;

    setFiles((prev) => [...prev, ...entries]);

    // Process each file
    for (const entry of entries) {
      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'uploading' } : f));
      await new Promise((r) => setTimeout(r, 600));

      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'analyzing' } : f));

      try {
        const analysis = await simulateAnalysis(entry.file);
        setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'done', analysis } : f));
      } catch {
        setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'error', error: 'Analysis failed' } : f));
      }
    }
  }, [caseId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateDocType = useCallback((id: string, type: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, documentType: type } : f));
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
            : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/30',
        )}
      >
        <Upload className={cn('mb-3 h-10 w-10', isDragging ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]')} />
        <p className="text-sm font-medium">Drag & drop evidence files here</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          PDF, DOCX, PNG, JPG supported · Max {MAX_FILE_SIZE_MB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => processFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((ef) => (
            <div key={ef.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              {/* File header */}
              <div className="flex items-center gap-3 p-3">
                <FileText className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">{ef.file.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {(ef.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <StatusBadge status={ef.status} />
                <button
                  onClick={() => removeFile(ef.id)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar */}
              {(ef.status === 'uploading' || ef.status === 'analyzing') && (
                <div className="h-1 bg-[var(--muted)]">
                  <div className={cn(
                    'h-full transition-all duration-500',
                    ef.status === 'uploading' ? 'w-1/2 bg-blue-500' : 'w-full bg-[var(--primary)] animate-pulse',
                  )} />
                </div>
              )}

              {/* Document type selector (done state) */}
              {ef.status === 'done' && (
                <div className="border-t border-[var(--border)] px-3 py-2">
                  <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    Document type:
                    <div className="relative">
                      <select
                        value={ef.documentType}
                        onChange={(e) => updateDocType(ef.id, e.target.value)}
                        className="rounded border border-[var(--input)] bg-[var(--card)] px-2 py-0.5 text-xs pr-6 appearance-none cursor-pointer"
                      >
                        {DOCUMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50" />
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis results */}
              {ef.status === 'done' && ef.analysis && (
                <div className="border-t border-[var(--border)] p-3 space-y-3">
                  {/* Risk score */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted-foreground)]">Fraud Risk Score</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            ef.analysis.riskScore >= 70 ? 'bg-red-500' :
                            ef.analysis.riskScore >= 50 ? 'bg-orange-500' : 'bg-yellow-500',
                          )}
                          style={{ width: `${ef.analysis.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold tabular-nums">{ef.analysis.riskScore}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[var(--muted-foreground)]">{ef.analysis.summary}</p>

                  {/* Entities */}
                  {ef.analysis.entities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ef.analysis.entities.map((e, i) => (
                        <span key={i} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                          {e.name} · {e.type}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Flagged amounts */}
                  {ef.analysis.flaggedAmounts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ef.analysis.flaggedAmounts.map((a, i) => (
                        <span key={i} className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] text-yellow-400">
                          ${a.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Fraud indicators */}
                  {ef.analysis.fraudIndicators.length > 0 && (
                    <div className="space-y-1">
                      {ef.analysis.fraudIndicators.map((ind, i) => (
                        <div key={i} className={cn(
                          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs',
                          ind.severity === 'critical' || ind.severity === 'high'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-yellow-500/10 text-yellow-400',
                        )}>
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {ind.description}
                          <span className="ml-auto uppercase text-[10px] font-semibold opacity-60">{ind.severity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {ef.status === 'error' && (
                <div className="border-t border-[var(--border)] px-3 py-2">
                  <p className="text-xs text-red-400">{ef.error ?? 'Failed to process file.'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: EvidenceFile['status'] }) {
  switch (status) {
    case 'uploading':
      return <span className="flex items-center gap-1 text-xs text-blue-400"><Loader2 className="h-3 w-3 animate-spin" /> Uploading</span>;
    case 'analyzing':
      return <span className="flex items-center gap-1 text-xs text-[var(--primary)]"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing</span>;
    case 'done':
      return <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="h-3 w-3" /> Done</span>;
    case 'error':
      return <span className="flex items-center gap-1 text-xs text-red-400"><AlertTriangle className="h-3 w-3" /> Error</span>;
    default:
      return <span className="text-xs text-[var(--muted-foreground)]">Pending</span>;
  }
}
