import { getDashboardStats, getRecentActivity } from '@/lib/actions/dashboard';
import { getRecommendedCareers } from '@/lib/actions/careers';
import { getSkills } from '@/lib/actions/skills';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const [stats, activity, careers, skills] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getRecommendedCareers(),
    getSkills(),
  ]);

  return (
    <DashboardClient
      stats={stats}
      activity={activity}
      topCareers={careers.slice(0, 3)}
      skillsCount={skills.length}
      hasCompletedAssessment={skills.length > 0}
    />
  );
}
