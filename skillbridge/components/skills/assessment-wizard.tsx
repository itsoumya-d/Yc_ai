'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MessageSquare,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  startAssessment,
  processResumeAssessment,
  processQuestionnaireAssessment,
} from '@/lib/actions/assessment';
import { completeOnboarding } from '@/lib/actions/profile';
import type { SkillAssessment } from '@/types/database';

interface AssessmentWizardProps {
  latestAssessment: SkillAssessment | null;
  onboardingStep: number;
}

interface ExtractedSkill {
  name: string;
  category: string;
  proficiency: string;
  confidence: number;
}

type AssessmentMethod = 'resume' | 'questionnaire' | null;

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Engineering',
  'Legal',
  'Other',
];

const EXPERIENCE_LEVELS = ['0-2', '3-5', '6-10', '10+'];

const QUESTIONS = [
  {
    key: 'current_title',
    label: 'What is your current job title?',
    type: 'text' as const,
    placeholder: 'e.g., Marketing Manager, Software Engineer',
  },
  {
    key: 'industry',
    label: 'What industry do you work in?',
    type: 'select' as const,
    options: INDUSTRIES,
  },
  {
    key: 'experience',
    label: 'How many years of experience do you have?',
    type: 'select' as const,
    options: EXPERIENCE_LEVELS,
  },
  {
    key: 'responsibilities',
    label: 'Describe your top 3 responsibilities',
    type: 'textarea' as const,
    placeholder:
      'e.g., 1. Managing a team of 5 designers\n2. Creating marketing strategies\n3. Analyzing campaign performance',
  },
  {
    key: 'tools',
    label: 'What tools/software do you use daily?',
    type: 'textarea' as const,
    placeholder:
      'e.g., Excel, Salesforce, Figma, Python, Google Analytics, Slack',
  },
];

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'technical':
      return 'Technical';
    case 'soft':
      return 'Soft Skills';
    case 'industry':
      return 'Industry';
    case 'transferable':
      return 'Transferable';
    default:
      return category;
  }
}

function getCategoryBadgeVariant(category: string) {
  switch (category) {
    case 'technical':
      return 'default' as const;
    case 'soft':
      return 'sunrise' as const;
    case 'industry':
      return 'warning' as const;
    case 'transferable':
      return 'success' as const;
    default:
      return 'secondary' as const;
  }
}

function getProficiencyBadgeVariant(proficiency: string) {
  switch (proficiency) {
    case 'expert':
      return 'success' as const;
    case 'advanced':
      return 'default' as const;
    case 'intermediate':
      return 'warning' as const;
    case 'beginner':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export function AssessmentWizard({
  latestAssessment,
  onboardingStep,
}: AssessmentWizardProps) {
  const router = useRouter();

  // Determine initial step from latestAssessment
  const hasCompletedAssessment =
    latestAssessment?.status === 'completed' &&
    latestAssessment.result_data &&
    typeof latestAssessment.result_data === 'object' &&
    'skills' in latestAssessment.result_data;

  const [step, setStep] = useState<number>(hasCompletedAssessment ? 4 : 1);
  const [method, setMethod] = useState<AssessmentMethod>(null);
  const [resumeText, setResumeText] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExtractedSkill[]>(
    hasCompletedAssessment
      ? ((latestAssessment.result_data as { skills: ExtractedSkill[] }).skills ?? [])
      : []
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const handleMethodSelect = useCallback((selectedMethod: AssessmentMethod) => {
    setMethod(selectedMethod);
    setStep(2);
    setError(null);
  }, []);

  const handleResumeSubmit = useCallback(async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text or upload a file.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStep(3);

    try {
      const assessment = await startAssessment('resume_parse', {
        resumeText,
      });
      const result = await processResumeAssessment(
        assessment.id,
        resumeText
      );

      setResults(result.skills);
      await completeOnboarding();
      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process resume'
      );
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  }, [resumeText]);

  const handleQuestionnaireSubmit = useCallback(async () => {
    // Validate all questions answered
    const unanswered = QUESTIONS.filter(
      (q) => !answers[q.key]?.trim()
    );
    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. Missing: ${unanswered.map((q) => q.label).join(', ')}`
      );
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStep(3);

    try {
      // Format answers with question labels as keys
      const formattedAnswers: Record<string, string> = {};
      for (const q of QUESTIONS) {
        formattedAnswers[q.label] = answers[q.key];
      }

      const assessment = await startAssessment(
        'questionnaire',
        formattedAnswers
      );
      const result = await processQuestionnaireAssessment(
        assessment.id,
        formattedAnswers
      );

      setResults(result.skills);
      await completeOnboarding();
      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process questionnaire'
      );
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  }, [answers]);

  const handleFileRead = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        setError(
          'Please upload a plain text (.txt) file. For PDF or Word documents, copy and paste the text instead.'
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setResumeText(text);
          setError(null);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try pasting the text instead.');
      };
      reader.readAsText(file);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        setError(
          'Please upload a plain text (.txt) file. For PDF or Word documents, copy and paste the text instead.'
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setResumeText(text);
          setError(null);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try pasting the text instead.');
      };
      reader.readAsText(file);
    },
    []
  );

  const handleAnswerChange = useCallback(
    (key: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    []
  );

  // Group results by category for display
  const groupedResults = results.reduce<Record<string, ExtractedSkill[]>>(
    (groups, skill) => {
      const category = skill.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
      return groups;
    },
    {}
  );

  // Step indicators
  const stepLabels = ['Method', 'Input', 'Analysis', 'Results'];

  return (
    <div>
      <PageHeader
        title="Skills Assessment"
        description="Discover your transferable skills for career transition"
      />

      {/* Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {stepLabels.map((label, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isCompleted
                        ? 'bg-brand-600 text-white'
                        : isActive
                          ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-600'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`hidden text-sm font-medium sm:inline ${
                      isActive
                        ? 'text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < stepLabels.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Choose Method */}
      {step === 1 && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
              How would you like to identify your skills?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Choose the method that works best for you. Both options use AI to
              analyze your experience and extract transferable skills.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Resume Upload Option */}
            <button
              onClick={() => handleMethodSelect('resume')}
              className="group text-left"
            >
              <Card className="h-full cursor-pointer transition-all duration-normal hover:shadow-card-hover hover:border-brand-300">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-[var(--card-foreground)]">
                    Upload Resume
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Paste your resume text and our AI will extract your skills,
                    experience, and expertise automatically.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600">
                    <span>Get started</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </button>

            {/* Questionnaire Option */}
            <button
              onClick={() => handleMethodSelect('questionnaire')}
              className="group text-left"
            >
              <Card className="h-full cursor-pointer transition-all duration-normal hover:shadow-card-hover hover:border-brand-300">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sunrise-50 text-sunrise-600 transition-colors group-hover:bg-sunrise-100">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-[var(--card-foreground)]">
                    Answer Questions
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Answer 5 quick questions about your experience and our AI
                    will identify your key transferable skills.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-sunrise-600">
                    <span>Get started</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>
      )}

      {/* Step 2a: Resume Upload */}
      {step === 2 && method === 'resume' && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
              Paste Your Resume
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Paste the text content of your resume below, or upload a plain
              text file. Our AI will analyze it to identify your skills.
            </p>
          </div>

          {/* Drag & drop upload area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mb-4 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver
                ? 'border-brand-400 bg-brand-50'
                : 'border-[var(--border)] hover:border-brand-300 hover:bg-[var(--accent)]'
            }`}
          >
            <Upload className="h-8 w-8 text-[var(--muted-foreground)]" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Drag & drop your resume file here
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Supports .txt files only
              </p>
            </div>
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Browse files
              </span>
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileRead}
                className="hidden"
              />
            </label>
          </div>

          {/* Textarea for paste */}
          <div className="mb-6">
            <label
              htmlFor="resume-text"
              className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
            >
              Or paste your resume text
            </label>
            <textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setError(null);
              }}
              placeholder="Paste the full text of your resume here..."
              rows={12}
              className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
            {resumeText && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {resumeText.length.toLocaleString()} characters
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleResumeSubmit}
              disabled={!resumeText.trim()}
            >
              Analyze Resume
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2b: Questionnaire */}
      {step === 2 && method === 'questionnaire' && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
              Tell Us About Your Experience
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Answer these 5 questions to help our AI identify your skills.
              Question {questionIndex + 1} of {QUESTIONS.length}.
            </p>
          </div>

          {/* Progress bar for questions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Progress
              </span>
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {questionIndex + 1}/{QUESTIONS.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
                style={{
                  width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current question */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {(() => {
                const question = QUESTIONS[questionIndex];
                return (
                  <div key={question.key}>
                    <label className="mb-3 block text-base font-medium text-[var(--foreground)]">
                      {question.label}
                    </label>

                    {question.type === 'text' && (
                      <Input
                        value={answers[question.key] || ''}
                        onChange={(e) =>
                          handleAnswerChange(question.key, e.target.value)
                        }
                        placeholder={question.placeholder}
                      />
                    )}

                    {question.type === 'select' && (
                      <select
                        value={answers[question.key] || ''}
                        onChange={(e) =>
                          handleAnswerChange(question.key, e.target.value)
                        }
                        className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select an option...</option>
                        {question.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {question.type === 'textarea' && (
                      <textarea
                        value={answers[question.key] || ''}
                        onChange={(e) =>
                          handleAnswerChange(question.key, e.target.value)
                        }
                        placeholder={question.placeholder}
                        rows={4}
                        className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      />
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (questionIndex === 0) {
                  setStep(1);
                  setError(null);
                } else {
                  setQuestionIndex((prev) => prev - 1);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              {questionIndex === 0 ? 'Back' : 'Previous'}
            </Button>

            {questionIndex < QUESTIONS.length - 1 ? (
              <Button
                onClick={() => {
                  const currentQuestion = QUESTIONS[questionIndex];
                  if (!answers[currentQuestion.key]?.trim()) {
                    setError('Please answer this question before continuing.');
                    return;
                  }
                  setError(null);
                  setQuestionIndex((prev) => prev + 1);
                }}
                disabled={!answers[QUESTIONS[questionIndex].key]?.trim()}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleQuestionnaireSubmit}
                disabled={!answers[QUESTIONS[questionIndex].key]?.trim()}
              >
                Analyze My Skills
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick navigation dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {QUESTIONS.map((q, i) => (
              <button
                key={q.key}
                onClick={() => {
                  setQuestionIndex(i);
                  setError(null);
                }}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === questionIndex
                    ? 'bg-brand-600'
                    : answers[q.key]?.trim()
                      ? 'bg-brand-300'
                      : 'bg-[var(--muted)]'
                }`}
                aria-label={`Go to question ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
                <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-sunrise-100">
                <Sparkles className="h-4 w-4 text-sunrise-600" />
              </div>
            </div>
          </div>

          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            Analyzing your skills...
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Our AI is reviewing your experience and identifying transferable
            skills. This usually takes 10-30 seconds.
          </p>

          {/* Animated progress dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full bg-brand-400"
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
            />
            <div
              className="h-2.5 w-2.5 rounded-full bg-brand-400"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: '0.3s',
              }}
            />
            <div
              className="h-2.5 w-2.5 rounded-full bg-brand-400"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: '0.6s',
              }}
            />
          </div>

          <style jsx>{`
            @keyframes pulse {
              0%,
              100% {
                opacity: 0.3;
                transform: scale(0.8);
              }
              50% {
                opacity: 1;
                transform: scale(1.2);
              }
            }
          `}</style>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
              Assessment Complete!
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              We identified {results.length} skill
              {results.length !== 1 ? 's' : ''} from your experience. Here is a
              breakdown by category.
            </p>
          </div>

          {/* Results grouped by category */}
          {Object.keys(groupedResults).length > 0 ? (
            <div className="space-y-6 mb-8">
              {Object.entries(groupedResults)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, skills]) => (
                  <Card key={category}>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-heading text-base font-semibold text-[var(--card-foreground)]">
                          {getCategoryLabel(category)}
                        </h3>
                        <Badge
                          variant={getCategoryBadgeVariant(category)}
                          size="sm"
                        >
                          {skills.length} skill
                          {skills.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <div
                            key={`${skill.name}-${idx}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-[var(--foreground)]">
                              {skill.name}
                            </span>
                            <Badge
                              variant={getProficiencyBadgeVariant(
                                skill.proficiency
                              )}
                              size="sm"
                            >
                              {skill.proficiency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  No skills were extracted. Try running the assessment again
                  with more detailed information.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => router.push('/skills')}
              size="lg"
            >
              View Full Skills Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/careers')}
              size="lg"
            >
              Explore Careers
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Retake assessment link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setStep(1);
                setMethod(null);
                setResumeText('');
                setQuestionIndex(0);
                setAnswers({});
                setResults([]);
                setError(null);
              }}
              className="text-sm text-[var(--muted-foreground)] underline hover:text-[var(--foreground)] transition-colors"
            >
              Retake assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
