'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import { LayoutDashboard, FileText, Users, LayoutTemplate, Library, Settings, Plus, Send, Menu, PanelLeftClose, LogOut, BarChart3, User, Gift } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

interface SidebarProps { user: User; }

export function Sidebar({ user }: SidebarProps) {
  const t = useTranslations('nav');

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('proposals'), href: '/proposals', icon: FileText },
    { name: t('clients'), href: '/clients', icon: Users },
    { name: t('templates'), href: '/templates', icon: LayoutTemplate },
    { name: t('contentLibrary'), href: '/content-library', icon: Library },
    { name: t('analytics'), href: '/analytics', icon: BarChart3 },
  ];

  const bottomNavigation = [
    { name: t('profile'), href: '/settings/profile', icon: User },
    { name: t('settings'), href: '/settings', icon: Settings },
    { name: t('referral'), href: '/settings/referral', icon: Gift },
  ];
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
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className={cn('flex h-screen flex-col border-r border-[var(--border)] bg-[var(--card)] transition-all duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-heading text-lg font-bold text-brand-600">
            <Send className="h-5 w-5" />
            ProposalPilot
          </Link>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && <NotificationCenter />}
          <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]" aria-label={collapsed ? t('expand') : t('collapse')}>
            {collapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="px-3 pt-4">
        <Link href="/proposals/new" className={cn('flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700', collapsed && 'px-2')}>
          <Plus className="h-4 w-4" />
          {!collapsed && t('newProposal')}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-brand-50 text-brand-700' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]', collapsed && 'justify-center px-2')}>
              <Icon className="h-5 w-5" />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-3 py-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-brand-50 text-brand-700' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]', collapsed && 'justify-center px-2')}>
              <Icon className="h-5 w-5" />
              {!collapsed && item.name}
            </Link>
          );
        })}
        {/* Language Switcher */}
        {!collapsed && (
          <div className="border-t border-[var(--border)] pt-2 mt-1">
            <LanguageSwitcher />
          </div>
        )}

        <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2', collapsed && 'justify-center px-2')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{userInitials}</div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{user.user_metadata?.full_name || 'User'}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={handleSignOut} className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]" aria-label={t('signOut')}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
