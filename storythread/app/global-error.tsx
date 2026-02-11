'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#fdf6e3' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1412' }}>Something went wrong</h1>
          <p style={{ marginTop: '0.5rem', color: '#78716c' }}>{error.message}</p>
          <button
            onClick={reset}
            style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', background: '#881337', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
