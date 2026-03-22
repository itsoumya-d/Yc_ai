'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plug, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const PROVIDERS = [
  { id: 'state_farm', label: 'State Farm' },
  { id: 'allstate', label: 'Allstate' },
  { id: 'geico', label: 'GEICO' },
  { id: 'progressive', label: 'Progressive' },
  { id: 'liberty_mutual', label: 'Liberty Mutual' },
  { id: 'usaa', label: 'USAA' },
  { id: 'other', label: 'Other / Multiple' },
];

export default function OnboardingStep3Page() {
  const router = useRouter();
  const [provider, setProvider] = useState('');
  const [skipProvider, setSkipProvider] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userType = sessionStorage.getItem('onboarding_user_type') ?? '';
        await supabase.from('profiles').upsert({
          id: user.id,
          user_type: userType,
          onboarding_completed_at: new Date().toISOString(),
        });
      }
    } catch {
      // continue even if update fails
    }
    router.push('/onboarding/step-4');
  }

  const canComplete = provider !== '' || skipProvider;

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="h-1 bg-bg-surface-raised">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: '100%' }} />
      </div>
      <div className="p-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-1">
          Step 3 of 3
        </p>
        <Plug className="h-7 w-7 text-primary mb-3" />
        <h1 className="legal-heading text-xl text-text-primary mb-1">Connect your provider</h1>
        <p className="text-sm text-text-secondary mb-6">
          Select your insurance provider to enable automated data import, or skip to enter manually.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setProvider(p.id); setSkipProvider(false); }}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                provider === p.id && !skipProvider
                  ? 'border-primary bg-primary-muted text-primary-light'
                  : 'border-border-default text-text-secondary hover:border-border-emphasis hover:text-text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setProvider(''); setSkipProvider(true); }}
          className={`w-full rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-all ${
            skipProvider
              ? 'border-primary bg-primary-muted text-primary-light'
              : 'border-border-default text-text-tertiary hover:border-border-emphasis hover:text-text-secondary'
          }`}
        >
          Skip — I'll set this up later
        </button>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/onboarding/step-2')}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-surface-raised transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleComplete}
            disabled={loading || !canComplete}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
            <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
