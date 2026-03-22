import { Feather } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { number: 1, label: 'Your Role' },
  { number: 2, label: 'Genres' },
  { number: 3, label: 'Goals' },
  { number: 4, label: 'Style' },
  { number: 5, label: 'Complete' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-brand-600">
            <Feather className="h-5 w-5" />
            StoryThread
          </Link>
          <span className="text-sm text-[var(--muted-foreground)]">Setup your account</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                      'bg-[var(--muted)] text-[var(--muted-foreground)]',
                    ].join(' ')}
                    aria-label={`Step ${step.number}: ${step.label}`}
                  >
                    {step.number}
                  </div>
                  <span className="mt-1 hidden text-xs text-[var(--muted-foreground)] sm:block">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1 bg-[var(--border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
