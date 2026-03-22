'use client';

import * as React from 'react';
import { Bell, X, Check, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

const TYPE_COLORS = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationCenter() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  React.useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data) {
          setNotifications(data as Notification[]);
        }
      } catch {
        // Table may not exist yet — show empty state
        setNotifications([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const markAllRead = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    } catch { /* ok */ }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch { /* ok */ }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-xl overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <CheckCheck className="h-3.5 w-3.5" />Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Bell className="h-8 w-8 text-[var(--muted-foreground)]/40 mb-2" />
                  <p className="text-sm font-medium text-[var(--foreground)]">All caught up!</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((n) => {
                    const Icon = TYPE_ICONS[n.type] ?? Info;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          'flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--accent)]/50 cursor-default',
                          !n.read && 'bg-[var(--accent)]/30'
                        )}
                        onClick={() => !n.read && markRead(n.id)}
                      >
                        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', TYPE_COLORS[n.type])} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-medium leading-tight', n.read ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]/60 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
