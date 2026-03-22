import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const steps = [
    { label: 'Your Role', href: '/onboarding/step-1' },
    { label: 'Organisation', href: '/onboarding/step-2' },
    { label: 'First Meeting', href: '/onboarding/step-3' },
    { label: 'Preferences', href: '/onboarding/step-4' },
    { label: 'AI Setup', href: '/onboarding/step-5' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-8 w-8 text-gold-500" />
        <span className="text-2xl font-bold tracking-tight text-white">BoardBrief</span>
      </div>
      <div className="mb-6 flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.href} className="flex items-center gap-2">
            <span className="text-xs text-navy-400 font-medium">{step.label}</span>
            {i < steps.length - 1 && (
              <span className="text-navy-600 text-xs">›</span>
            )}
          </div>
        ))}
      </div>
      <div className="w-full max-w-xl">{children}</div>
      <p className="mt-6 text-xs text-navy-500">
        Already have an account?{' '}
        <Link href="/login" className="text-gold-500 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
