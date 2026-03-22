import Link from 'next/link';
import { Shield } from 'lucide-react';

const STEPS = [
  { label: 'User Type', href: '/onboarding/step-1' },
  { label: 'Insurance Focus', href: '/onboarding/step-2' },
  { label: 'Provider', href: '/onboarding/step-3' },
  { label: 'Notifications', href: '/onboarding/step-4' },
  { label: 'Team Setup', href: '/onboarding/step-5' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-root p-4">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="legal-heading text-xl text-text-primary">ClaimForge</span>
        </div>
      </div>
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.href} className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary font-medium">{step.label}</span>
            {i < STEPS.length - 1 && (
              <span className="text-text-tertiary text-xs">›</span>
            )}
          </div>
        ))}
      </div>
      <div className="w-full max-w-lg">{children}</div>
      <p className="mt-6 text-center text-xs text-text-tertiary">
        Already have an account?{' '}
        <Link href="/login" className="text-text-link hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
