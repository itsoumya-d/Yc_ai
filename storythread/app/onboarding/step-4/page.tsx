'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookOpen, MessageSquare, Eye, Zap } from 'lucide-react';

type POV = 'first' | 'third-limited' | 'third-omniscient' | 'second';
type Tone = 'literary' | 'conversational' | 'dark' | 'light';

const POV_OPTIONS: { id: POV; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'first', label: 'First Person', desc: '"I walked into the room..."', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'third-limited', label: 'Third Person (Limited)', desc: '"She walked into the room..."', icon: <Eye className="h-5 w-5" /> },
  { id: 'third-omniscient', label: 'Third Person (Omniscient)', desc: 'All-knowing narrator', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'second', label: 'Second Person', desc: '"You walk into the room..."', icon: <Zap className="h-5 w-5" /> },
];

const TONE_OPTIONS: { id: Tone; label: string; emoji: string }[] = [
  { id: 'literary', label: 'Literary & Lyrical', emoji: '✍️' },
  { id: 'conversational', label: 'Conversational', emoji: '💬' },
  { id: 'dark', label: 'Dark & Gritty', emoji: '🌑' },
  { id: 'light', label: 'Light & Fun', emoji: '☀️' },
];

export default function Step4Page() {
  const router = useRouter();
  const [pov, setPov] = useState<POV | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  const [chapterLength, setChapterLength] = useState<'short' | 'medium' | 'long' | null>(null);

  const canContinue = pov && tone && chapterLength;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-block rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 mb-3">
          Step 4 of 5
        </div>
        <h1 className="font-heading text-2xl font-bold">Your writing style</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Help us tailor suggestions to match how you write</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold">Preferred Point of View</h2>
          <div className="grid grid-cols-2 gap-3">
            {POV_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setPov(option.id)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all',
                  pov === option.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-[var(--border)] hover:border-brand-300'
                )}
              >
                <div className={cn('text-brand-600', pov !== option.id && 'text-[var(--muted-foreground)]')}>
                  {option.icon}
                </div>
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{option.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Writing Tone</h2>
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setTone(option.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all',
                  tone === option.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-brand-300'
                )}
              >
                <span className="text-lg">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Typical Chapter Length</h2>
          <div className="flex gap-2">
            {[
              { id: 'short' as const, label: 'Short', sub: '500–1.5k words' },
              { id: 'medium' as const, label: 'Medium', sub: '1.5k–3k words' },
              { id: 'long' as const, label: 'Long', sub: '3k+ words' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setChapterLength(opt.id)}
                className={cn(
                  'flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-all',
                  chapterLength === opt.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-[var(--border)] hover:border-brand-300'
                )}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" disabled={!canContinue} onClick={() => router.push('/onboarding/step-5')}>
          Continue
        </Button>
      </div>
    </div>
  );
}
