'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Clock,
  Wifi,
  CheckCircle2,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { CareerPath, Course } from '@/types/database';

interface CareerDetailProps {
  career: CareerPath;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  relevantCourses: Course[];
}

function getDemandBadgeVariant(level: CareerPath['demand_level']) {
  switch (level) {
    case 'very_high':
      return 'default' as const;
    case 'high':
      return 'success' as const;
    case 'medium':
      return 'sunrise' as const;
    case 'low':
      return 'secondary' as const;
  }
}

function formatDemandLabel(level: CareerPath['demand_level']): string {
  return level.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDifficultyVariant(difficulty: Course['difficulty']) {
  switch (difficulty) {
    case 'beginner':
      return 'success' as const;
    case 'intermediate':
      return 'sunrise' as const;
    case 'advanced':
      return 'default' as const;
  }
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-sunrise-600';
  return 'text-red-500';
}

function getScoreRingColor(score: number): string {
  if (score >= 70) return 'stroke-green-500';
  if (score >= 40) return 'stroke-sunrise-500';
  return 'stroke-red-400';
}

export function CareerDetail({
  career,
  matchScore,
  matchingSkills,
  missingSkills,
  relevantCourses,
}: CareerDetailProps) {
  return (
    <div>
      {/* Back Button */}
      <Link
        href="/careers"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Careers
      </Link>

      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">
            {career.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{career.industry}</Badge>
            <Badge variant={getDemandBadgeVariant(career.demand_level)}>
              {formatDemandLabel(career.demand_level)} Demand
            </Badge>
            {career.remote_friendly && (
              <Badge variant="success">
                <Wifi className="mr-1 h-3 w-3" />
                Remote Friendly
              </Badge>
            )}
          </div>
          {career.description && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] max-w-2xl">
              {career.description}
            </p>
          )}
        </div>

        {/* Match Score Circle */}
        <div className="flex shrink-0 flex-col items-center">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                className="fill-none stroke-[var(--muted)]"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                className={`fill-none ${getScoreRingColor(matchScore)}`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(matchScore / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-heading text-3xl font-bold ${getScoreColor(matchScore)}`}>
                {matchScore}%
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">Match</span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">Skills Match</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Salary Range"
          value={`${formatCurrency(career.avg_salary_min)} - ${formatCurrency(career.avg_salary_max)}`}
        />
        <StatItem
          icon={<TrendingUp className="h-5 w-5 text-brand-600" />}
          label="Growth Rate"
          value={`${career.growth_rate}%`}
          valueClass={career.growth_rate > 0 ? 'text-green-600' : undefined}
        />
        <StatItem
          icon={<Clock className="h-5 w-5 text-sunrise-600" />}
          label="Transition Time"
          value={
            career.transition_time_months
              ? `${career.transition_time_months} month${career.transition_time_months !== 1 ? 's' : ''}`
              : 'Varies'
          }
        />
        <StatItem
          icon={<Wifi className="h-5 w-5 text-brand-600" />}
          label="Remote Friendly"
          value={career.remote_friendly ? 'Yes' : 'No'}
        />
      </div>

      {/* Skills Match Section */}
      <div className="mb-8">
        <h2 className="mb-4 font-heading text-xl font-semibold text-[var(--foreground)]">
          Skills Match
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Skills You Have */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Skills You Have
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matchingSkills.length > 0 ? (
                <ul className="space-y-2">
                  {matchingSkills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2 text-sm text-[var(--card-foreground)]"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No matching skills yet. Complete an assessment to identify your skills.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills to Develop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sunrise-700">
                <ArrowUpRight className="h-5 w-5" />
                Skills to Develop
              </CardTitle>
            </CardHeader>
            <CardContent>
              {missingSkills.length > 0 ? (
                <ul className="space-y-2">
                  {missingSkills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2 text-sm text-[var(--card-foreground)]"
                    >
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-sunrise-500" />
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  You have all the required skills for this career path!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Education Requirements */}
      {career.education_requirements && (
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-[var(--foreground)]">
            Education Requirements
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 shrink-0 text-brand-600 mt-0.5" />
                <p className="text-sm text-[var(--card-foreground)]">
                  {career.education_requirements}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended Courses */}
      {relevantCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-[var(--foreground)]">
            Recommended Courses
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relevantCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Start Learning Path CTA */}
      {missingSkills.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <Target className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-brand-900">
                  Ready to Start Your Journey?
                </h3>
                <p className="mt-1 text-sm text-brand-700">
                  You have {missingSkills.length} skill{missingSkills.length !== 1 ? 's' : ''} to
                  develop. Create a personalized learning plan to bridge the gap.
                </p>
              </div>
            </div>
            <Link href="/learning">
              <Button size="lg" className="shrink-0">
                <BookOpen className="h-4 w-4" />
                Start Learning Path
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function StatItem({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-card">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--muted)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
        <p className={`font-heading text-sm font-semibold ${valueClass ?? 'text-[var(--card-foreground)]'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="flex h-full flex-col transition-shadow duration-normal hover:shadow-card-hover">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading text-base font-semibold text-[var(--card-foreground)] line-clamp-2">
            {course.title}
          </h3>
        </div>

        <p className="mb-3 text-xs text-[var(--muted-foreground)]">{course.provider}</p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={getDifficultyVariant(course.difficulty)} size="sm">
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </Badge>
          {course.duration_hours && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Clock className="h-3 w-3" />
              {course.duration_hours}h
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--card-foreground)]">
            {course.price === 0 ? 'Free' : formatCurrency(course.price)}
          </span>
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              View
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
