'use client';

import { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6">
        <Shield className="w-16 h-16 text-gold-500 mx-auto" />
        <div>
          <h1 className="font-heading text-4xl font-bold text-[var(--foreground)]">Something went wrong</h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground)]">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button onClick={reset} className="bg-navy-800 hover:bg-navy-700">
          Try Again
        </Button>
      </div>
    </div>
  );
}
