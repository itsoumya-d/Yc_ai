'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FilePlus, Upload, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingCompletePage() {
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

  const nextSteps = [
    { icon: FilePlus, label: 'Submit your first claim', href: '/claims/new', description: 'Step-by-step guided claim submission' },
    { icon: Upload, label: 'Upload documents for OCR', href: '/documents', description: 'AI-powered data extraction from documents' },
    { icon: BarChart3, label: 'View analytics dashboard', href: '/dashboard', description: 'Track claim status and approval rates' },
  ];

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="bg-primary px-8 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="legal-heading text-xl text-white mb-1">You're all set!</h1>
        <p className="text-sm text-white/70">ClaimForge is ready for your insurance workflows.</p>
      </div>

      <div className="p-8">
        <h2 className="legal-heading text-base text-text-primary mb-4">Get started</h2>
        <div className="space-y-3 mb-8">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="flex items-center gap-4 rounded-xl border border-border-default p-4 transition-all hover:border-border-emphasis hover:bg-bg-surface-raised"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
                <step.icon className="h-4 w-4 text-primary-light" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{step.label}</div>
                <div className="text-xs text-text-secondary">{step.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-tertiary" />
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-text-on-color transition-colors hover:bg-primary-hover"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
