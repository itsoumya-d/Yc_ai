import { getCareerPath } from '@/lib/actions/careers';
import { getSkills } from '@/lib/actions/skills';
import { getCourses } from '@/lib/actions/learning';
import { notFound } from 'next/navigation';
import { CareerDetail } from '@/components/careers/career-detail';

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [career, skills, courses] = await Promise.all([
    getCareerPath(slug),
    getSkills(),
    getCourses(),
  ]);

  if (!career) notFound();

  // Calculate skill match
  const userSkillNames = skills.map(s => s.name.toLowerCase());
  const matchingSkills = career.required_skills.filter(s => userSkillNames.includes(s.toLowerCase()));
  const missingSkills = career.required_skills.filter(s => !userSkillNames.includes(s.toLowerCase()));
  const matchScore = career.required_skills.length > 0
    ? Math.round((matchingSkills.length / career.required_skills.length) * 100)
    : 0;

  // Find relevant courses for missing skills
  const relevantCourses = courses
    .filter(c =>
      c.skills_covered.some(s =>
        missingSkills.map(m => m.toLowerCase()).includes(s.toLowerCase())
      )
    )
    .slice(0, 6);

  return (
    <CareerDetail
      career={career}
      matchScore={matchScore}
      matchingSkills={matchingSkills}
      missingSkills={missingSkills}
      relevantCourses={relevantCourses}
    />
  );
}
