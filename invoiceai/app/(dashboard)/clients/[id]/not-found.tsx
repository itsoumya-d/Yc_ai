import Link from 'next/link';

export default function ClientNotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
          <svg
            className="h-8 w-8 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
          Client not found
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          This client doesn&apos;t exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link
            href="/clients"
            className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    </div>
  );
}
