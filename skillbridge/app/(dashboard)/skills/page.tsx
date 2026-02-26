import { getSkills, getSkillsByCategory } from '@/lib/actions/skills';
import { SkillsProfile } from '@/components/skills/skills-profile';

export default async function SkillsPage() {
  const [skills, skillsByCategory] = await Promise.all([
    getSkills(),
    getSkillsByCategory(),
  ]);
  return <SkillsProfile skills={skills} skillsByCategory={skillsByCategory} />;
}
