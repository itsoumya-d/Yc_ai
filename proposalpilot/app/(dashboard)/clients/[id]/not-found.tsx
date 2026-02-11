import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function ClientNotFound() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <Users className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Client not found</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">This client may have been deleted or you don&apos;t have access.</p>
        <div className="mt-6">
          <Link href="/clients"><Button>Back to Clients</Button></Link>
        </div>
      </div>
    </div>
  );
}
