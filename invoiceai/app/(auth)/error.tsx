'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
        Authentication Error
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Something went wrong during authentication. Please try again.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/login')}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}
