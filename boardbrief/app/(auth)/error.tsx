'use client';

import { Button } from '@/components/ui/button';

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center">
      <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Authentication Error</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try Again</Button>
    </div>
  );
}
