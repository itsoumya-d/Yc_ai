'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PenLine, X, Check } from 'lucide-react';
import { recordWritingSession } from '@/lib/actions/writing-goals';

interface LogSessionProps {
  onClose?: () => void;
}

export function LogSession({ onClose }: LogSessionProps) {
  const [wordsWritten, setWordsWritten] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const words = parseInt(wordsWritten, 10);
    const minutes = parseInt(durationMinutes, 10);
    if (isNaN(words) || words < 1 || isNaN(minutes) || minutes < 1) return;

    startTransition(async () => {
      const result = await recordWritingSession({
        wordsWritten: words,
        durationMinutes: minutes,
      });
      if (!result.error) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setWordsWritten('');
          setDurationMinutes('');
          onClose?.();
        }, 1500);
      }
    });
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="flex items-center justify-center gap-2 py-6">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700">Session logged!</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <PenLine className="h-4 w-4 text-[var(--primary)]" />
            Log Writing Session
          </CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
              Words written
            </label>
            <Input
              type="number"
              value={wordsWritten}
              onChange={(e) => setWordsWritten(e.target.value)}
              placeholder="e.g. 500"
              min={1}
              required
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
              Duration (min)
            </label>
            <Input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="e.g. 30"
              min={1}
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="shrink-0">
            {isPending ? 'Saving...' : 'Log Session'}
          </Button>
        </form>
        <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
          Logging sessions updates your streak, goals, and achievements.
        </p>
      </CardContent>
    </Card>
  );
}
