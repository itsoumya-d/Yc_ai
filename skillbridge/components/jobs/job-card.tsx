import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Wifi, Building2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import type { JobMatch } from '@/types/database';

interface JobCardProps {
  job: JobMatch;
}

const remoteConfig = {
  remote: { label: 'Remote', variant: 'success' as const, icon: Wifi },
  hybrid: { label: 'Hybrid', variant: 'warning' as const, icon: Wifi },
  onsite: { label: 'On-site', variant: 'outline' as const, icon: Building2 },
};

export function JobCard({ job }: JobCardProps) {
  const remote = remoteConfig[job.remote_type];

  const scoreColor =
    job.transferability_score >= 80
      ? 'text-green-600'
      : job.transferability_score >= 60
      ? 'text-indigo-600'
      : job.transferability_score >= 40
      ? 'text-yellow-600'
      : 'text-red-600';

  const scoreProgressColor =
    job.transferability_score >= 80
      ? 'green'
      : job.transferability_score >= 60
      ? 'indigo'
      : job.transferability_score >= 40
      ? 'yellow'
      : 'red';

  return (
    <Card hover className="flex flex-col">
      <CardContent className="pt-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{job.job_title}</h3>
            <p className="text-sm text-gray-600 truncate">{job.company}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-2xl font-bold ${scoreColor}`}>{job.transferability_score}%</div>
            <div className="text-xs text-gray-400">fit</div>
          </div>
        </div>

        {/* Transferability bar */}
        <Progress
          value={job.transferability_score}
          color={scoreProgressColor as 'indigo' | 'green' | 'yellow' | 'red'}
          size="sm"
          className="mb-3"
        />

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={remote.variant}>{remote.label}</Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {job.location}
          </div>
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <DollarSign className="w-3 h-3" />
              {job.salary_min && job.salary_max
                ? `$${Math.round(job.salary_min / 1000)}k–$${Math.round(job.salary_max / 1000)}k`
                : job.salary_min
                ? `From $${Math.round(job.salary_min / 1000)}k`
                : `Up to $${Math.round(job.salary_max! / 1000)}k`}
            </div>
          )}
        </div>

        {/* Skills */}
        {job.matching_skills.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-medium text-gray-500">Matching skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.matching_skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="success">{skill}</Badge>
              ))}
              {job.matching_skills.length > 3 && (
                <Badge variant="outline">+{job.matching_skills.length - 3}</Badge>
              )}
            </div>
          </div>
        )}

        {job.missing_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-gray-500">Skills to develop</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.missing_skills.slice(0, 2).map((skill) => (
                <Badge key={skill} variant="warning">{skill}</Badge>
              ))}
              {job.missing_skills.length > 2 && (
                <Badge variant="outline">+{job.missing_skills.length - 2}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          {job.posted_at && (
            <span className="text-xs text-gray-400">{formatRelativeDate(job.posted_at)}</span>
          )}
          {job.job_url ? (
            <a href={job.job_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                Apply <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
