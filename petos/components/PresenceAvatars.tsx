'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PresenceUser {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

function getColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function PresenceAvatars({
  channelId,
  currentUser,
}: {
  channelId: string;
  currentUser: { id: string; name: string; avatar?: string };
}) {
  const [others, setOthers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const supabase = createClient();

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
            name: (presences[0] as any).name ?? 'Unknown',
            avatar: (presences[0] as any).avatar,
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
  }, [channelId, currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (others.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-[var(--muted-foreground,#64748B)] mr-1">Also viewing:</span>
      <div className="flex -space-x-2">
        {others.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            title={user.name}
            className="relative h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 overflow-hidden flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
        ))}
        {others.length > 5 && (
          <div className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 bg-[var(--muted,#E2E8F0)] flex items-center justify-center text-xs text-[var(--muted-foreground,#64748B)] font-medium">
            +{others.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
