'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A853"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto 24px' }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#F8FAFC',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: '#94A3B8',
                marginBottom: '24px',
              }}
            >
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#1E293B',
                color: '#F8FAFC',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
