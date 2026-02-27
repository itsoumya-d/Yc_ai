import { getResumes } from '@/lib/actions/resume';
import { getSkills } from '@/lib/actions/skills';
import { getProfile } from '@/lib/actions/profile';
import { ResumeBuilder } from '@/components/careers/resume-builder';

export default async function ResumePage() {
  const [resumes, skills, profile] = await Promise.all([
    getResumes(),
    getSkills(),
    getProfile(),
  ]);
  return <ResumeBuilder resumes={resumes} skills={skills} profile={profile} />;
}
