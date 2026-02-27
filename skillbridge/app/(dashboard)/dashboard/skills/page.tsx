import { getUser } from '@/lib/actions/auth';
import { fetchSkillsByCategory } from '@/lib/actions/skills';
import { redirect } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ArrowRight } from 'lucide-react';
import type { Skill, SkillCategory } from '@/types/database';

export const metadata = {
  title: 'Skills Profile',
};

const categoryLabels: Record<SkillCategory, string> = {
  technical: 'Technical Skills',
  interpersonal: 'Interpersonal / Soft Skills',
  analytical: 'Analytical Skills',
  physical: 'Physical Skills',
  creative: 'Creative Skills',
  managerial: 'Management / Leadership',
  tools: 'Tools & Technology',
  certifications: 'Certifications & Licenses',
};

const categoryBadgeVariant: Record<SkillCategory, 'teal' | 'blue' | 'orange' | 'green' | 'amber' | 'red' | 'gold' | 'default'> = {
  technical: 'teal',
  interpersonal: 'blue',
  analytical: 'orange',
  physical: 'amber',
  creative: 'green',
  managerial: 'gold',
  tools: 'teal',
  certifications: 'green',
};

function ProficiencyDots({ level }: { level: string }) {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const filled = levels.indexOf(level) + 1;

  return (
    <div className="flex gap-1" aria-label={`Proficiency: ${level}`}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= filled ? 'bg-teal-500' : 'bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

function SkillBadge({ skill }: { skill: Skill }) {
  const variant = categoryBadgeVariant[skill.category] ?? 'default';

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm bg-white shadow-warm-sm">
      <span className="font-medium text-stone-800">{skill.name}</span>
      <ProficiencyDots level={skill.proficiency} />
      <Badge variant={variant} className="text-[10px] px-1.5 py-0.5">
        {skill.source === 'resume' ? 'R' : skill.source === 'questionnaire' ? 'Q' : skill.source === 'course_earned' ? 'C' : 'U'}
      </Badge>
    </div>
  );
}

export default async function SkillsPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const result = await fetchSkillsByCategory();
  const grouped = result.success ? result.data : {};
  const totalSkills = Object.values(grouped).flat().length;

  // Empty state
  if (totalSkills === 0) {
    return (
      <div className="mx-auto max-w-lg text-center py-16 space-y-6">
        <div className="rounded-full bg-teal-50 p-6 w-fit mx-auto">
          <PlusCircle className="h-12 w-12 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          Let&apos;s discover your skills!
        </h1>
        <p className="text-stone-500">
          Complete a skills assessment to identify your transferable skills and unlock career recommendations.
        </p>
        <Link href="/dashboard/assessment">
          <Button variant="primary" size="lg">
            Start Assessment <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
            Your Skills Profile
          </h1>
          <p className="text-stone-500 mt-1">
            {totalSkills} transferable skills identified across {Object.keys(grouped).length} categories
          </p>
        </div>
        <Button variant="outline" size="sm">
          <PlusCircle className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="teal">{totalSkills} Total Skills</Badge>
        {Object.entries(grouped).map(([cat, skills]) => (
          <Badge key={cat} variant="outline">
            {categoryLabels[cat as SkillCategory]}: {skills.length}
          </Badge>
        ))}
      </div>

      {/* Skills by Category */}
      {Object.entries(grouped).map(([category, skills]) => (
        <Card key={category}>
          <CardTitle className="mb-4">
            {categoryLabels[category as SkillCategory]}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillBadge key={skill.id} skill={skill} />
            ))}
          </div>
        </Card>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/careers">
          <Button variant="primary">
            Explore Career Matches <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/dashboard/assessment">
          <Button variant="ghost">Retake Assessment</Button>
        </Link>
      </div>
    </div>
  );
}
