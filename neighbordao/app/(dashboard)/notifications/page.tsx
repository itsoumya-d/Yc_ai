'use client';

import { useState } from 'react';
import { Bell, Vote, ShoppingCart, Calendar, Wrench, MessageCircle, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'vote' | 'order' | 'event' | 'resource' | 'comment' | 'alert' | 'system';
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
}

const ICON_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  vote:     { icon: Vote,          color: '#2563EB', bg: '#EFF6FF' },
  order:    { icon: ShoppingCart,   color: '#16A34A', bg: '#F0FDF4' },
  event:    { icon: Calendar,      color: '#7C3AED', bg: '#F5F3FF' },
  resource: { icon: Wrench,        color: '#0369A1', bg: '#E0F2FE' },
  comment:  { icon: MessageCircle, color: '#A16207', bg: '#FEF9C3' },
  alert:    { icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2' },
  system:   { icon: Bell,          color: '#78716C', bg: '#F5F5F4' },
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'vote', title: 'New vote: "Speed bump installation"', body: 'Cast your vote before March 25. 33 households have already voted.', time: '2h ago', isRead: false, actionUrl: '/voting' },
  { id: 'n2', type: 'order', title: 'Group order update: Mulch order', body: '2 more households needed to proceed. Order closes in 3 days.', time: '4h ago', isRead: false, actionUrl: '/purchasing' },
  { id: 'n3', type: 'comment', title: 'Sarah M. commented on your post', body: '"Great suggestion! I\'ll bring the extension cord to the meeting too."', time: '6h ago', isRead: true },
  { id: 'n4', type: 'resource', title: 'Resource returned: Extension Ladder', body: 'Tom marked the ladder as returned in good condition. Deposit refunded.', time: '1d ago', isRead: true, actionUrl: '/resources' },
  { id: 'n5', type: 'event', title: 'New event: Community Garden Spring Prep', body: 'March 22 at 9:00 AM at Garden Lot B. 13 spots available. RSVP now!', time: '1d ago', isRead: true, actionUrl: '/events' },
  { id: 'n6', type: 'alert', title: 'Safety alert: Power outage scheduled', body: 'PG&E scheduled maintenance on Thursday 10pm–2am. Expected to affect Oak Lane and Elm St.', time: '2d ago', isRead: true },
  { id: 'n7', type: 'system', title: 'Welcome to NeighborDAO!', body: 'Your neighborhood profile is set up. Invite your neighbors to join Oak Hills.', time: '7d ago', isRead: true },
];

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};
  notifications.forEach(n => {
    const group = n.time.includes('h ago') ? 'Today' : n.time.includes('1d') ? 'Yesterday' : 'Earlier';
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  });
  return groups;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  const groups = groupByDate(notifications);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-[#16A34A] px-2 py-0.5 text-sm font-bold text-white">{unreadCount}</span>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              Mark all read
            </button>
          )}
          <button className="rounded-lg border p-1.5 hover:bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }} aria-label="Notification settings">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{group}</h2>
          <div className="rounded-2xl border bg-white overflow-hidden shadow-sm divide-y" style={{ borderColor: 'var(--border)', '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {items.map(n => {
              const iconDef = ICON_MAP[n.type];
              const Icon = iconDef.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--bg-page)]', !n.isRead && 'bg-[#FEFCE8]')}
                >
                  <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full')} style={{ background: iconDef.bg }}>
                    <Icon className="h-4 w-4" style={{ color: iconDef.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{n.title}</span>
                      <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.body}</p>
                    {n.actionUrl && (
                      <span className="mt-1 text-xs font-medium text-[#16A34A]">View →</span>
                    )}
                  </div>
                  {!n.isRead && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {notifications.length === 0 && (
        <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#16A34A]" />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>All caught up!</p>
        </div>
      )}
    </div>
  );
}
