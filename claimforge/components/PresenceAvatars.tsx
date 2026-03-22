'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PresenceUser {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

function getColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface PresenceAvatarsProps {
  channelId: string;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function PresenceAvatars({ channelId, currentUser }: PresenceAvatarsProps) {
  const [others, setOthers] = useState<PresenceUser[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`presence:${channelId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ name: string; avatar?: string }>();
        const users: PresenceUser[] = Object.entries(state)
          .filter(([key]) => key !== currentUser.id)
          .map(([key, presences]) => ({
            userId: key,
            name: (presences[0] as { name: string; avatar?: string }).name ?? 'Unknown',
            avatar: (presences[0] as { name: string; avatar?: string }).avatar,
            color: getColor(key),
          }));
        setOthers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: currentUser.name, avatar: currentUser.avatar });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, currentUser.id]);

  if (others.length === 0) return null;

  const visible = others.slice(0, 5);
  const overflow = others.length - 5;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[var(--muted-foreground)] select-none">Also reviewing:</span>
        <div className="flex -space-x-2">
          {visible.map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <div
                  aria-label={user.name}
                  className="relative h-7 w-7 rounded-full ring-2 ring-[var(--background)] overflow-hidden flex items-center justify-center text-[10px] font-semibold text-white cursor-default select-none shrink-0"
                  style={{ backgroundColor: user.color }}
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.name.slice(0, 2).toUpperCase()
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>{user.name}</TooltipContent>
            </Tooltip>
          ))}
          {overflow > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  aria-label={`${overflow} more reviewer${overflow > 1 ? 's' : ''}`}
                  className="h-7 w-7 rounded-full ring-2 ring-[var(--background)] bg-[var(--muted,#E2E8F0)] flex items-center justify-center text-[10px] font-medium text-[var(--muted-foreground)] cursor-default select-none shrink-0"
                >
                  +{overflow}
                </div>
              </TooltipTrigger>
              <TooltipContent>{overflow} more reviewer{overflow > 1 ? 's' : ''}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
