import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
