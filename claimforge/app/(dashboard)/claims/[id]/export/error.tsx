'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="rounded-xl border border-fraud-red/20 bg-fraud-red-muted p-6 text-center max-w-md">
        <h2 className="text-sm font-medium text-fraud-red mb-2">Export Error</h2>
        <p className="text-xs text-fraud-red/80 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary hover:bg-bg-surface-raised transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
