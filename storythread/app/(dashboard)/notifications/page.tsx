import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, BookOpen, Users, Sparkles, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Notifications' };

// Notification type icons
const notifIcons: Record<string, React.ElementType> = {
  comment: MessageSquare,
  follow: Users,
  publish: BookOpen,
  ai_tip: Sparkles,
  default: Bell,
};

// Sample notification type definition matching a hypothetical notifications table
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Attempt to fetch from a notifications table (may not exist yet — handled gracefully)
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const tableExists = !error || !error.message.includes('does not exist');
  const items: Notification[] = tableExists ? (notifications ?? []) : [];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay up to date with your writing activity."
        className="mb-8"
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)]">
            <Bell className="h-7 w-7 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            All caught up!
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
            When readers comment on your stories, or when collaborators join your projects,
            you&apos;ll see activity here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {items.map((notif) => {
            const Icon = notifIcons[notif.type] ?? notifIcons.default;
            return (
              <div
                key={notif.id}
                className={[
                  'flex items-start gap-4 px-5 py-4 transition-colors',
                  notif.read ? '' : 'bg-brand-50',
                ].join(' ')}
              >
                <div
                  className={[
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    notif.read ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' : 'bg-brand-100 text-brand-600',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={[
                      'text-sm',
                      notif.read ? 'text-[var(--muted-foreground)]' : 'font-medium text-[var(--foreground)]',
                    ].join(' ')}
                  >
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="mt-0.5 text-sm text-[var(--muted-foreground)] line-clamp-2">
                      {notif.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {formatRelativeTime(notif.created_at)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {!tableExists && (
        <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
          Notifications will appear here once your database schema includes the notifications table.
        </p>
      )}
    </div>
  );
}
