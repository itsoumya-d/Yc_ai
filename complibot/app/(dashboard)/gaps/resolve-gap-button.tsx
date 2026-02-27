'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { resolveGap } from '@/lib/actions/gaps';
import { useRouter } from 'next/navigation';

interface ResolveGapButtonProps {
  gapId: string;
}

export function ResolveGapButton({ gapId }: ResolveGapButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resolved, setResolved] = useState(false);

  function handleResolve() {
    startTransition(async () => {
      const { error } = await resolveGap(gapId);
      if (!error) {
        setResolved(true);
        router.refresh();
      }
    });
  }

  if (resolved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircle2 className="w-4 h-4" />
        Resolved
      </span>
    );
  }

  return (
    <button
      onClick={handleResolve}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      {isPending ? 'Resolving...' : 'Mark Resolved'}
    </button>
  );
}
