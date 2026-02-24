'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
