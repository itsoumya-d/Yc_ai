'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Feather, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const quickLinks = [
  {
    icon: Feather,
    title: 'Create your first story',
    description: 'Start a new story from scratch.',
    href: '/stories/new',
    primary: true,
  },
  {
    icon: BookOpen,
    title: 'Explore the Dashboard',
    description: 'See your writing stats and recent activity.',
    href: '/dashboard',
    primary: false,
  },
  {
    icon: Users,
    title: 'Discover Stories',
    description: 'Read what other writers have published.',
    href: '/discover',
    primary: false,
  },
];

export default function OnboardingComplete() {
  const router = useRouter();

  useEffect(() => {
    // Clear onboarding session data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('onboarding');
    }
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
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">
        You&apos;re all set!
      </h1>
      <p className="mt-3 text-lg text-[var(--muted-foreground)]">
        Welcome to StoryThread. Your creative space is ready.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all hover:shadow-md',
                link.primary
                  ? 'border-brand-600 bg-brand-50 hover:bg-brand-100'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300 hover:bg-[var(--accent)]',
              ].join(' ')}
            >
              <div
                className={[
                  'mb-3 flex h-12 w-12 items-center justify-center rounded-xl',
                  link.primary ? 'bg-brand-600 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]',
                ].join(' ')}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-semibold text-[var(--foreground)]">{link.title}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{link.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <Button onClick={() => router.push('/dashboard')} className="px-10">
          Go to Dashboard
        </Button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        You can update your preferences anytime in{' '}
        <Link href="/settings" className="text-brand-600 hover:underline">
          Settings
        </Link>
        .
      </p>
    </div>
  );
}
