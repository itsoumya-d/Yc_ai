'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingStep3() {
  const router = useRouter();
  const [petName, setPetName] = useState('Your pet');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [knownConditions, setKnownConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem('onboarding_pet_name');
    if (name) setPetName(name);
    else router.push('/onboarding/step-1');
  }, [router]);

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Build pet data from session storage
      const petData = {
        user_id: user.id,
        name: sessionStorage.getItem('onboarding_pet_name') || 'My Pet',
        species: sessionStorage.getItem('onboarding_species') || 'other',
        breed: sessionStorage.getItem('onboarding_breed') || null,
        weight: sessionStorage.getItem('onboarding_weight')
          ? parseFloat(sessionStorage.getItem('onboarding_weight')!)
          : null,
        weight_unit: sessionStorage.getItem('onboarding_weight_unit') || 'lbs',
        notes: [
          knownConditions ? `Conditions: ${knownConditions}` : '',
          allergies ? `Allergies: ${allergies}` : '',
          vetName ? `Primary Vet: ${vetName}` : '',
          clinicName ? `Clinic: ${clinicName}` : '',
          vetPhone ? `Vet Phone: ${vetPhone}` : '',
        ].filter(Boolean).join('\n') || null,
      };

      const { error: insertError } = await supabase.from('pets').insert([petData]);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      // Clear session storage
      ['onboarding_pet_name', 'onboarding_species', 'onboarding_breed', 'onboarding_age', 'onboarding_weight', 'onboarding_weight_unit'].forEach(
        (key) => sessionStorage.removeItem(key)
      );

      router.push('/onboarding/step-4');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)]">
          Health history for {petName}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Help us keep track of important medical information. You can update this anytime.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleFinish} className="space-y-5">
        {/* Vet info section */}
        <div className="rounded-lg border border-[var(--border)] p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--card-foreground)]">Veterinarian Info</h2>

          <div>
            <label htmlFor="vetName" className="block text-sm font-medium text-[var(--card-foreground)]">
              Vet's Name <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <input
              id="vetName"
              type="text"
              value={vetName}
              onChange={(e) => setVetName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              placeholder="Dr. Smith"
            />
          </div>

          <div>
            <label htmlFor="clinicName" className="block text-sm font-medium text-[var(--card-foreground)]">
              Clinic Name <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <input
              id="clinicName"
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              placeholder="Happy Paws Veterinary Clinic"
            />
          </div>

          <div>
            <label htmlFor="vetPhone" className="block text-sm font-medium text-[var(--card-foreground)]">
              Vet Phone <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <input
              id="vetPhone"
              type="tel"
              value={vetPhone}
              onChange={(e) => setVetPhone(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Health history */}
        <div className="rounded-lg border border-[var(--border)] p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--card-foreground)]">Medical History</h2>

          <div>
            <label htmlFor="knownConditions" className="block text-sm font-medium text-[var(--card-foreground)]">
              Known Conditions <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <textarea
              id="knownConditions"
              value={knownConditions}
              onChange={(e) => setKnownConditions(e.target.value)}
              rows={2}
              className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-none"
              placeholder="Diabetes, arthritis, heart murmur..."
            />
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-[var(--card-foreground)]">
              Allergies <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <textarea
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              rows={2}
              className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-none"
              placeholder="Chicken, pollen, penicillin..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/onboarding/step-2')}
            className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] focus:outline-none"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Finish Setup →'}
          </button>
        </div>
      </form>
    </div>
  );
}
