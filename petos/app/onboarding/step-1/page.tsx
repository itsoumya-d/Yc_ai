'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OnboardingStep1() {
  const [petName, setPetName] = useState('');
  const router = useRouter();

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (petName.trim()) {
      sessionStorage.setItem('onboarding_pet_name', petName.trim());
      router.push('/onboarding/step-2');
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🐾</div>
        <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)]">
          Welcome to PetOS!
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Let's get your pet set up. This takes less than 2 minutes.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-6">
        <div>
          <label
            htmlFor="petName"
            className="block text-sm font-medium text-[var(--card-foreground)]"
          >
            What's your pet's name?
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
            autoFocus
            className="mt-2 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            placeholder="Buddy, Luna, Max..."
          />
        </div>

        <button
          type="submit"
          disabled={!petName.trim()}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <span className="ml-2">→</span>
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
        Already have pets?{' '}
        <Link href="/dashboard" className="font-medium text-brand-600 hover:text-brand-500">
          Go to Dashboard
        </Link>
      </p>
    </div>
  );
}
