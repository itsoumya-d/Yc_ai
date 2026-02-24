'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Plus, Trash2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { upsertProfile } from '@/lib/actions/profile';
import { addSkill } from '@/lib/actions/skills';
import { generateCareerPaths } from '@/lib/actions/careers';
import type { SkillCategory, ProficiencyLevel } from '@/types/database';

interface SkillEntry {
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_used: number;
}

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'soft', label: 'Soft Skill' },
  { value: 'domain', label: 'Domain Knowledge' },
  { value: 'language', label: 'Language' },
  { value: 'certification', label: 'Certification' },
];

const PROFICIENCIES: { value: ProficiencyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const STEPS = ['Background', 'Skills', 'Goals'];

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [location, setLocation] = useState('');

  // Step 2
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [newSkill, setNewSkill] = useState<SkillEntry>({
    name: '',
    category: 'technical',
    proficiency: 'intermediate',
    years_used: 1,
  });

  // Step 3
  const [targetIndustry, setTargetIndustry] = useState('');

  function addSkillEntry() {
    if (!newSkill.name.trim()) return;
    setSkills([...skills, { ...newSkill }]);
    setNewSkill({ name: '', category: 'technical', proficiency: 'intermediate', years_used: 1 });
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);
    try {
      await upsertProfile({
        current_role: currentRole,
        years_experience: parseInt(yearsExperience) || 0,
        location,
        target_industry: targetIndustry,
        onboarding_completed: true,
      });

      for (const skill of skills) {
        await addSkill(skill);
      }

      await generateCareerPaths();
      router.push('/career-paths');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Assessment</h1>
        <p className="text-gray-500 mt-1">Tell us about yourself to get personalized career recommendations.</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-sky-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                i < step
                  ? 'bg-sky-500 border-sky-500 text-white'
                  : i === step
                  ? 'border-sky-500 text-sky-600 bg-sky-50'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 min-w-[2rem] ${i < step ? 'bg-sky-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Step 1: Background */}
      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Your Background</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Role / Job Title</label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Software Engineer, Marketing Manager"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              min="0"
              max="50"
              placeholder="e.g. 5"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!currentRole.trim() || !location.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Skills */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Your Skills</h2>
          <p className="text-sm text-gray-500">Add the skills you have from your current and past roles.</p>

          {/* Add skill form */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addSkillEntry()}
                  placeholder="e.g. Python, Project Management"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Proficiency</label>
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value as ProficiencyLevel })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {PROFICIENCIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Years Used</label>
                <input
                  type="number"
                  value={newSkill.years_used}
                  onChange={(e) => setNewSkill({ ...newSkill, years_used: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <button
              onClick={addSkillEntry}
              disabled={!newSkill.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Skills list */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Added Skills ({skills.length})</h3>
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium text-sm text-gray-800">{skill.name}</span>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{skill.category}</span>
                        <span className="text-xs text-gray-500">{skill.proficiency}</span>
                        <span className="text-xs text-gray-400">{skill.years_used}y</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeSkill(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={skills.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Your Goals</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Industry or Role</label>
            <input
              type="text"
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              placeholder="e.g. Data Science, Product Management, UX Design"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-xs text-gray-400 mt-1">Not sure? Leave it blank and our AI will suggest options based on your skills.</p>
          </div>

          <div className="p-4 bg-sky-50 rounded-lg">
            <h4 className="text-sm font-medium text-sky-800 mb-1">Ready to analyze</h4>
            <p className="text-sm text-sky-600">
              Our AI will analyze your {skills.length} skills and generate personalized career path recommendations.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your profile...
                </>
              ) : (
                <>
                  Generate Career Paths <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
