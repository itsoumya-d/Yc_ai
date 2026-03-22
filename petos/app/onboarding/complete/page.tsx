'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingComplete() {
  const router = useRouter();
  const [petName, setPetName] = useState('Your pet');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const name = sessionStorage.getItem('onboarding_pet_name');
    if (name) setPetName(name);
    const markOnboardingComplete = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      }
    };
    markOnboardingComplete();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🎉</div>

      <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)]">
        {petName} is all set!
      </h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        Your dashboard is ready. You can now track health records, medications,
        appointments, and more.
      </p>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-6 text-left space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          What's next
        </p>
        {[
          { emoji: '💊', label: 'Add medications', href: '/dashboard' },
          { emoji: '📅', label: 'Schedule a vet appointment', href: '/appointments' },
          { emoji: '💉', label: 'Log vaccinations', href: '/health' },
          { emoji: '🤖', label: 'Try the AI symptom checker', href: '/symptom-check' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 text-sm text-[var(--foreground)] hover:text-brand-600 transition-colors"
          >
            <span className="text-xl">{item.emoji}</span>
            {item.label}
            <svg className="ml-auto h-4 w-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white text-center transition-colors hover:bg-brand-700"
        >
          Go to Dashboard
        </Link>
        <p className="text-xs text-[var(--muted-foreground)]">
          Redirecting automatically in {countdown}s...
        </p>
      </div>
    </div>
  );
}
