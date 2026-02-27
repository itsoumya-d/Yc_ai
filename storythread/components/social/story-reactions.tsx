'use client';

import { useState, useTransition } from 'react';
import { toggleReaction } from '@/lib/actions/social';
import type { ReactionCounts, ReactionType } from '@/types/database';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind blown' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
];

interface StoryReactionsProps {
  storyId: string;
  initialCounts: ReactionCounts;
}

export function StoryReactions({ storyId, initialCounts }: StoryReactionsProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [isPending, startTransition] = useTransition();

  const handleReact = (type: ReactionType) => {
    startTransition(async () => {
      const prevCounts = { ...counts };
      // Optimistic update
      const isRemoving = counts.userReaction === type;
      const newCounts = { ...counts };
      if (isRemoving) {
        (newCounts as any)[type] = Math.max(0, (newCounts as any)[type] - 1);
        newCounts.userReaction = null;
      } else {
        if (newCounts.userReaction) {
          (newCounts as any)[newCounts.userReaction] = Math.max(0, (newCounts as any)[newCounts.userReaction] - 1);
        }
        (newCounts as any)[type] = ((newCounts as any)[type] || 0) + 1;
        newCounts.userReaction = type;
      }
      setCounts(newCounts);

      const result = await toggleReaction(storyId, type);
      if (result.error) {
        setCounts(prevCounts); // revert on error
      }
    });
  };

  const totalReactions = REACTIONS.reduce((sum, r) => sum + ((counts as any)[r.type] || 0), 0);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {REACTIONS.map((r) => {
        const count = (counts as any)[r.type] || 0;
        const isActive = counts.userReaction === r.type;
        return (
          <button
            key={r.type}
            onClick={() => handleReact(r.type)}
            disabled={isPending}
            title={r.label}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all border ${
              isActive
                ? 'bg-brand-50 border-brand-300 text-brand-700 font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            } disabled:opacity-70`}
          >
            <span>{r.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
      {totalReactions > 0 && (
        <span className="text-xs text-gray-400 ml-1">{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}
