'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch, ChevronLeft, ChevronRight } from 'lucide-react';

const INSURANCE_TYPES = [
  { id: 'auto', label: 'Auto', emoji: '🚗' },
  { id: 'property', label: 'Property', emoji: '🏠' },
  { id: 'health', label: 'Health', emoji: '❤️' },
  { id: 'liability', label: 'Liability', emoji: '⚖️' },
  { id: 'commercial', label: 'Commercial', emoji: '🏢' },
  { id: 'life', label: 'Life', emoji: '🛡️' },
];

export default function OnboardingStep2Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleContinue() {
    sessionStorage.setItem('onboarding_insurance_types', JSON.stringify(selected));
    router.push('/onboarding/step-3');
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="h-1 bg-bg-surface-raised">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: '66%' }} />
      </div>
      <div className="p-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-1">
          Step 2 of 3
        </p>
        <FileSearch className="h-7 w-7 text-primary mb-3" />
        <h1 className="legal-heading text-xl text-text-primary mb-1">Insurance focus</h1>
        <p className="text-sm text-text-secondary mb-6">
          Select the insurance types you work with (choose all that apply).
        </p>
        <div className="grid grid-cols-2 gap-3">
          {INSURANCE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                selected.includes(t.id)
                  ? 'border-primary bg-primary-muted'
                  : 'border-border-default hover:border-border-emphasis'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-sm font-medium text-text-primary">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/onboarding/step-1')}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-surface-raised transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
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
