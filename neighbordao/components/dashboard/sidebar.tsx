'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  TreePine,
  MessageSquare,
  ShoppingCart,
  Wrench,
  MapPin,
  Vote,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Bell,
  Plus,
  MoreHorizontal,
} from 'lucide-react';

const sidebarLinks = [
  { href: '/feed', icon: MessageSquare, label: 'Feed' },
  { href: '/purchasing', icon: ShoppingCart, label: 'Purchasing' },
  { href: '/resources', icon: Wrench, label: 'Resources' },
  { href: '/voting', icon: Vote, label: 'Voting' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/directory', icon: Users, label: 'Directory' },
  { href: '/treasury', icon: DollarSign, label: 'Treasury' },
];

const bottomLinks = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const mobileLinks = [
  { href: '/feed', icon: MessageSquare, label: 'Feed' },
  { href: '/voting', icon: Vote, label: 'Vote' },
  { href: '/purchasing', icon: ShoppingCart, label: 'Shop' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/settings', icon: MoreHorizontal, label: 'More' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-surface">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
          <TreePine className="h-7 w-7 text-leaf-600" />
          <span className="font-heading text-lg font-bold text-text-primary">
            NeighborDAO
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-leaf-50 text-leaf-700'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                )}
              >
                <link.icon className={cn('h-5 w-5', isActive ? 'text-leaf-600' : 'text-text-muted')} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-border px-3 py-4 space-y-1">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-leaf-50 text-leaf-700'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                )}
              >
                <link.icon className={cn('h-5 w-5', isActive ? 'text-leaf-600' : 'text-text-muted')} />
                {link.label}
              </Link>
            );
          })}

          {/* Neighborhood badge */}
          <div className="mt-4 rounded-[var(--radius-input)] bg-leaf-50 p-3">
            <p className="text-xs font-medium text-leaf-700">Free Plan</p>
            <p className="mt-1 text-xs text-leaf-600">Up to 50 members</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex items-center justify-around py-2">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs',
                isActive ? 'text-leaf-600' : 'text-text-muted'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
