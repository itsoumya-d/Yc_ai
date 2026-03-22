'use client';

import { useRef, useState, useTransition } from 'react';
import { importEvidenceFromCSV } from '@/lib/actions/evidence';

interface CSVRow { [key: string]: string; }

export function CSVImport({ caseId }: { caseId?: string }) {
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rawRows, setRawRows] = useState<CSVRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string): CSVRow[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const hdrs = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      return Object.fromEntries(hdrs.map((h, i) => [h, values[i] ?? '']));
    });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setRawRows(rows);
      setHeaders(rows.length > 0 ? Object.keys(rows[0]) : []);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (rawRows.length === 0) return;
    startTransition(async () => {
      const res = await importEvidenceFromCSV(rawRows, caseId);
      setResult(res);
      setPreview([]);
      setHeaders([]);
      setFileName('');
      setRawRows([]);
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Bulk Import Evidence from CSV</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Expected columns: <code className="bg-bg-surface-raised px-1 py-0.5 rounded">document_name, document_type, source, date, relevance_score, notes</code>
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Auto-detects delimiters. Supports up to 500 rows per import.
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}
        >
          Choose CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,.tsv" className="hidden" onChange={handleFile} />
      </div>

      {fileName && (
        <p className="text-sm text-text-secondary">
          📄 <span className="font-medium text-text-primary">{fileName}</span>
          {rawRows.length > 0 && <span className="ml-2">— {rawRows.length} rows detected</span>}
        </p>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border-default">
            <table className="w-full text-xs">
              <thead className="bg-bg-surface-raised">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-border-default">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-text-primary max-w-[140px] truncate">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rawRows.length > 5 && (
            <p className="text-xs text-text-tertiary">Showing 5 of {rawRows.length} rows</p>
          )}
          <button
            onClick={handleImport}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ background: 'var(--primary)' }}
          >
            {isPending ? 'Importing…' : `Import ${rawRows.length} Evidence Item${rawRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {result && (
        <div className={`rounded-lg p-3 text-xs ${result.errors === 0 ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
          {result.errors === 0
            ? `✓ Successfully imported ${result.imported} evidence item${result.imported !== 1 ? 's' : ''}`
            : `✓ Imported ${result.imported} item${result.imported !== 1 ? 's' : ''} · ${result.errors} row${result.errors !== 1 ? 's' : ''} skipped (missing required fields)`}
        </div>
      )}
    </div>
  );
}
