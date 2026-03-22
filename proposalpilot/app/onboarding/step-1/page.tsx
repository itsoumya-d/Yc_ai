'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Briefcase, BarChart3, User, Building2 } from 'lucide-react';

const roles = [
  { id: 'salesperson', label: 'Salesperson', description: 'I close deals and manage client relationships.', icon: Briefcase },
  { id: 'sales_manager', label: 'Sales Manager', description: 'I lead a sales team and track pipeline metrics.', icon: BarChart3 },
  { id: 'freelancer', label: 'Freelancer', description: 'I work independently and win my own clients.', icon: User },
  { id: 'agency', label: 'Agency', description: 'We are a team that sends proposals to multiple clients.', icon: Building2 },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function handleContinue() {
    if (!selected) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_role', selected);
    }
    router.push('/onboarding/step-2');
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Step 1 of 3</div>
        <CardTitle className="text-2xl">What best describes your role?</CardTitle>
        <CardDescription>We will personalize your experience based on how you work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={cn(
                'w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150',
                isSelected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300 hover:bg-[var(--accent)]'
              )}
            >
              <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', isSelected ? 'bg-brand-600 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn('font-semibold text-sm', isSelected ? 'text-brand-700' : 'text-[var(--foreground)]')}>{role.label}</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{role.description}</p>
              </div>
            </button>
          );
        })}
        <div className="pt-2">
          <Button className="w-full" disabled={!selected} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
