'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard,
  MessageSquare,
  Vote,
  Calendar,
  ShoppingBag,
  Package,
  Users,
  Wallet,
  Settings,
  Plus,
  Trees,
  Menu,
  PanelLeftClose,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Feed', href: '/feed', icon: MessageSquare },
  { name: 'Voting', href: '/voting', icon: Vote },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Group Orders', href: '/purchasing', icon: ShoppingBag },
  { name: 'Resources', href: '/resources', icon: Package },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Treasury', href: '/treasury', icon: Wallet },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  user: {
    email?: string;
    user_metadata?: { full_name?: string };
  };
  neighborhoodName?: string;
}

export function Sidebar({ user, neighborhoodName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const userInitials = (user.user_metadata?.full_name || user.email || '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-[var(--border)] bg-[var(--card)] transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-heading text-lg font-bold text-leaf-600"
            >
              <span title="NeighborDAO">
                <Trees className="h-5 w-5 shrink-0" />
              </span>
              NeighborDAO
            </Link>
            {neighborhoodName && (
              <p className="truncate text-xs text-[var(--muted-foreground)]">
                {neighborhoodName}
              </p>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <span title="Expand">
              <Menu className="h-5 w-5" />
            </span>
          ) : (
            <span title="Collapse">
              <PanelLeftClose className="h-5 w-5" />
            </span>
          )}
        </button>
      </div>

      {/* New Post CTA */}
      <div className="px-3 pt-4">
        <Link
          href="/feed"
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg bg-leaf-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-700',
            collapsed && 'px-2'
          )}
        >
          <span title="New Post">
            <Plus className="h-4 w-4" />
          </span>
          {!collapsed && 'New Post'}
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-leaf-50 text-leaf-700 dark:bg-leaf-900/50 dark:text-leaf-400'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
                collapsed && 'justify-center px-2'
              )}
            >
              <span title={item.name}>
                <Icon className="h-5 w-5" />
              </span>
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] px-3 py-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-leaf-50 text-leaf-700 dark:bg-leaf-900/50 dark:text-leaf-400'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
                collapsed && 'justify-center px-2'
              )}
            >
              <span title={item.name}>
                <Icon className="h-5 w-5" />
              </span>
              {!collapsed && item.name}
            </Link>
          );
        })}
        <ThemeToggle collapsed={collapsed} />
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-semibold text-leaf-700">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">
                {user.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              aria-label="Sign out"
            >
              <span title="Sign out">
                <LogOut className="h-4 w-4" />
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
