'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CSVImport } from '@/components/CSVImport';

export function ImportStoriesButton() {
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => setShowImport((v) => !v)}
        className="px-4 py-2 rounded-lg border border-[var(--border,#E2E8F0)] text-sm font-medium text-[var(--muted-foreground,#64748B)] hover:text-[var(--foreground,#0F172A)] hover:border-[var(--foreground,#0F172A)] transition-colors"
      >
        Import CSV
      </button>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--foreground,#0F172A)]">Import Stories</h2>
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
    </div>
  );
}
