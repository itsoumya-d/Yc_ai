'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Home,
  LayoutDashboard,
  Menu,
  FileText,
  FolderLock,
  Globe,
  Leaf,
  Scale,
  Settings,
  Shield,
  Timer,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Wishes', href: '/wishes', icon: <Heart className="h-5 w-5" /> },
  { label: 'Digital Assets', href: '/assets', icon: <Globe className="h-5 w-5" /> },
  { label: 'Document Vault', href: '/vault', icon: <FolderLock className="h-5 w-5" /> },
  { label: 'Trusted Contacts', href: '/contacts', icon: <Users className="h-5 w-5" /> },
  { label: 'Legal', href: '/legal', icon: <Scale className="h-5 w-5" /> },
  { label: 'Check-In', href: '/checkin', icon: <Timer className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

const mobileItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { label: 'Wishes', href: '/wishes', icon: <Heart className="h-5 w-5" /> },
  { label: 'Vault', href: '/vault', icon: <FolderLock className="h-5 w-5" /> },
  { label: 'Contacts', href: '/contacts', icon: <Users className="h-5 w-5" /> },
  { label: 'More', href: '/settings', icon: <Menu className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600">
          <Leaf className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-text-primary font-heading">Mortal</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                transition-colors duration-150
                ${
                  isActive
                    ? 'bg-sage-50 text-sage-600'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User placeholder */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <span className="text-sm font-semibold font-heading">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">User</p>
            <p className="text-xs text-text-muted truncate">user@mortal.app</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
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
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs
                transition-colors duration-150
                ${isActive ? 'text-sage-600' : 'text-text-muted'}
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
