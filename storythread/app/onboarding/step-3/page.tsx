'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Target, Flame, Leaf } from 'lucide-react';

type GoalId = 'serious' | 'casual' | 'explorer';

const goals: { id: GoalId; icon: React.ElementType; title: string; description: string; badge: string }[] = [
  {
    id: 'serious',
    icon: Flame,
    title: 'Serious Writer',
    description: 'I aim to finish and publish my work. I write regularly and want to track my progress.',
    badge: 'Dedicated',
  },
  {
    id: 'casual',
    icon: Leaf,
    title: 'Casual Writer',
    description: 'I write when inspiration strikes. Creativity is a hobby I want to enjoy stress-free.',
    badge: 'Relaxed',
  },
  {
    id: 'explorer',
    icon: Target,
    title: 'Story Explorer',
    description: 'I love reading and discovering new stories. I might write occasionally too.',
    badge: 'Reader',
  },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalId | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (!selectedGoal) return;
    setLoading(true);

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(sessionStorage.getItem('onboarding') || '{}');
      sessionStorage.setItem('onboarding', JSON.stringify({ ...existing, goal: selectedGoal }));
    }

    router.push('/onboarding/step-4');
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Step 3 of 3</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--foreground)]">
          What are your writing goals?
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          We&apos;ll tailor StoryThread to match your pace and ambition.
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={cn(
                'flex w-full items-start gap-4 rounded-xl border-2 p-5 text-left transition-all',
                isSelected
                  ? 'border-brand-600 bg-brand-50 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300 hover:bg-[var(--accent)]'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  isSelected ? 'bg-brand-600 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[var(--foreground)]">{goal.title}</p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      isSelected
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    )}
                  >
                    {goal.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{goal.description}</p>
              </div>
              {isSelected && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path
                      d="M10 3L5 8.5 2 5.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleFinish} disabled={!selectedGoal || loading} className="px-8">
          {loading ? 'Saving...' : 'Finish Setup'}
        </Button>
      </div>
    </div>
  );
}
