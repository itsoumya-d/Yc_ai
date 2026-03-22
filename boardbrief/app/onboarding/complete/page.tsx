'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Calendar, Users, BarChart3 } from 'lucide-react';
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
    { icon: Calendar, label: 'Create your first meeting', href: '/meetings/new', description: 'Build an agenda with AI assistance' },
    { icon: Users, label: 'Add board members', href: '/board-members/new', description: 'Set up your directors directory' },
    { icon: BarChart3, label: 'View analytics', href: '/analytics', description: 'Track governance KPIs at a glance' },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-2xl overflow-hidden text-center">
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 px-8 py-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 mb-4">
          <CheckCircle2 className="h-9 w-9 text-gold-400" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white mb-2">You're all set!</h1>
        <p className="text-navy-300 text-sm">BoardBrief is ready for your governance workflows.</p>
      </div>

      <div className="p-8">
        <h2 className="font-heading text-lg font-semibold text-navy-900 mb-4">Suggested next steps</h2>
        <div className="space-y-3 mb-8">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-navy-300 hover:bg-navy-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100">
                <step.icon className="h-5 w-5 text-navy-700" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-navy-900 text-sm">{step.label}</div>
                <div className="text-xs text-navy-500">{step.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-navy-400" />
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
