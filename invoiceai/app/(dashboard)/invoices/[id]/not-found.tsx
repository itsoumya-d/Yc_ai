import Link from 'next/link';

export default function InvoiceNotFound() {
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
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
          Invoice not found
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          This invoice doesn&apos;t exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link
            href="/invoices"
            className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
