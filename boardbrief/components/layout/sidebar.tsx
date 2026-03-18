'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  ListOrdered,
  FileStack,
  BarChart3,
  FolderOpen,
  User,
  Gift,
  KeyRound,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BoardSwitcher } from '@/components/BoardSwitcher';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'boards', href: '/boards', icon: Building2 },
  { key: 'meetings', href: '/meetings', icon: Calendar },
  { key: 'agendaBuilder', href: '/agenda-builder', icon: ListOrdered },
  { key: 'boardPack', href: '/board-pack', icon: FileStack },
  { key: 'documents', href: '/documents', icon: FolderOpen },
  { key: 'boardMembers', href: '/board-members', icon: Users },
  { key: 'actionItems', href: '/action-items', icon: CheckSquare },
  { key: 'resolutions', href: '/resolutions', icon: Vote },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
  { key: 'profile', href: '/settings/profile', icon: User },
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'referral', href: '/settings/referral', icon: Gift },
  { key: 'sso', href: '/settings/sso', icon: KeyRound },
];

export function Sidebar() {
  const t = useTranslations('nav');
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
      <div className="flex h-16 items-center justify-between border-b border-navy-800 px-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 shrink-0 text-gold-500" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-white">BoardBrief</span>
          )}
        </div>
        {!collapsed && <NotificationCenter />}
      </div>

      {/* Board Switcher */}
      <BoardSwitcher collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const label = t(item.key);
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
              title={collapsed ? label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
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
          {!collapsed && <span>{t('newMeeting')}</span>}
        </Link>
      </div>

      {/* Language Switcher */}
      {!collapsed && (
        <div className="border-t border-navy-800 px-3 pt-3 pb-1">
          <LanguageSwitcher />
        </div>
      )}

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
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-800 hover:text-white"
                title={t('signOut')}
                aria-label={t('signOut')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-navy-800 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-800 hover:text-white"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
