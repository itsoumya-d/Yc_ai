'use client';

import { useEffect, useState, useTransition } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/job-card';
import { useToast } from '@/components/ui/toast';
import { getJobMatches, generateJobMatches } from '@/lib/actions/jobs';
import { Loader2, RefreshCw, Briefcase } from 'lucide-react';
import type { JobMatch } from '@/types/database';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [filterRemote, setFilterRemote] = useState<string>('all');

  useEffect(() => {
    getJobMatches().then(({ data }) => {
      setJobs(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateJobMatches();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        setJobs(result.data ?? []);
        showToast('Job matches generated!', 'success');
      }
    });
  };

  const filtered = filterRemote === 'all' ? jobs : jobs.filter((j) => j.remote_type === filterRemote);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Matches"
        description="Jobs matched to your skill profile with transferability scores."
        action={
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isPending ? 'Finding Jobs...' : jobs.length > 0 ? 'Refresh Jobs' : 'Find Jobs'}
          </Button>
        }
      />

      {/* Filters */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          {['all', 'remote', 'hybrid', 'onsite'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterRemote(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterRemote === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          <span className="text-sm text-gray-400 ml-2">{filtered.length} jobs</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No job matches yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Complete your skills assessment first, then click Find Jobs to see personalized matches.
          </p>
          <Button onClick={handleGenerate} disabled={isPending} className="mt-4">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Find Jobs
          </Button>
        </div>
      )}
    </div>
  );
}
