'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  TrendingUp,
  Wifi,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatCurrency } from '@/lib/utils';
import type { CareerPath } from '@/types/database';

interface CareerExplorerProps {
  careers: CareerPath[];
  recommended: (CareerPath & { matchScore: number })[];
  industries: string[];
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

export function CareerExplorer({ careers, recommended, industries }: CareerExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedDemand, setSelectedDemand] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          career.title.toLowerCase().includes(query) ||
          career.description.toLowerCase().includes(query) ||
          career.industry.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Industry filter
      if (selectedIndustry && career.industry !== selectedIndustry) {
        return false;
      }

      // Demand level filter
      if (selectedDemand && career.demand_level !== selectedDemand) {
        return false;
      }

      // Remote filter
      if (remoteOnly && !career.remote_friendly) {
        return false;
      }

      return true;
    });
  }, [careers, searchQuery, selectedIndustry, selectedDemand, remoteOnly]);

  const hasActiveFilters = searchQuery || selectedIndustry || selectedDemand || remoteOnly;

  return (
    <div>
      <PageHeader
        title="Career Explorer"
        description="Discover careers that match your skills"
      />

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-lg font-semibold text-[var(--foreground)]">
            Recommended for You
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {recommended.map((career) => (
              <Link
                key={career.id}
                href={`/careers/${career.slug}`}
                className="group shrink-0"
              >
                <Card className="w-72 transition-shadow duration-normal hover:shadow-card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-heading text-base font-semibold text-[var(--card-foreground)] group-hover:text-brand-600 transition-colors line-clamp-2">
                        {career.title}
                      </h3>
                      <Badge
                        variant={
                          career.matchScore >= 70
                            ? 'success'
                            : career.matchScore >= 40
                              ? 'warning'
                              : 'secondary'
                        }
                        size="sm"
                        className="shrink-0"
                      >
                        {career.matchScore}%
                      </Badge>
                    </div>

                    <Badge variant="outline" size="sm" className="mb-3">
                      {career.industry}
                    </Badge>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">Salary</span>
                        <span className="font-medium text-[var(--card-foreground)]">
                          {formatCurrency(career.avg_salary_min)} - {formatCurrency(career.avg_salary_max)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">Growth</span>
                        <span className="inline-flex items-center gap-1 font-medium text-green-600">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {career.growth_rate}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
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
        </section>
      )}

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-card sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search careers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
          />
        </div>

        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        <select
          value={selectedDemand}
          onChange={(e) => setSelectedDemand(e.target.value)}
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
        >
          <option value="">All Demand Levels</option>
          <option value="very_high">Very High</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
          />
          <Wifi className="h-4 w-4 text-[var(--muted-foreground)]" />
          Remote
        </label>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedIndustry('');
              setSelectedDemand('');
              setRemoteOnly(false);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''} found
      </p>

      {/* Results Grid */}
      {filteredCareers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No careers found"
              description={
                hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No career paths are available at the moment. Check back later.'
              }
              action={
                hasActiveFilters
                  ? {
                      label: 'Clear Filters',
                      onClick: () => {
                        setSearchQuery('');
                        setSelectedIndustry('');
                        setSelectedDemand('');
                        setRemoteOnly(false);
                      },
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function CareerCard({ career }: { career: CareerPath }) {
  const MAX_SKILLS_SHOWN = 5;
  const visibleSkills = career.required_skills.slice(0, MAX_SKILLS_SHOWN);
  const remainingCount = career.required_skills.length - MAX_SKILLS_SHOWN;

  return (
    <Link href={`/careers/${career.slug}`} className="group">
      <Card className="h-full transition-shadow duration-normal hover:shadow-card-hover">
        <CardContent className="p-6">
          {/* Title */}
          <h3 className="font-heading text-lg font-semibold text-[var(--card-foreground)] group-hover:text-brand-600 transition-colors mb-3">
            {career.title}
          </h3>

          {/* Badges row */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="sm">
              {career.industry}
            </Badge>
            <Badge variant={getDemandBadgeVariant(career.demand_level)} size="sm">
              {formatDemandLabel(career.demand_level)}
            </Badge>
            {career.remote_friendly && (
              <Badge variant="success" size="sm">
                <Wifi className="mr-1 h-3 w-3" />
                Remote
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Salary Range</span>
              <span className="font-medium text-[var(--card-foreground)]">
                {formatCurrency(career.avg_salary_min)} - {formatCurrency(career.avg_salary_max)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Growth Rate</span>
              <span className={`inline-flex items-center gap-1 font-medium ${career.growth_rate > 0 ? 'text-green-600' : 'text-[var(--muted-foreground)]'}`}>
                {career.growth_rate > 0 && <TrendingUp className="h-3.5 w-3.5" />}
                {career.growth_rate}%
              </span>
            </div>
          </div>

          {/* Required Skills */}
          {career.required_skills.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
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
            </div>
          )}

          {/* View Details Link */}
          <div className="flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
