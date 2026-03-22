'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { path: '/onboarding/step-1', label: 'Welcome' },
  { path: '/onboarding/step-2', label: 'Pet Details' },
  { path: '/onboarding/step-3', label: 'Health & Vet' },
  { path: '/onboarding/step-4', label: 'Reminders' },
  { path: '/onboarding/step-5', label: 'Done!' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);
  const progress = currentIndex === -1 ? 100 : ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--muted)] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, i) => (
            <div key={step.path} className="flex flex-col items-center flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < currentIndex
                    ? 'bg-brand-600 text-white'
                    : i === currentIndex
                    ? 'bg-brand-600 text-white ring-2 ring-brand-300'
                    : 'bg-[var(--border)] text-[var(--muted-foreground)]'
                }`}
              >
                {i < currentIndex ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="mt-1 text-xs text-[var(--muted-foreground)] hidden sm:block">
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`absolute h-0.5 transition-colors ${
                    i < currentIndex ? 'bg-brand-600' : 'bg-[var(--border)]'
                  }`}
                  style={{ width: 'calc(100% / 4 - 2rem)', left: `calc(${(i + 0.5) / STEPS.length} * 100%)` }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--border)]">
          <div
            className="h-1.5 rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content Card */}
      <div className="w-full max-w-lg">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          {children}
        </div>
      </div>

      {/* Branding */}
      <div className="mt-8 flex items-center gap-2 text-[var(--muted-foreground)]">
        <span className="text-xl">🐾</span>
        <span className="text-sm font-medium">PetOS</span>
      </div>
    </div>
  );
}
