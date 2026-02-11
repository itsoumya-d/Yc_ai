import Link from 'next/link';
import { Feather } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] text-center">
      <Feather className="h-16 w-16 text-[var(--muted-foreground)]" />
      <h1 className="mt-6 font-heading text-4xl font-bold text-[var(--foreground)]">Page not found</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Go Home
      </Link>
    </div>
  );
}
