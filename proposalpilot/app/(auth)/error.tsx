'use client';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Something went wrong</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Try Again</button>
    </div>
  );
}
