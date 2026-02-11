import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6">
        <Shield className="w-16 h-16 text-gold-500 mx-auto" />
        <div>
          <h1 className="font-heading text-4xl font-bold text-[var(--foreground)]">404</h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground)]">
            Page not found. The page you are looking for does not exist.
          </p>
        </div>
        <Link href="/">
          <Button className="bg-navy-800 hover:bg-navy-700">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
