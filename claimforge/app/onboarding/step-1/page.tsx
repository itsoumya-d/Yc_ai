'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronRight } from 'lucide-react';

const USER_TYPES = [
  { id: 'personal', label: 'Personal', description: 'Filing a claim for personal loss, injury, or property damage' },
  { id: 'business', label: 'Business', description: 'Managing commercial insurance claims for your company' },
  { id: 'adjuster', label: 'Claims Adjuster', description: 'Processing and evaluating claims on behalf of an insurer' },
];

export default function OnboardingStep1Page() {
  const router = useRouter();
  const [userType, setUserType] = useState('');

  function handleContinue() {
    if (!userType) return;
    sessionStorage.setItem('onboarding_user_type', userType);
    router.push('/onboarding/step-2');
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="h-1 bg-bg-surface-raised">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: '33%' }} />
      </div>
      <div className="p-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-1">
          Step 1 of 3
        </p>
        <User className="h-7 w-7 text-primary mb-3" />
        <h1 className="legal-heading text-xl text-text-primary mb-1">Who are you?</h1>
        <p className="text-sm text-text-secondary mb-6">This helps us tailor ClaimForge to your needs.</p>
        <div className="space-y-3">
          {USER_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setUserType(t.id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                userType === t.id
                  ? 'border-primary bg-primary-muted'
                  : 'border-border-default hover:border-border-emphasis'
              }`}
            >
              <div className="text-sm font-semibold text-text-primary">{t.label}</div>
              <div className="text-xs text-text-secondary mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!userType}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
