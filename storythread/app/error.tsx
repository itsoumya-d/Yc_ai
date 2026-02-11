'use client';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] text-center">
      <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try Again
      </button>
    </div>
  );
}
