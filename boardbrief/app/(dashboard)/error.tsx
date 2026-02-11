'use client';

import { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
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
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-6">
        <Shield className="w-12 h-12 text-gold-500 mx-auto" />
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">Something went wrong</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            An error occurred while loading this page.
          </p>
        </div>
        <Button onClick={reset} className="bg-navy-800 hover:bg-navy-700">
          Try Again
        </Button>
      </div>
    </div>
  );
}
