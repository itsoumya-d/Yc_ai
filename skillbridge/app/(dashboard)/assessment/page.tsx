import { PageHeader } from '@/components/layout/page-header';
import { SkillQuestionnaire } from '@/components/assessment/skill-questionnaire';

export const metadata = { title: 'Skills Assessment' };

export default function AssessmentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Skills Assessment"
        description="Tell us about your skills and experience. We'll map them to career opportunities."
      />
      <SkillQuestionnaire />
    </div>
  );
}
