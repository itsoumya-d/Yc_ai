'use client';

import { useRef, useState, useTransition } from 'react';
import { importStoriesFromCSV } from '@/lib/actions/csv-import';

interface CSVRow { [key: string]: string; }

interface CSVImportProps {
  onSuccess?: () => void;
}

export function CSVImport({ onSuccess }: CSVImportProps) {
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
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
      const res = await importStoriesFromCSV(rawRows);
      setResult(res);
      setPreview([]);
      setHeaders([]);
      setFileName('');
      setRawRows([]);
      if (fileRef.current) fileRef.current.value = '';
      if (res.imported > 0) onSuccess?.();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border,#E2E8F0)] p-6 space-y-4 bg-[var(--card,#fff)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[var(--foreground,#0F172A)]">Import Stories from CSV</h3>
          <p className="text-sm text-[var(--muted-foreground,#64748B)] mt-0.5">
            Expected columns: <code className="text-xs bg-[var(--muted,#F1F5F9)] px-1 py-0.5 rounded">title, description, genre, status</code>
          </p>
          <p className="text-xs text-[var(--muted-foreground,#64748B)] mt-1">
            status: draft / in_progress / completed / published
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="shrink-0 px-4 py-2 rounded-lg bg-[var(--primary,#6366F1)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Choose CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>

      {fileName && (
        <p className="text-sm text-[var(--muted-foreground,#64748B)]">
          <span className="font-medium text-[var(--foreground,#0F172A)]">{fileName}</span>
          {rawRows.length > 0 && <span className="ml-2">— {rawRows.length} rows detected</span>}
        </p>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-[var(--border,#E2E8F0)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted,#F1F5F9)]">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-[var(--muted-foreground,#64748B)] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-[var(--border,#E2E8F0)]">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-[var(--foreground,#0F172A)] max-w-[160px] truncate">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rawRows.length > 5 && (
            <p className="text-xs text-[var(--muted-foreground,#64748B)]">Showing 5 of {rawRows.length} rows</p>
          )}
          <button
            onClick={handleImport}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[var(--primary,#6366F1)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? 'Importing...' : `Import ${rawRows.length} ${rawRows.length === 1 ? 'Story' : 'Stories'}`}
          </button>
        </div>
      )}

      {result && (
        <div className={`rounded-lg p-3 text-sm ${result.errors.length === 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          {result.errors.length === 0
            ? `Successfully imported ${result.imported} ${result.imported === 1 ? 'story' : 'stories'}`
            : `Imported ${result.imported} ${result.imported === 1 ? 'story' : 'stories'} — ${result.errors.length} row${result.errors.length !== 1 ? 's' : ''} skipped`}
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs opacity-80">
              {result.errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
              {result.errors.length > 3 && <li>...and {result.errors.length - 3} more</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
