import { getUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Resume Builder',
};

export default async function ResumePage() {
  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          Resume Builder
        </h1>
        <p className="text-stone-500 mt-1">
          AI-powered resume rewriting for your target career
        </p>
      </div>

      {/* Empty state */}
      <div className="mx-auto max-w-lg text-center py-16 space-y-6">
        <div className="rounded-full bg-teal-50 p-6 w-fit mx-auto">
          <FileText className="h-12 w-12 text-teal-600" />
        </div>
        <h2 className="text-xl font-semibold text-stone-900 font-heading">
          Select a career path to generate your tailored resume
        </h2>
        <p className="text-stone-500">
          Choose a target career and we&apos;ll rewrite your experience using industry-specific language.
        </p>
        <Link href="/dashboard/careers">
          <Button variant="primary" size="lg">
            Explore Careers <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
