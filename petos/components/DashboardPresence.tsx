'use client';

import { useEffect, useState } from 'react';
import { PresenceAvatars } from '@/components/PresenceAvatars';
import { createClient } from '@/lib/supabase/client';

export function DashboardPresence() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
        });
      }
    });
  }, []);

  if (!currentUser) return null;

  return <PresenceAvatars channelId="pets-community" currentUser={currentUser} />;
}
