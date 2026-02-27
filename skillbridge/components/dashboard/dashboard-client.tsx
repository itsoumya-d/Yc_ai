'use client';

import Link from 'next/link';
import {
  Zap,
  Target,
  GraduationCap,
  Briefcase,
  BookOpen,
  Flame,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { DashboardStats, CareerPath } from '@/types/database';

interface DashboardClientProps {
  stats: DashboardStats;
  activity: Array<{ type: string; title: string; date: string }>;
  topCareers: (CareerPath & { matchScore: number })[];
  skillsCount: number;
  hasCompletedAssessment: boolean;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'skill_added':
      return <Zap className="h-4 w-4 text-brand-500" />;
    case 'course_completed':
      return <Award className="h-4 w-4 text-green-500" />;
    case 'course_started':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'job_saved':
      return <Briefcase className="h-4 w-4 text-sunrise-500" />;
    default:
      return <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />;
  }
}

function getRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getDemandBadgeVariant(level: CareerPath['demand_level']) {
  switch (level) {
    case 'very_high':
      return 'success' as const;
    case 'high':
      return 'default' as const;
    case 'medium':
      return 'warning' as const;
    case 'low':
      return 'secondary' as const;
  }
}

export function DashboardClient({
  stats,
  activity,
  topCareers,
  skillsCount,
  hasCompletedAssessment,
}: DashboardClientProps) {
  return (
    <div>
      <PageHeader
        title="Welcome back! \uD83D\uDC4B"
        description="Here's your career transition progress"
      />

      {/* Assessment CTA */}
      {!hasCompletedAssessment && (
        <div className="mb-8 rounded-xl bg-brand-600 p-6 text-white shadow-card sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Start Your Career Assessment
                </h2>
                <p className="mt-1 text-sm text-brand-100">
                  Discover your transferable skills and find your ideal career
                  path. Our AI-powered assessment analyzes your experience and
                  maps it to high-demand roles.
                </p>
              </div>
            </div>
            <Link href="/assessment">
              <Button
                variant="secondary"
                size="lg"
                className="shrink-0 border-white/20 bg-white text-brand-700 hover:bg-brand-50"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stat Cards - 2x3 grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        <StatCard
          title="Skills Identified"
          value={stats.skillsCount}
          icon={<Zap className="h-5 w-5" />}
          subtitle={
            stats.skillsCount === 0
              ? 'Complete an assessment to start'
              : `${stats.skillsCount} skill${stats.skillsCount !== 1 ? 's' : ''} mapped`
          }
        />

        <StatCard
          title="Match Score"
          value={formatPercent(stats.matchScore)}
          icon={<Target className="h-5 w-5" />}
          className={
            stats.matchScore > 70
              ? '[&_.flex.h-12]:bg-sunrise-50 [&_.flex.h-12]:text-sunrise-600'
              : ''
          }
          subtitle={
            stats.matchScore === 0
              ? 'No matches yet'
              : stats.matchScore > 70
                ? 'Strong match!'
                : 'Keep building skills'
          }
        />

        <StatCard
          title="Learning Progress"
          value={formatPercent(stats.learningProgress)}
          icon={<GraduationCap className="h-5 w-5" />}
          subtitle={
            stats.learningProgress === 0
              ? 'Start a learning plan'
              : undefined
          }
        />

        <StatCard
          title="Job Matches"
          value={stats.jobMatches}
          icon={<Briefcase className="h-5 w-5" />}
          subtitle={
            stats.jobMatches === 0
              ? 'Matches appear after assessment'
              : `${stats.jobMatches} role${stats.jobMatches !== 1 ? 's' : ''} found`
          }
        />

        <StatCard
          title="Courses Completed"
          value={stats.coursesCompleted}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle={
            stats.coursesCompleted === 0
              ? 'Browse courses to begin'
              : `${stats.coursesCompleted} course${stats.coursesCompleted !== 1 ? 's' : ''} done`
          }
        />

        <StatCard
          title="Day Streak"
          value={stats.streakDays}
          icon={<Flame className="h-5 w-5" />}
          className={
            stats.streakDays >= 7
              ? '[&_.flex.h-12]:bg-amber-50 [&_.flex.h-12]:text-milestone'
              : ''
          }
          subtitle={
            stats.streakDays === 0
              ? 'Log in daily to build a streak'
              : `${stats.streakDays} day${stats.streakDays !== 1 ? 's' : ''} in a row!`
          }
        />
      </div>

      {/* Learning Progress Bar (shown only if there's progress) */}
      {stats.learningProgress > 0 && (
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Overall Learning Progress
                </p>
                <span className="text-sm font-semibold text-brand-600">
                  {formatPercent(stats.learningProgress)}
                </span>
              </div>
              <ProgressBar
                value={stats.learningProgress}
                size="md"
                color="brand"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended Careers */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Recommended Careers
          </h2>
          <Link
            href="/careers"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all
          </Link>
        </div>

        {topCareers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topCareers.map((career) => (
              <Link
                key={career.id}
                href={`/careers/${career.slug}`}
                className="group"
              >
                <Card className="h-full transition-shadow duration-normal hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-heading text-base font-semibold text-[var(--card-foreground)] group-hover:text-brand-600 transition-colors">
                        {career.title}
                      </h3>
                      <Badge
                        variant={
                          career.matchScore >= 70 ? 'success' : career.matchScore >= 40 ? 'warning' : 'secondary'
                        }
                        size="sm"
                      >
                        {career.matchScore}% match
                      </Badge>
                    </div>

                    <p className="text-sm text-[var(--muted-foreground)] mb-4">
                      {career.industry}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">
                          Salary Range
                        </span>
                        <span className="font-medium text-[var(--card-foreground)]">
                          {formatCurrency(career.avg_salary_min)} -{' '}
                          {formatCurrency(career.avg_salary_max)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">
                          Growth Rate
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-green-600">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {career.growth_rate}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">
                          Demand
                        </span>
                        <Badge
                          variant={getDemandBadgeVariant(career.demand_level)}
                          size="sm"
                        >
                          {career.demand_level.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Match progress bar */}
                    <div className="mt-4">
                      <ProgressBar
                        value={career.matchScore}
                        size="sm"
                        color={career.matchScore >= 70 ? 'success' : 'brand'}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Briefcase className="h-8 w-8" />}
                title="No Career Recommendations Yet"
                description="Complete your skills assessment to get personalized career recommendations based on your experience."
                action={{
                  label: 'Start Assessment',
                  onClick: () => {
                    window.location.href = '/assessment';
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Recent Activity
          </h2>
        </div>

        {activity.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-[var(--border)]">
                {activity.map((item, index) => (
                  <li
                    key={`${item.type}-${item.date}-${index}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--accent)]/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)]">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--card-foreground)] truncate">
                        {item.title}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                      {getRelativeDate(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Clock className="h-8 w-8" />}
                title="No Activity Yet"
                description="Your recent actions will appear here as you use SkillBridge. Start by completing an assessment or exploring careers."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
