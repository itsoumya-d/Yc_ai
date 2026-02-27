import { getUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Heart,
  Bookmark,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Jobs For You',
};

export default async function JobsPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  // Empty state for now - jobs will be populated via matching
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          Jobs For You
        </h1>
        <p className="text-stone-500 mt-1">
          Job listings matched to your transferable skills
        </p>
      </div>

      {/* Empty state */}
      <div className="mx-auto max-w-lg text-center py-16 space-y-6">
        <div className="rounded-full bg-blue-50 p-6 w-fit mx-auto">
          <Briefcase className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-stone-900 font-heading">
          Jobs are on their way!
        </h2>
        <p className="text-stone-500">
          We&apos;re finding matches for your skills. Complete your assessment and explore career paths to see personalized job matches.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard/skills">
            <Button variant="primary">
              Update Skills <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/careers">
            <Button variant="outline">
              Explore Careers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
