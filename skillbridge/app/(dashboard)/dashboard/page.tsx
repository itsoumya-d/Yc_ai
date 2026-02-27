import { fetchDashboardStats } from '@/lib/actions/dashboard';
import { getUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Puzzle,
  Map,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const result = await fetchDashboardStats();
  const stats = result.success ? result.data : null;
  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-stone-500">
          {stats?.assessmentStatus === 'completed'
            ? 'Keep up the great progress on your career transition.'
            : 'Start your skills assessment to discover your career potential.'}
        </p>
      </div>

      {/* Assessment CTA (if not completed) */}
      {stats?.assessmentStatus !== 'completed' && (
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cream">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-teal-600 p-3 text-white">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900 font-heading">
                  {stats?.assessmentStatus === 'in_progress'
                    ? 'Continue Your Assessment'
                    : 'Discover Your Transferable Skills'}
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Upload your resume or answer a few questions. Takes about 10 minutes.
                </p>
              </div>
            </div>
            <Link href="/dashboard/assessment">
              <Button variant="primary" size="lg">
                <Sparkles className="h-4 w-4" />
                {stats?.assessmentStatus === 'in_progress' ? 'Continue' : 'Start Assessment'}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
              <Puzzle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 font-heading">
                {stats?.totalSkills ?? 0}
              </p>
              <p className="text-xs text-stone-500">Skills Identified</p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sunrise-50 p-2.5 text-sunrise-600">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 font-heading">
                {stats?.careerPathsExplored ?? 0}
              </p>
              <p className="text-xs text-stone-500">Career Paths</p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 font-heading">
                {stats?.coursesCompleted ?? 0}
              </p>
              <p className="text-xs text-stone-500">Courses Done</p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 font-heading">
                {stats?.jobMatchesFound ?? 0}
              </p>
              <p className="text-xs text-stone-500">Job Matches</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Career Path + Learning Progress */}
      {stats?.selectedCareerPath && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <CardTitle>Your Career Path</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="teal">{stats.selectedCareerPath}</Badge>
              </div>
            </div>
            <Link href="/dashboard/learning">
              <Button variant="outline" size="sm">
                View Learning Plan <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ProgressBar
            value={stats.learningProgress}
            label="Overall Progress"
            colorScheme="auto"
          />
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 font-heading mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/skills">
            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-3">
                <Puzzle className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-medium text-stone-900">View Skills Profile</p>
                  <p className="text-sm text-stone-500">See your identified transferable skills</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/careers">
            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-sunrise-600" />
                <div>
                  <p className="font-medium text-stone-900">Explore Careers</p>
                  <p className="text-sm text-stone-500">Browse career paths matched to you</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/jobs">
            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-stone-900">Browse Jobs</p>
                  <p className="text-sm text-stone-500">Find jobs that match your skills</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
