import { getLatestAssessment } from '@/lib/actions/assessment';
import { getProfile } from '@/lib/actions/profile';
import { AssessmentWizard } from '@/components/skills/assessment-wizard';

export default async function AssessmentPage() {
  const [assessment, profile] = await Promise.all([
    getLatestAssessment(),
    getProfile(),
  ]);

  return (
    <AssessmentWizard
      latestAssessment={assessment}
      onboardingStep={profile?.onboarding_step ?? 0}
    />
  );
}
