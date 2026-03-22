'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FileText, Users, BarChart3 } from 'lucide-react';
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
    { icon: FileText, label: 'Create your first invoice', href: '/invoices/new', description: 'AI-powered invoice generation in seconds' },
    { icon: Users, label: 'Manage clients', href: '/clients', description: 'View and manage your client roster' },
    { icon: BarChart3, label: 'View reports', href: '/reports', description: 'Track revenue, outstanding payments, and trends' },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[var(--shadow-card)] text-center">
      <div className="bg-brand-600 px-8 py-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-4">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white mb-2">You're all set!</h1>
        <p className="text-brand-100 text-sm">InvoiceAI is ready to help you get paid faster.</p>
      </div>

      <div className="p-8">
        <h2 className="font-heading text-lg font-semibold text-[var(--card-foreground)] mb-4">
          Suggested next steps
        </h2>
        <div className="space-y-3 mb-8">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4 text-left transition-all hover:border-brand-300 hover:bg-brand-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <step.icon className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-[var(--card-foreground)] text-sm">{step.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{step.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
