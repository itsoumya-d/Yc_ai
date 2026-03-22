import Link from 'next/link';
import { Send } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const steps = [
    { label: 'Your Role', href: '/onboarding/step-1' },
    { label: 'Company Info', href: '/onboarding/step-2' },
    { label: 'First Proposal', href: '/onboarding/step-3' },
    { label: 'Branding', href: '/onboarding/step-4' },
    { label: 'Integrations', href: '/onboarding/step-5' },
  ];

  return (
    <div className="min-h-screen bg-[var(--muted)] flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-brand-600">
            <Send className="w-5 h-5" />
            ProposalPilot
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 pt-8">
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-1.5 rounded-full bg-[var(--border)] flex-1 overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="w-2 h-2 rounded-full bg-[var(--border)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
