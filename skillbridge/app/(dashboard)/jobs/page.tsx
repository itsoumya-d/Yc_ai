import { getJobs, getJobMatches } from '@/lib/actions/jobs';
import { JobBoard } from '@/components/careers/job-board';

export default async function JobsPage() {
  const [jobs, matches] = await Promise.all([
    getJobs(),
    getJobMatches(),
  ]);
  return <JobBoard jobs={jobs} matches={matches} />;
}
