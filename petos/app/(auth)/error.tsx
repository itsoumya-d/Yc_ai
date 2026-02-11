'use client';

import Link from 'next/link';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[var(--shadow-card)]">
      <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Authentication Error</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{error.message || 'Something went wrong.'}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try Again
        </button>
        <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)]">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
