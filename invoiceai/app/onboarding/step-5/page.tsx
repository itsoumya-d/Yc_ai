'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

const PRIMARY = '#6366F1';

export default function OnboardingStep5Page() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnectStripe = async () => {
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    setConnected(true);
    setConnecting(false);
    setTimeout(() => router.push('/onboarding/complete'), 1000);
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
      <div className="mb-6">
        <div className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 mb-3">
          Step 5 of 5 — Almost there!
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Accept online payments</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Connect Stripe to let clients pay invoices instantly</p>
      </div>

      {connected ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Stripe connected!</p>
          <p className="text-xs text-[var(--muted-foreground)]">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Stripe Payments</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Accept credit cards, bank transfers, and more. Clients can pay directly from their invoice link.
                  2.9% + 30¢ per transaction.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {['Instant payment notifications', 'Auto-mark invoices as paid', 'Support for 135+ currencies', 'Recurring billing support'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button onClick={handleConnectStripe} disabled={connecting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#635BFF' }}>
              {connecting ? 'Connecting...' : (
                <>
                  <CreditCard size={16} /> Connect Stripe
                </>
              )}
            </button>
            <button onClick={() => router.push('/onboarding/complete')}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
              Skip for now <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      <div className="mt-4">
        <button onClick={() => router.push('/onboarding/step-4')}
          className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <ChevronLeft size={14} /> Back
        </button>
      </div>
    </div>
  );
}
