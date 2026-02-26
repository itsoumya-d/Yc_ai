'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  MapPin,
  Wifi,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { saveJob, updateJobMatch } from '@/lib/actions/jobs';
import { formatCurrency } from '@/lib/utils';
import type { Job, JobMatch } from '@/types/database';

interface JobBoardProps {
  jobs: Job[];
  matches: JobMatch[];
}

function getJobTypeBadgeVariant(type: Job['job_type']): BadgeVariant {
  switch (type) {
    case 'full_time':
      return 'default';
    case 'part_time':
      return 'secondary';
    case 'contract':
      return 'sunrise';
    case 'freelance':
      return 'warning';
  }
}

function formatJobType(type: Job['job_type']): string {
  return type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getExperienceBadgeVariant(level: Job['experience_level']): BadgeVariant {
  switch (level) {
    case 'entry':
      return 'success';
    case 'mid':
      return 'default';
    case 'senior':
      return 'sunrise';
    case 'lead':
      return 'warning';
  }
}

function formatExperienceLevel(level: Job['experience_level']): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function getMatchStatusBadgeVariant(status: JobMatch['status']): BadgeVariant {
  switch (status) {
    case 'new':
      return 'default';
    case 'saved':
      return 'secondary';
    case 'applied':
      return 'default';
    case 'interviewing':
      return 'sunrise';
    case 'rejected':
      return 'error';
    case 'accepted':
      return 'success';
  }
}

function formatMatchStatus(status: JobMatch['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

export function JobBoard({ jobs, matches }: JobBoardProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<'discover' | 'applications'>('discover');

  // Discover filters
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState('');

  // Saving state
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  // Build a set of saved job IDs for quick lookup
  const savedJobIds = useMemo(() => {
    return new Set(matches.map((m) => m.job_id));
  }, [matches]);

  // Filter jobs client-side
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.required_skills.some((s) => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (jobTypeFilter && job.job_type !== jobTypeFilter) {
        return false;
      }

      if (experienceFilter && job.experience_level !== experienceFilter) {
        return false;
      }

      if (remoteOnly && !job.remote) {
        return false;
      }

      if (minSalary) {
        const min = parseInt(minSalary, 10);
        if (!isNaN(min) && (job.salary_min === null || job.salary_min < min)) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchQuery, jobTypeFilter, experienceFilter, remoteOnly, minSalary]);

  const hasActiveFilters = searchQuery || jobTypeFilter || experienceFilter || remoteOnly || minSalary;

  async function handleSaveJob(jobId: string) {
    setSavingJobId(jobId);
    try {
      await saveJob(jobId);
      addToast('Job saved to your applications', 'success');
      router.refresh();
    } catch {
      addToast('Failed to save job', 'error');
    } finally {
      setSavingJobId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Job Board"
        description="Jobs matched to your skills"
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        <button
          onClick={() => setActiveTab('discover')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          My Applications
          {matches.length > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-100 px-1.5 text-xs font-medium text-brand-700">
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div>
          {/* Filters Bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-card sm:flex-row sm:items-center sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
              />
            </div>

            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            >
              <option value="">All Job Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>

            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            >
              <option value="">All Experience</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
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

            <div className="relative min-w-[140px]">
              <input
                type="number"
                placeholder="Min Salary"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setJobTypeFilter('');
                  setExperienceFilter('');
                  setRemoteOnly(false);
                  setMinSalary('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>

          {/* Job Cards Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  isSaving={savingJobId === job.id}
                  onSave={handleSaveJob}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<Search className="h-8 w-8" />}
                  title="No jobs found"
                  description={
                    hasActiveFilters
                      ? 'Try adjusting your filters to see more results.'
                      : 'No jobs are available at the moment. Check back later.'
                  }
                  action={
                    hasActiveFilters
                      ? {
                          label: 'Clear Filters',
                          onClick: () => {
                            setSearchQuery('');
                            setJobTypeFilter('');
                            setExperienceFilter('');
                            setRemoteOnly(false);
                            setMinSalary('');
                          },
                        }
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* My Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          {matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((match) => (
                <ApplicationCard
                  key={match.id}
                  match={match}
                  onUpdate={() => router.refresh()}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<Briefcase className="h-8 w-8" />}
                  title="No applications yet"
                  description="Save jobs from the Discover tab to track your applications and see how well your skills match."
                  action={{
                    label: 'Discover Jobs',
                    onClick: () => setActiveTab('discover'),
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function JobCard({
  job,
  isSaved,
  isSaving,
  onSave,
}: {
  job: Job;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (id: string) => void;
}) {
  const MAX_SKILLS_SHOWN = 6;
  const visibleSkills = job.required_skills.slice(0, MAX_SKILLS_SHOWN);
  const remainingCount = job.required_skills.length - MAX_SKILLS_SHOWN;

  return (
    <Card className="transition-shadow duration-normal hover:shadow-card-hover">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-[var(--card-foreground)]">
              {job.title}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">{job.company}</p>
          </div>
          <button
            onClick={() => onSave(job.id)}
            disabled={isSaved || isSaving}
            className={`shrink-0 rounded-full p-2 transition-colors ${
              isSaved
                ? 'text-red-500 cursor-default'
                : 'text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50'
            } disabled:opacity-70`}
            aria-label={isSaved ? 'Saved' : 'Save Job'}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          {job.remote ? (
            <Badge variant="success" size="sm">
              <Wifi className="mr-1 h-3 w-3" />
              Remote
            </Badge>
          ) : job.location ? (
            <>
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </>
          ) : null}
        </div>

        {/* Salary */}
        {(job.salary_min !== null || job.salary_max !== null) && (
          <p className="mb-3 text-sm font-medium text-[var(--card-foreground)]">
            {job.salary_min !== null && job.salary_max !== null
              ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
              : job.salary_min !== null
                ? `From ${formatCurrency(job.salary_min)}`
                : `Up to ${formatCurrency(job.salary_max!)}`}
          </p>
        )}

        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={getJobTypeBadgeVariant(job.job_type)} size="sm">
            {formatJobType(job.job_type)}
          </Badge>
          <Badge variant={getExperienceBadgeVariant(job.experience_level)} size="sm">
            {formatExperienceLevel(job.experience_level)}
          </Badge>
        </div>

        {/* Required Skills */}
        {job.required_skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
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

        {/* Posted date */}
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock className="h-3.5 w-3.5" />
          Posted {getRelativeTime(job.posted_at)}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({
  match,
  onUpdate,
}: {
  match: JobMatch;
  onUpdate: () => void;
}) {
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(match.notes ?? '');

  const job = match.job;

  async function handleStatusChange(newStatus: JobMatch['status']) {
    setUpdating(true);
    try {
      await updateJobMatch(match.id, { status: newStatus });
      addToast(`Status updated to ${formatMatchStatus(newStatus)}`, 'success');
      onUpdate();
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveNotes() {
    setUpdating(true);
    try {
      await updateJobMatch(match.id, { status: match.status, notes });
      addToast('Notes saved', 'success');
      setEditingNotes(false);
      onUpdate();
    } catch {
      addToast('Failed to save notes', 'error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card className="transition-shadow duration-normal hover:shadow-card-hover">
      <CardContent className="p-6">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-[var(--card-foreground)]">
              {job?.title ?? 'Unknown Job'}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {job?.company ?? 'Unknown Company'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Match Score */}
            <Badge
              variant={
                match.match_score >= 70
                  ? 'success'
                  : match.match_score >= 40
                    ? 'warning'
                    : 'secondary'
              }
              size="sm"
            >
              {match.match_score}% match
            </Badge>
            {/* Status Badge */}
            <Badge variant={getMatchStatusBadgeVariant(match.status)} size="sm">
              {formatMatchStatus(match.status)}
            </Badge>
          </div>
        </div>

        {/* Status Update */}
        <div className="mb-3 flex items-center gap-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">
            Update Status:
          </label>
          <select
            value={match.status}
            onChange={(e) => handleStatusChange(e.target.value as JobMatch['status'])}
            disabled={updating}
            className="h-8 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 disabled:opacity-50"
          >
            <option value="new">New</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        {/* Expandable Skills Section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-2 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          {expanded ? 'Hide' : 'Show'} Skills Details
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expanded && (
          <div className="mb-3 space-y-3 rounded-lg bg-[var(--muted)]/50 p-3">
            {/* Matching Skills */}
            {match.matching_skills.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-green-700">
                  Matching Skills ({match.matching_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.matching_skills.map((skill) => (
                    <Badge key={skill} variant="success" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {match.missing_skills.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-red-700">
                  Missing Skills ({match.missing_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.missing_skills.map((skill) => (
                    <Badge key={skill} variant="error" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mt-3">
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={3}
                className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  isLoading={updating}
                >
                  Save Notes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingNotes(false);
                    setNotes(match.notes ?? '');
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingNotes(true)}
              className="w-full text-left rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)] transition-colors"
            >
              {match.notes || 'Add notes...'}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
