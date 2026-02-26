'use server';

import { createClient } from '@/lib/supabase/server';
import type { DashboardStats } from '@/types/database';

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Run all count/aggregate queries in parallel
  const [
    skillsResult,
    jobMatchesResult,
    learningPlansResult,
    coursesCompletedResult,
  ] = await Promise.all([
    // Skills count
    supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),

    // Job matches with scores
    supabase
      .from('job_matches')
      .select('match_score')
      .eq('user_id', user.id),

    // Learning plans with progress
    supabase
      .from('learning_plans')
      .select('progress')
      .eq('user_id', user.id),

    // Completed courses count
    supabase
      .from('course_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed'),
  ]);

  // Skills count
  const skillsCount = skillsResult.count ?? 0;

  // Average match score
  const jobMatchesData = jobMatchesResult.data ?? [];
  const jobMatches = jobMatchesData.length;
  const matchScore =
    jobMatchesData.length > 0
      ? Math.round(
          jobMatchesData.reduce((sum, jm) => sum + (jm.match_score ?? 0), 0) /
            jobMatchesData.length
        )
      : 0;

  // Average learning progress
  const learningPlansData = learningPlansResult.data ?? [];
  const learningProgress =
    learningPlansData.length > 0
      ? Math.round(
          learningPlansData.reduce((sum, lp) => sum + (lp.progress ?? 0), 0) /
            learningPlansData.length
        )
      : 0;

  // Completed courses count
  const coursesCompleted = coursesCompletedResult.count ?? 0;

  return {
    skillsCount,
    matchScore,
    learningProgress,
    jobMatches,
    coursesCompleted,
    streakDays: 0,
  };
}

export async function getRecentActivity(): Promise<
  Array<{ type: string; title: string; date: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch recent activity from multiple sources in parallel
  const [skillsResult, coursesResult, jobsResult] = await Promise.all([
    // Recent skills added
    supabase
      .from('skills')
      .select('name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),

    // Recent course progress updates
    supabase
      .from('course_progress')
      .select('status, started_at, completed_at, course:courses(title)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(10),

    // Recent jobs saved
    supabase
      .from('job_matches')
      .select('status, created_at, job:jobs(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const activities: Array<{ type: string; title: string; date: string }> = [];

  // Process skills
  if (skillsResult.data) {
    for (const skill of skillsResult.data) {
      activities.push({
        type: 'skill_added',
        title: `Added skill: ${skill.name}`,
        date: skill.created_at,
      });
    }
  }

  // Process course progress
  if (coursesResult.data) {
    for (const cp of coursesResult.data) {
      const courseData = cp.course as unknown as { title: string } | null;
      const courseTitle = courseData?.title ?? 'Unknown course';

      if (cp.status === 'completed') {
        activities.push({
          type: 'course_completed',
          title: `Completed course: ${courseTitle}`,
          date: cp.completed_at ?? cp.started_at ?? '',
        });
      } else if (cp.status === 'in_progress') {
        activities.push({
          type: 'course_started',
          title: `Started course: ${courseTitle}`,
          date: cp.started_at ?? '',
        });
      }
    }
  }

  // Process job matches
  if (jobsResult.data) {
    for (const jm of jobsResult.data) {
      const jobData = jm.job as unknown as { title: string } | null;
      const jobTitle = jobData?.title ?? 'Unknown job';

      activities.push({
        type: 'job_saved',
        title: `Saved job: ${jobTitle}`,
        date: jm.created_at,
      });
    }
  }

  // Sort by date descending and limit to 10
  activities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return activities.slice(0, 10);
}
