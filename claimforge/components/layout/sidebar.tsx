'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import {
  Shield,
  LayoutDashboard,
  FolderOpen,
  FileUp,
  Search,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  User,
  Gift,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'dashboard' },
  { href: '/claims', icon: FileText, label: 'Claims', labelKey: 'claims' },
  { href: '/cases', icon: FolderOpen, label: 'Cases', labelKey: 'cases' },
  { href: '/documents', icon: FileUp, label: 'Documents', labelKey: 'documents' },
  { href: '/analysis', icon: Search, label: 'Analysis', labelKey: 'analysis' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', labelKey: 'analytics' },
  { href: '/reports', icon: FileText, label: 'Reports', labelKey: 'reports' },
  { href: '/team', icon: Users, label: 'Team', labelKey: 'team' },
  { href: '/settings/profile', icon: User, label: 'Profile', labelKey: 'profile' },
  { href: '/settings', icon: Settings, label: 'Settings', labelKey: 'settings' },
  { href: '/settings/referral', icon: Gift, label: 'Referral', labelKey: 'referral' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const t = useTranslations('nav');

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-default bg-bg-surface transition-all duration-normal',
        sidebarCollapsed ? 'w-[var(--spacing-sidebar-collapsed)]' : 'w-[var(--spacing-sidebar)]',
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center justify-between border-b border-border-default px-4">
        <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center w-full')}>
          <Shield className="h-5 w-5 shrink-0 text-primary" />
          {!sidebarCollapsed && (
            <span className="legal-heading text-sm font-semibold text-text-primary">ClaimForge</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!sidebarCollapsed && <NotificationCenter />}
          <button
            onClick={toggleSidebar}
            className={cn(
              'rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-surface-raised hover:text-text-secondary',
              sidebarCollapsed && 'hidden',
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                sidebarCollapsed && 'justify-center px-2',
                isActive
                  ? 'bg-primary-muted text-primary-light'
                  : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border-default p-2">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg px-2 py-2 text-text-tertiary transition-colors hover:bg-bg-surface-raised hover:text-text-secondary"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-xs font-medium text-primary-light">
              SD
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-xs font-medium text-text-primary">Investigator</div>
              <div className="truncate text-[10px] text-text-tertiary">user@claimforge.io</div>
            </div>
            <button className="rounded-md p-1 text-text-tertiary transition-colors hover:text-fraud-red" aria-label="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {!sidebarCollapsed && (
          <LanguageSwitcher />
        )}
      </div>
    </aside>
  );
}
