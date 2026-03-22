'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function OnboardingStep3Page() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      // Save business info via API if we have it in sessionStorage
      const businessName = sessionStorage.getItem('onboarding_business_name') ?? '';
      const currency = sessionStorage.getItem('onboarding_currency') ?? 'USD';
      if (businessName) {
        await fetch('/api/settings/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name: businessName,
            onboarding_completed: true,
          }),
        });
      }

      // Create first client if provided
      if (clientName.trim() && clientEmail.trim()) {
        const { createClientAction } = await import('@/lib/actions/clients');
        await createClientAction({
          name: clientName.trim(),
          email: clientEmail.trim(),
          company: clientCompany.trim() || undefined,
        });
      }
    } catch {
      // continue even if fails
    }
    router.push('/onboarding/step-4');
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1 bg-[var(--muted)]">
        <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: '100%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
          Step 3 of 3
        </p>
        <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)] mb-1">
          Add your first client
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Add a client so you can start sending invoices right away. You can skip this and add clients later.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                Company
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/onboarding/step-2')}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
            >
              {loading ? 'Setting up...' : 'Finish Setup'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
