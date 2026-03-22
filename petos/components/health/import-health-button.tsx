'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CSVImport } from '@/components/CSVImport';

export function ImportHealthButton() {
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setShowImport((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border,#E2E8F0)] text-sm font-medium text-[var(--muted-foreground,#64748B)] hover:text-[var(--foreground,#0F172A)] hover:border-[var(--foreground,#0F172A)] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        Import CSV
      </button>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--foreground,#0F172A)]">Import Health Records</h2>
              <button
                onClick={() => setShowImport(false)}
                className="text-[var(--muted-foreground,#64748B)] hover:text-[var(--foreground,#0F172A)] text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <CSVImport onSuccess={() => {
              setShowImport(false);
              router.refresh();
            }} />
          </div>
        </div>
      )}
    </>
  );
}
