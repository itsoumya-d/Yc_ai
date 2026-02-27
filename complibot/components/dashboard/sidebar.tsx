'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Shield,
  Search,
  FileText,
  Archive,
  ClipboardList,
  Activity,
  Lock,
  BookOpen,
  Building2,
  BarChart3,
  Settings,
  Menu,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Frameworks', href: '/frameworks', icon: <Shield className="h-5 w-5" /> },
  { label: 'Gap Analysis', href: '/gaps', icon: <Search className="h-5 w-5" /> },
  { label: 'Policies', href: '/policies', icon: <FileText className="h-5 w-5" /> },
  { label: 'Evidence', href: '/evidence', icon: <Archive className="h-5 w-5" /> },
  { label: 'Tasks', href: '/tasks', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Monitoring', href: '/monitoring', icon: <Activity className="h-5 w-5" /> },
  { label: 'Audit Room', href: '/audit-room', icon: <Lock className="h-5 w-5" /> },
  { label: 'Training', href: '/training', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Vendors', href: '/vendors', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border">
        <ShieldCheck className="h-7 w-7 text-trust-600 shrink-0" />
        <span className="text-lg font-bold text-trust-600 tracking-tight">CompliBot</span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium
                transition-colors duration-150
                ${
                  isActive
                    ? 'bg-trust-50 text-trust-600 border-l-[3px] border-l-trust-600'
                    : 'text-text-secondary hover:bg-surface-secondary border-l-[3px] border-l-transparent'
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-3 py-4 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium
                transition-colors duration-150
                ${
                  isActive
                    ? 'bg-trust-50 text-trust-600 border-l-[3px] border-l-trust-600'
                    : 'text-text-secondary hover:bg-surface-secondary border-l-[3px] border-l-transparent'
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* User section placeholder */}
        <div className="mt-3 flex items-center gap-3 rounded-md px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-trust-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-trust-700">U</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">User Name</p>
            <p className="text-xs text-text-muted truncate">Compliance Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Tasks', href: '/tasks', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Gaps', href: '/gaps', icon: <Search className="h-5 w-5" /> },
    { label: 'Monitoring', href: '/monitoring', icon: <Activity className="h-5 w-5" /> },
    { label: 'More', href: '/settings', icon: <Menu className="h-5 w-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs font-medium
                transition-colors duration-150
                ${isActive ? 'text-trust-600' : 'text-text-secondary'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
