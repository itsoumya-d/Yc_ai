import { getUser } from '@/lib/actions/auth';
import { fetchActiveLearningPlan, fetchCourses } from '@/lib/actions/learning';
import { redirect } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import Link from 'next/link';
import {
  GraduationCap,
  ExternalLink,
  Play,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const metadata = {
  title: 'Learning Dashboard',
};

export default async function LearningPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const [planResult, coursesResult] = await Promise.all([
    fetchActiveLearningPlan(),
    fetchCourses(),
  ]);

  const plan = planResult.success ? planResult.data : null;
  const courses = coursesResult.success ? coursesResult.data : [];

  // Empty state - no plan
  if (!plan) {
    return (
      <div className="mx-auto max-w-lg text-center py-16 space-y-6">
        <div className="rounded-full bg-green-50 p-6 w-fit mx-auto">
          <GraduationCap className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          Choose a career path to get your personalized plan
        </h1>
        <p className="text-stone-500">
          Select a career from your matches and we&apos;ll build a step-by-step learning plan just for you.
        </p>
        <Link href="/dashboard/careers">
          <Button variant="primary" size="lg">
            Explore Careers <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header + Progress */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          Your Learning Plan
        </h1>
        <p className="text-stone-500 mt-1">{plan.title}</p>
      </div>

      {/* Progress Summary */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <ProgressBar
              value={plan.overall_progress}
              label="Overall Progress"
              size="lg"
              colorScheme="auto"
            />
            <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
              <span>{plan.completed_courses} of {plan.total_courses} courses complete</span>
              {plan.total_estimated_hours > 0 && (
                <span>{plan.total_estimated_hours}h estimated</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Course Catalog */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 font-heading mb-4">
          Available Courses
        </h2>
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} hover className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{course.provider}</Badge>
                  <Badge variant={course.is_free ? 'green' : 'default'}>
                    {course.is_free ? 'Free' : formatCurrency(course.cost)}
                  </Badge>
                </div>
                <h3 className="font-medium text-stone-900">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                  {course.duration_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration_hours}h
                    </span>
                  )}
                  <Badge variant={
                    course.difficulty_level === 'beginner' ? 'green'
                    : course.difficulty_level === 'intermediate' ? 'amber'
                    : 'red'
                  }>
                    {course.difficulty_level}
                  </Badge>
                  {course.skills_covered.length > 0 && (
                    <span>{course.skills_covered.slice(0, 3).join(', ')}</span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4" />
                Start
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
