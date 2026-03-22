'use client';

import { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { importClientsFromCSV } from '@/lib/actions/clients';

interface CSVRow {
  [key: string]: string;
}

export function CSVImport({ type = 'clients' }: { type?: 'clients' | 'invoices' }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);
  const [rawCSV, setRawCSV] = useState('');

  const parseCSV = (text: string): { headers: string[]; rows: CSVRow[] } => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };
    const headers = lines[0]!.split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
    return { headers, rows };
  };

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    setRawCSV(text);
    const { headers: h, rows } = parseCSV(text);
    setHeaders(h);
    setPreview(rows);
    setResult(null);
  }, []);

  const handleImport = async () => {
    setImporting(true);
    const { imported, errors } = await importClientsFromCSV(rawCSV);
    setResult({ imported, errors });
    setImporting(false);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${dragging ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
      >
        <input type="file" accept=".csv" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
        <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
        <p className="font-medium text-[var(--foreground)]">Drop CSV file here</p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Headers: name, email, company, phone</p>
      </div>

      {preview.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">
            <span>Preview (first 5 rows)</span>
            <button onClick={() => { setPreview([]); setRawCSV(''); }}><X className="h-3 w-3" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--border)]">{headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">{h}</th>)}</tr></thead>
              <tbody>{preview.map((row, i) => <tr key={i} className="border-b border-[var(--border)] last:border-0">{headers.map(h => <td key={h} className="px-3 py-2 text-[var(--foreground)]">{row[h]}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-[var(--muted)]">
            <button onClick={handleImport} disabled={importing} className="rounded-lg bg-[var(--primary,#6366F1)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              {importing ? 'Importing...' : `Import ${type}`}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`flex items-center gap-3 rounded-xl p-4 ${result.errors === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          {result.errors === 0 ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />}
          <div className="text-sm">
            <p className="font-semibold">{result.imported} records imported successfully</p>
            {result.errors > 0 && <p className="text-amber-700">{result.errors} rows had errors and were skipped</p>}
          </div>
        </div>
      )}
    </div>
  );
}
