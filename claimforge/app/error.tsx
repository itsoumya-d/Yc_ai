'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            Try Again
          </button>
          <Link href="/" className="px-6 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
