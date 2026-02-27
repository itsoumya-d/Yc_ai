import { getLearningPlans, getCourses } from '@/lib/actions/learning';
import { LearningDashboard } from '@/components/learning/learning-dashboard';

export default async function LearningPage() {
  const [plans, courses] = await Promise.all([
    getLearningPlans(),
    getCourses(),
  ]);
  return <LearningDashboard plans={plans} courses={courses} />;
}
