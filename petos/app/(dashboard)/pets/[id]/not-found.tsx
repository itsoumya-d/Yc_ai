import Link from 'next/link';

export default function PetNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl">🐾</div>
      <h2 className="mt-4 font-heading text-xl font-semibold text-[var(--foreground)]">Pet Not Found</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        This pet doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/pets"
        className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to My Pets
      </Link>
    </div>
  );
}
