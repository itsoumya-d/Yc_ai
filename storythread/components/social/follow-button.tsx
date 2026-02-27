'use client';

import { useState, useTransition } from 'react';
import { followAuthor, unfollowAuthor } from '@/lib/actions/social';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  authorId: string;
  initialIsFollowing: boolean;
  currentUserId?: string;
}

export function FollowButton({ authorId, initialIsFollowing, currentUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  if (!currentUserId || currentUserId === authorId) return null;

  const handleToggle = () => {
    startTransition(async () => {
      const prevState = isFollowing;
      setIsFollowing(!isFollowing); // optimistic
      const result = isFollowing
        ? await unfollowAuthor(authorId)
        : await followAuthor(authorId);
      if (result.error) {
        setIsFollowing(prevState); // revert
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all border disabled:opacity-70 ${
        isFollowing
          ? 'bg-brand-50 border-brand-300 text-brand-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
          : 'bg-brand-600 border-brand-600 text-white hover:bg-brand-700'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-3.5 w-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Follow Author
        </>
      )}
    </button>
  );
}
