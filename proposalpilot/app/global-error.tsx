'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong</h1>
          <p style={{ marginTop: '0.5rem', color: '#666' }}>{error.message}</p>
          <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Try Again</button>
        </div>
      </body>
    </html>
  );
}
