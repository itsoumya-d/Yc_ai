'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const genres = [
  { id: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { id: 'sci-fi', label: 'Science Fiction', emoji: '🚀' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'mystery', label: 'Mystery', emoji: '🔍' },
  { id: 'thriller', label: 'Thriller', emoji: '⚡' },
  { id: 'horror', label: 'Horror', emoji: '👻' },
  { id: 'historical', label: 'Historical Fiction', emoji: '📜' },
  { id: 'literary', label: 'Literary Fiction', emoji: '📚' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { id: 'young-adult', label: 'Young Adult', emoji: '✨' },
  { id: 'crime', label: 'Crime', emoji: '🔫' },
  { id: 'humor', label: 'Humor & Satire', emoji: '😄' },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleGenre(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleContinue() {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(sessionStorage.getItem('onboarding') || '{}');
      sessionStorage.setItem(
        'onboarding',
        JSON.stringify({ ...existing, genres: Array.from(selected) })
      );
    }
    router.push('/onboarding/step-3');
  }

  function handleSkip() {
    router.push('/onboarding/step-3');
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Step 2 of 3</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--foreground)]">
          What genres excite you?
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Select all that apply — we&apos;ll personalize your discovery feed and AI suggestions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {genres.map((genre) => {
          const isSelected = selected.has(genre.id);
          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                isSelected
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-brand-300 hover:bg-[var(--accent)]'
              )}
            >
              <span className="text-xl">{genre.emoji}</span>
              <span>{genre.label}</span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          {selected.size} genre{selected.size !== 1 ? 's' : ''} selected
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
        >
          Skip for now
        </button>
        <Button onClick={handleContinue} disabled={selected.size === 0} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
