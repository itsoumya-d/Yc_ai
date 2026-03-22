'use client';

/**
 * ProposalPresence — thin client wrapper that resolves the current
 * authenticated user from the browser Supabase client and then
 * renders PresenceAvatars.
 *
 * This component is intentionally separate from ProposalDetail so
 * that the Supabase auth fetch happens lazily on the client side
 * without blocking the server-rendered page.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PresenceAvatars } from '@/components/PresenceAvatars';

interface ProposalPresenceProps {
  proposalId: string;
}

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
}

export function ProposalPresence({ proposalId }: ProposalPresenceProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const meta = data.user.user_metadata ?? {};
      setCurrentUser({
        id: data.user.id,
        name:
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          data.user.email ??
          'User',
        avatar:
          (meta.avatar_url as string | undefined) ??
          (meta.picture as string | undefined),
      });
    });
  }, []);

  if (!currentUser) return null;

  return (
    <PresenceAvatars
      channelId={`proposal-${proposalId}`}
      currentUser={currentUser}
    />
  );
}
