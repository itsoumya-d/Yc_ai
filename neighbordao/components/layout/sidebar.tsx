'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, ShoppingCart, Wrench, MapPin, Vote, Calendar,
  Users, Banknote, MessageCircle, Bell, Settings, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/feed',          icon: Home,          label: 'Feed' },
  { href: '/purchasing',    icon: ShoppingCart,   label: 'Purchasing' },
  { href: '/resources',     icon: Wrench,         label: 'Resources' },
  { href: '/map',           icon: MapPin,         label: 'Map' },
  { href: '/voting',        icon: Vote,           label: 'Voting' },
  { href: '/events',        icon: Calendar,       label: 'Events' },
  { href: '/directory',     icon: Users,          label: 'Directory' },
  { href: '/treasury',      icon: Banknote,       label: 'Treasury' },
  { href: '/chat',          icon: MessageCircle,  label: 'Chat' },
];

const BOTTOM_ITEMS = [
  { href: '/notifications', icon: Bell,     label: 'Notifications' },
  { href: '/settings',      icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:bg-white" style={{ borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A]">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-extrabold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          NeighborDAO
        </span>
      </div>

      {/* Neighborhood badge */}
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
        <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Your Neighborhood</div>
        <div className="mt-0.5 text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>Oak Hills Community</div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>42 members</div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Primary navigation">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/feed' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-[#F0FDF4] text-[#16A34A]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#16A34A]' : 'text-[var(--text-tertiary)]')} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom nav */}
      <div className="border-t py-3" style={{ borderColor: 'var(--border)' }}>
        <ul className="space-y-0.5 px-2">
          {BOTTOM_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-[#F0FDF4] text-[#16A34A]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogOut className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
