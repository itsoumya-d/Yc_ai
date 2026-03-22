'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function CarrierClaimError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fraud-red-muted">
        <AlertCircle className="h-6 w-6 text-fraud-red" />
      </div>
      <h2 className="text-sm font-medium text-text-primary">Failed to load carrier communication</h2>
      <p className="text-xs text-text-secondary text-center max-w-sm">{error.message}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          Try Again
        </button>
        <Link
          href="/claims"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Claims
        </Link>
      </div>
    </div>
  );
}
