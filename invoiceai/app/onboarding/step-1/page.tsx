'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const FREELANCER_TYPES = [
  { id: 'developer', label: 'Developer', description: 'Software development, web apps, APIs' },
  { id: 'designer', label: 'Designer', description: 'UI/UX, graphic design, branding' },
  { id: 'consultant', label: 'Consultant', description: 'Business, strategy, management consulting' },
  { id: 'writer', label: 'Writer / Editor', description: 'Copywriting, content, technical writing' },
  { id: 'other', label: 'Other', description: 'Marketing, video, photography, and more' },
];

export default function OnboardingStep1Page() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  function handleContinue() {
    if (!selected) return;
    sessionStorage.setItem('onboarding_freelancer_type', selected);
    router.push('/onboarding/step-2');
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1 bg-[var(--muted)]">
        <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: '33%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
          Step 1 of 3
        </p>
        <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)] mb-1">
          What type of freelancer are you?
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          This helps us tailor your InvoiceAI experience.
        </p>
        <div className="space-y-3">
          {FREELANCER_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                selected === t.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-[var(--border)] hover:border-brand-300'
              }`}
            >
              <div className="font-semibold text-[var(--card-foreground)]">{t.label}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
