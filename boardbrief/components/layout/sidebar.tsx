'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  Vote,
  Settings,
  Shield,
  Plus,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Meetings', href: '/meetings', icon: Calendar },
  { label: 'Board Members', href: '/board-members', icon: Users },
  { label: 'Action Items', href: '/action-items', icon: CheckSquare },
  { label: 'Resolutions', href: '/resolutions', icon: Vote },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [user, setUser] = React.useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-navy-900 text-white transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-navy-800 px-4">
        <Shield className="h-8 w-8 shrink-0 text-gold-500" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">BoardBrief</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-navy-800 text-gold-500'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* New Meeting CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/meetings/new"
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-3 py-2.5 text-sm font-semibold text-navy-900 transition-colors duration-200 hover:bg-gold-400',
            collapsed && 'px-0'
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>New Meeting</span>}
        </Link>
      </div>

      {/* Theme Toggle */}
      <div className="px-3 pb-1">
        <ThemeToggle collapsed={collapsed} />
      </div>

      {/* User Section */}
      <div className="border-t border-navy-800 p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar
            name={displayName}
            size="sm"
            className="bg-navy-700 text-gold-400"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              {user?.email && (
                <p className="truncate text-xs text-navy-400">{user.email}</p>
              )}
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-800 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-navy-800 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-800 hover:text-white"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
