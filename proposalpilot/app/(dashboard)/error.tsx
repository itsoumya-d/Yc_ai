'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Something went wrong</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">{error.message}</p>
        <div className="mt-6">
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
