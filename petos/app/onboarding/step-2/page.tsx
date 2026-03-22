'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog', emoji: '🐕' },
  { value: 'cat', label: 'Cat', emoji: '🐈' },
  { value: 'bird', label: 'Bird', emoji: '🦜' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐇' },
  { value: 'fish', label: 'Fish', emoji: '🐠' },
  { value: 'reptile', label: 'Reptile', emoji: '🦎' },
  { value: 'other', label: 'Other', emoji: '🐾' },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [petName, setPetName] = useState('Your pet');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  useEffect(() => {
    const name = sessionStorage.getItem('onboarding_pet_name');
    if (name) setPetName(name);
    else router.push('/onboarding/step-1');
  }, [router]);

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem('onboarding_species', species);
    sessionStorage.setItem('onboarding_breed', breed);
    sessionStorage.setItem('onboarding_age', age);
    sessionStorage.setItem('onboarding_weight', weight);
    sessionStorage.setItem('onboarding_weight_unit', weightUnit);
    router.push('/onboarding/step-3');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)]">
          Tell us about {petName}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          These details help us personalize your health tracking experience.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        {/* Species */}
        <div>
          <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
            Species <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSpecies(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-colors ${
                  species === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Breed */}
        <div>
          <label
            htmlFor="breed"
            className="block text-sm font-medium text-[var(--card-foreground)]"
          >
            Breed <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
          </label>
          <input
            id="breed"
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            placeholder="Golden Retriever, Siamese, ..."
          />
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-[var(--card-foreground)]"
          >
            Age <span className="text-[var(--muted-foreground)] font-normal">(years, optional)</span>
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="0"
            max="50"
            step="0.5"
            className="mt-1.5 block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            placeholder="e.g. 3"
          />
        </div>

        {/* Weight */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-[var(--card-foreground)]"
          >
            Weight <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.1"
              className="flex-1 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              placeholder="e.g. 25"
            />
            <div className="flex rounded-lg border border-[var(--input)] overflow-hidden">
              {(['lbs', 'kg'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setWeightUnit(unit)}
                  className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                    weightUnit === unit
                      ? 'bg-brand-600 text-white'
                      : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/onboarding/step-1')}
            className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] focus:outline-none"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!species}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
