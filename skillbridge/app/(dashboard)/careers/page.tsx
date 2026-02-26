import { getCareerPaths, getIndustries } from '@/lib/actions/careers';
import { getRecommendedCareers } from '@/lib/actions/careers';
import { CareerExplorer } from '@/components/careers/career-explorer';

export default async function CareersPage() {
  const [careers, recommended, industries] = await Promise.all([
    getCareerPaths(),
    getRecommendedCareers(),
    getIndustries(),
  ]);
  return <CareerExplorer careers={careers} recommended={recommended} industries={industries} />;
}
