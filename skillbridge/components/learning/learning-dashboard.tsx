'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Target,
  Search,
  Plus,
  Star,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { createLearningPlan, updateCourseProgress } from '@/lib/actions/learning';
import { formatCurrency } from '@/lib/utils';
import type { LearningPlan, Course } from '@/types/database';

interface LearningDashboardProps {
  plans: LearningPlan[];
  courses: Course[];
}

function getStatusBadgeVariant(status: LearningPlan['status']) {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'paused':
      return 'warning' as const;
    case 'completed':
      return 'default' as const;
  }
}

function getDifficultyBadgeVariant(difficulty: Course['difficulty']) {
  switch (difficulty) {
    case 'beginner':
      return 'success' as const;
    case 'intermediate':
      return 'sunrise' as const;
    case 'advanced':
      return 'error' as const;
  }
}

function formatDifficulty(difficulty: Course['difficulty']): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function formatStatus(status: LearningPlan['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && (
        <Star className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-[var(--muted-foreground)]/30" />
      ))}
      <span className="ml-1 text-xs text-[var(--muted-foreground)]">{rating.toFixed(1)}</span>
    </div>
  );
}

export function LearningDashboard({ plans, courses }: LearningDashboardProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planTargetDate, setPlanTargetDate] = useState('');

  // Course browsing filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  // Starting course loading state
  const [startingCourseId, setStartingCourseId] = useState<string | null>(null);

  // Compute stats
  const activePlans = plans.filter((p) => p.status === 'active');
  const completedCourseCount = 0; // Would be computed from course progress data
  const inProgressCourseCount = 0;
  const totalHours = courses.reduce((sum, c) => sum + (c.duration_hours ?? 0), 0);

  // Get unique providers
  const providers = useMemo(() => {
    const set = new Set(courses.map((c) => c.provider));
    return Array.from(set).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          course.title.toLowerCase().includes(query) ||
          (course.description ?? '').toLowerCase().includes(query) ||
          course.provider.toLowerCase().includes(query) ||
          course.skills_covered.some((s) => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (difficultyFilter && course.difficulty !== difficultyFilter) {
        return false;
      }

      if (providerFilter && course.provider !== providerFilter) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, difficultyFilter, providerFilter]);

  const hasActiveFilters = searchQuery || difficultyFilter || providerFilter;

  async function handleCreatePlan() {
    if (!planTitle.trim()) {
      addToast('Please enter a plan title', 'error');
      return;
    }

    setCreating(true);
    try {
      await createLearningPlan({
        title: planTitle.trim(),
        description: planDescription.trim() || undefined,
        target_date: planTargetDate || undefined,
      });
      addToast('Learning plan created successfully', 'success');
      setDialogOpen(false);
      setPlanTitle('');
      setPlanDescription('');
      setPlanTargetDate('');
      router.refresh();
    } catch {
      addToast('Failed to create learning plan', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleStartCourse(courseId: string) {
    setStartingCourseId(courseId);
    try {
      await updateCourseProgress(courseId, null, {
        status: 'in_progress',
        progress: 0,
      });
      addToast('Course started! Good luck on your learning journey.', 'success');
      router.refresh();
    } catch {
      addToast('Failed to start course', 'error');
    } finally {
      setStartingCourseId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Learning Dashboard">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Learning Plan</DialogTitle>
              <DialogDescription>
                Set up a new learning plan to track your progress toward your goals.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                label="Title"
                placeholder="e.g., Full-Stack Development Path"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
              />
              <div className="space-y-1.5">
                <label
                  htmlFor="plan-description"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Description
                </label>
                <textarea
                  id="plan-description"
                  placeholder="Describe your learning goals..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Input
                label="Target Date"
                type="date"
                value={planTargetDate}
                onChange={(e) => setPlanTargetDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePlan} isLoading={creating}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Overview Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Plans"
          value={activePlans.length}
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="Courses In Progress"
          value={inProgressCourseCount}
          icon={<PlayCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Completed Courses"
          value={completedCourseCount}
          icon={<GraduationCap className="h-6 w-6" />}
        />
        <StatCard
          title="Total Hours"
          value={totalHours}
          subtitle="across all courses"
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      {/* Active Learning Plans */}
      <section className="mb-10">
        <h2 className="mb-4 font-heading text-lg font-semibold text-[var(--foreground)]">
          Active Learning Plans
        </h2>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={<BookOpen className="h-8 w-8" />}
                title="No learning plans yet"
                description="Create your first learning plan to start tracking your progress and reach your career goals."
                action={{
                  label: 'Create Plan',
                  onClick: () => setDialogOpen(true),
                }}
              />
            </CardContent>
          </Card>
        )}
      </section>

      {/* Browse Courses */}
      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-[var(--foreground)]">
          Browse Courses
        </h2>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-card sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
          >
            <option value="">All Providers</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('');
                setProviderFilter('');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Course Results */}
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
        </p>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onStart={handleStartCourse}
                isStarting={startingCourseId === course.id}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="No courses found"
                description={
                  hasActiveFilters
                    ? 'Try adjusting your filters to see more results.'
                    : 'No courses are available at the moment. Check back later.'
                }
                action={
                  hasActiveFilters
                    ? {
                        label: 'Clear Filters',
                        onClick: () => {
                          setSearchQuery('');
                          setDifficultyFilter('');
                          setProviderFilter('');
                        },
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

/* ---- Sub-components ---- */

function PlanCard({ plan }: { plan: LearningPlan }) {
  const targetDate = plan.target_date
    ? new Date(plan.target_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card className="transition-shadow duration-normal hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{plan.title}</CardTitle>
          <Badge variant={getStatusBadgeVariant(plan.status)} size="sm">
            {formatStatus(plan.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {plan.description && (
          <p className="mb-3 text-sm text-[var(--muted-foreground)] line-clamp-2">
            {plan.description}
          </p>
        )}

        {plan.career_path && (
          <div className="mb-3">
            <Badge variant="outline" size="sm">
              {plan.career_path.title}
            </Badge>
          </div>
        )}

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Progress</span>
            <span className="font-medium text-[var(--card-foreground)]">
              {Math.round(plan.progress)}%
            </span>
          </div>
          <ProgressBar
            value={plan.progress}
            size="sm"
            color={plan.progress >= 100 ? 'success' : 'brand'}
          />
        </div>

        {targetDate && (
          <p className="mb-4 text-xs text-[var(--muted-foreground)]">
            <Clock className="mr-1 inline-block h-3.5 w-3.5" />
            Target: {targetDate}
          </p>
        )}

        <Link
          href={`/learning/${plan.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View Plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function CourseCard({
  course,
  onStart,
  isStarting,
}: {
  course: Course;
  onStart: (id: string) => void;
  isStarting: boolean;
}) {
  const MAX_SKILLS_SHOWN = 4;
  const visibleSkills = course.skills_covered.slice(0, MAX_SKILLS_SHOWN);
  const remainingCount = course.skills_covered.length - MAX_SKILLS_SHOWN;

  return (
    <Card className="flex flex-col transition-shadow duration-normal hover:shadow-card-hover">
      <CardContent className="flex flex-1 flex-col p-6">
        {/* Title & Provider */}
        <h3 className="font-heading text-lg font-semibold text-[var(--card-foreground)] mb-1">
          {course.title}
        </h3>
        <p className="mb-3 text-sm text-[var(--muted-foreground)]">{course.provider}</p>

        {/* Meta row */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={getDifficultyBadgeVariant(course.difficulty)} size="sm">
            {formatDifficulty(course.difficulty)}
          </Badge>
          {course.duration_hours !== null && (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Clock className="h-3.5 w-3.5" />
              {course.duration_hours}h
            </span>
          )}
        </div>

        {/* Rating */}
        {course.rating !== null && (
          <div className="mb-3">
            <RatingStars rating={course.rating} />
          </div>
        )}

        {/* Price */}
        <p className="mb-3 text-sm font-medium text-[var(--card-foreground)]">
          {course.price === 0 ? (
            <span className="text-green-600">Free</span>
          ) : (
            formatCurrency(course.price)
          )}
        </p>

        {/* Skills */}
        {course.skills_covered.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
              >
                {skill}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        {/* Start button at bottom */}
        <div className="mt-auto">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onStart(course.id)}
            isLoading={isStarting}
          >
            <PlayCircle className="h-4 w-4" />
            Start Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
