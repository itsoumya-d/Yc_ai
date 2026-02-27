import { getUser } from '@/lib/actions/auth';
import { fetchCareerPaths } from '@/lib/actions/careers';
import { redirect } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import Link from 'next/link';
import {
  Bookmark,
  TrendingUp,
  DollarSign,
  MapPin,
  Globe,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const metadata = {
  title: 'Career Explorer',
};

export default async function CareersPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const result = await fetchCareerPaths();
  const careers = result.success ? result.data : [];

  // Empty state
  if (careers.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center py-16 space-y-6">
        <div className="rounded-full bg-sunrise-50 p-6 w-fit mx-auto">
          <TrendingUp className="h-12 w-12 text-sunrise-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          Complete your skills assessment to see career matches
        </h1>
        <p className="text-stone-500">
          Once we know your skills, we&apos;ll match you with growing careers that fit your experience.
        </p>
        <Link href="/dashboard/assessment">
          <Button variant="primary" size="lg">
            Go to Assessment <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          Your Career Matches
        </h1>
        <p className="text-stone-500 mt-1">
          {careers.length} career paths matched to your skills
        </p>
      </div>

      {/* Career Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {careers.map((career) => (
          <Card key={career.id} hover className="flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <Badge variant="teal">{career.industry}</Badge>
              <button
                className={`p-1 rounded hover:bg-stone-100 ${career.is_saved ? 'text-sunrise-500' : 'text-stone-400'}`}
                aria-label={career.is_saved ? 'Unsave career path' : 'Save career path'}
              >
                <Bookmark className="h-5 w-5" fill={career.is_saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-stone-900 font-heading">
              {career.title}
            </h3>

            {/* Match Score */}
            <div className="mt-3">
              <ProgressBar
                value={career.transferability_score}
                label="Match"
                colorScheme="auto"
                size="sm"
              />
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2 text-sm text-stone-600 flex-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-stone-400" />
                <span>
                  {career.salary_entry ? formatCurrency(career.salary_entry) : '—'} –{' '}
                  {career.salary_senior ? formatCurrency(career.salary_senior) : '—'}
                </span>
              </div>

              {career.growth_outlook_percent != null && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>{career.growth_outlook_percent}% growth</span>
                </div>
              )}

              {career.current_openings > 0 && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-stone-400" />
                  <span>{career.current_openings.toLocaleString()} openings</span>
                </div>
              )}

              {career.estimated_transition_weeks != null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <span>
                    Est. {career.estimated_transition_weeks < 8
                      ? `${career.estimated_transition_weeks} weeks`
                      : `${Math.round(career.estimated_transition_weeks / 4)} months`}
                  </span>
                </div>
              )}

              {career.remote_availability_percent > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-teal-500" />
                  <span>{career.remote_availability_percent}% remote</span>
                </div>
              )}
            </div>

            {/* Skills Gap */}
            {career.skills_gap_count > 0 && (
              <p className="mt-3 text-sm text-amber-600">
                {career.skills_gap_count} skill{career.skills_gap_count > 1 ? 's' : ''} needed
              </p>
            )}

            {/* Action */}
            <div className="mt-4 pt-4 border-t border-stone-100">
              <Button variant="primary" fullWidth>
                Explore This Path <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
