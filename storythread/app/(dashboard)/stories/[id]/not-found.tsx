import Link from 'next/link';
import { Feather } from 'lucide-react';

export default function StoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Feather className="h-12 w-12 text-[var(--muted-foreground)]" />
      <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Story not found</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">This story doesn&apos;t exist or you don&apos;t have access.</p>
      <Link
        href="/stories"
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to Stories
      </Link>
    </div>
  );
}
