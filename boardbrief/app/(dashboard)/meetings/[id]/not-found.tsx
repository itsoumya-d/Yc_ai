import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MeetingNotFound() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-6">
        <Calendar className="w-12 h-12 text-gold-500 mx-auto" />
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--foreground)]">Meeting not found</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            The meeting you are looking for does not exist or has been removed.
          </p>
        </div>
        <Link href="/meetings">
          <Button className="bg-navy-800 hover:bg-navy-700">Back to Meetings</Button>
        </Link>
      </div>
    </div>
  );
}
