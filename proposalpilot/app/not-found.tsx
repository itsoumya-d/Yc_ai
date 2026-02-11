import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <h1 className="font-heading text-6xl font-bold text-[var(--foreground)]">404</h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">Page not found</p>
        <div className="mt-6">
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
