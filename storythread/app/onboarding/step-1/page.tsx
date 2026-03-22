'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Feather, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'writer' | 'collaborator' | 'reader';

const roles: { id: Role; icon: React.ElementType; title: string; description: string }[] = [
  {
    id: 'writer',
    icon: Feather,
    title: 'Solo Writer',
    description: 'I write my own stories and want AI assistance to craft better narratives.',
  },
  {
    id: 'collaborator',
    icon: Users,
    title: 'Collaborator',
    description: 'I co-author stories with other writers and love creative teamwork.',
  },
  {
    id: 'reader',
    icon: BookOpen,
    title: 'Reader',
    description: 'I love discovering and reading fiction written by talented authors.',
  },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  function handleContinue() {
    if (!selectedRole) return;
    // Store selection in sessionStorage to persist across steps
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(sessionStorage.getItem('onboarding') || '{}');
      sessionStorage.setItem('onboarding', JSON.stringify({ ...existing, role: selectedRole }));
    }
    router.push('/onboarding/step-2');
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Step 1 of 3</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--foreground)]">
          Welcome! How will you use StoryThread?
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Pick the role that best describes you. You can always change this later in settings.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
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
              <div>
                <p className="font-semibold text-[var(--foreground)]">{role.title}</p>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{role.description}</p>
              </div>
              {isSelected && (
                <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleContinue} disabled={!selectedRole} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
