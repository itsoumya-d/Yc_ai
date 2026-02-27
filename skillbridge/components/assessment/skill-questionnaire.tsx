'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';
import { saveAssessment } from '@/lib/actions/assessment';
import { extractSkillsFromText } from '@/lib/actions/ai';
import { ChevronRight, ChevronLeft, Plus, X, Loader2 } from 'lucide-react';
import type { SkillEntry } from '@/types/database';

const EXPERIENCE_LEVELS = ['Entry Level (0-2 years)', 'Mid Level (2-5 years)', 'Senior (5-10 years)', 'Expert (10+ years)'];
const EDUCATION_LEVELS = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Bootcamp / Self-taught', 'Professional Certification'];
const SKILL_LEVELS: SkillEntry['level'][] = ['beginner', 'intermediate', 'advanced', 'expert'];
const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Data Analysis',
  'Machine Learning', 'Project Management', 'Communication', 'Leadership', 'Excel',
  'Java', 'C++', 'Go', 'AWS', 'Docker', 'Kubernetes', 'UI/UX Design', 'Marketing',
];

const steps = [
  { id: 'experience', title: 'Experience Level', description: 'How many years of work experience do you have?' },
  { id: 'education', title: 'Education', description: 'What is your highest level of education?' },
  { id: 'skills', title: 'Your Skills', description: 'Add your skills and rate your proficiency level.' },
  { id: 'freeform', title: 'Tell Us More', description: 'Describe your background in your own words. We\'ll extract additional skills.' },
  { id: 'review', title: 'Review', description: 'Review your profile before we generate your career matches.' },
];

export function SkillQuestionnaire() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillEntry['level']>('intermediate');
  const [newSkillYears, setNewSkillYears] = useState(1);
  const [freeformText, setFreeformText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      showToast('Skill already added', 'error');
      return;
    }
    setSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        level: newSkillLevel,
        years: newSkillYears,
        category: 'General',
      },
    ]);
    setNewSkillName('');
    setNewSkillYears(1);
  };

  const removeSkill = (name: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const extractSkills = async () => {
    if (!freeformText.trim()) return;
    setExtracting(true);
    try {
      const result = await extractSkillsFromText(freeformText);
      if (result.data && result.data.length > 0) {
        const newSkills = result.data.filter(
          (s) => !skills.some((existing) => existing.name.toLowerCase() === s.name.toLowerCase())
        );
        setSkills((prev) => [...prev, ...newSkills]);
        showToast(`Extracted ${newSkills.length} additional skills`, 'success');
      }
    } catch {
      showToast('Failed to extract skills', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const calculateScore = (): number => {
    if (skills.length === 0) return 0;
    const levelValues = { beginner: 25, intermediate: 50, advanced: 75, expert: 100 };
    const avg = skills.reduce((sum, s) => sum + levelValues[s.level], 0) / skills.length;
    const expBonus = EXPERIENCE_LEVELS.indexOf(experienceLevel) * 5;
    const eduBonus = EDUCATION_LEVELS.indexOf(education) * 3;
    const countBonus = Math.min(skills.length * 2, 20);
    return Math.min(Math.round(avg * 0.6 + expBonus + eduBonus + countBonus), 100);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const skillScore = calculateScore();
      const result = await saveAssessment({
        skills,
        experienceLevel,
        education,
        rawInput: freeformText || undefined,
        skillScore,
      });
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Assessment saved! Generating career matches...', 'success');
        router.push('/careers');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return !!experienceLevel;
    if (currentStep === 1) return !!education;
    if (currentStep === 2) return skills.length >= 1;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} size="md" />
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Experience */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-colors ${
                    experienceLevel === level
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Education */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EDUCATION_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setEducation(level)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-colors ${
                    education === level
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Quick add from common skills */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Quick add popular skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SKILLS.filter((s) => !skills.some((sk) => sk.name === s)).slice(0, 12).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSkills((prev) => [...prev, { name: skill, level: 'intermediate', years: 1, category: 'Technical' }]);
                      }}
                      className="px-2.5 py-1 text-xs rounded-full border border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual skill entry */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Skill name..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as SkillEntry['level'])}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <input
                  type="number"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(Number(e.target.value))}
                  min={0}
                  max={30}
                  className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Years"
                />
                <Button onClick={addSkill} size="md">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Skills list */}
              {skills.length > 0 && (
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                        <Badge variant={skill.level === 'expert' ? 'default' : skill.level === 'advanced' ? 'secondary' : 'outline'}>
                          {skill.level}
                        </Badge>
                        <span className="text-xs text-gray-400">{skill.years}yr</span>
                      </div>
                      <button onClick={() => removeSkill(skill.name)} className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Freeform */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <textarea
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                rows={8}
                placeholder="Describe your work experience, projects, achievements, and any skills not mentioned above. For example: 'I've been a software engineer for 5 years, mostly working on backend systems using Python and Django...'"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <Button
                onClick={extractSkills}
                disabled={!freeformText.trim() || extracting}
                variant="outline"
              >
                {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {extracting ? 'Extracting...' : 'Extract skills with AI'}
              </Button>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{experienceLevel}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-500">Education</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{education}</p>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500">Skills ({skills.length})</p>
                  <p className="text-sm font-bold text-indigo-600">Score: {calculateScore()}/100</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <Badge key={s.name}>{s.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Generate Career Matches'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
