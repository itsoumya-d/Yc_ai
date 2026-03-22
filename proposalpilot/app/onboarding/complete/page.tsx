'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, LayoutTemplate, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const nextSteps = [
  { icon: FileText, label: 'Create your first proposal', href: '/proposals/new', description: 'Start building a winning proposal with AI assistance.' },
  { icon: LayoutTemplate, label: 'Browse templates', href: '/templates', description: 'Explore industry-specific proposal templates.' },
  { icon: BarChart3, label: 'View your dashboard', href: '/dashboard', description: 'See your pipeline and proposal analytics.' },
];

export default function OnboardingComplete() {
  useEffect(() => {
    const markOnboardingComplete = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      }
    };
    markOnboardingComplete();
  }, []);

  return (
    <Card className="mt-4 text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <CardTitle className="text-2xl">You are all set!</CardTitle>
        <CardDescription className="text-base mt-1">
          ProposalPilot is ready to help you win more deals. Here is what you can do next:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.href}
              href={step.href}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4 text-left transition-all hover:border-brand-300 hover:bg-[var(--accent)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{step.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{step.description}</p>
              </div>
            </Link>
          );
        })}
        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
