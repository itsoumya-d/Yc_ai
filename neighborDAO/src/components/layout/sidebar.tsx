'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Vote, LayoutDashboard, FileText, DollarSign, Users, Settings,
  Bell, ChevronDown, LogOut, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/proposals', icon: FileText, label: 'Proposals' },
  { href: '/treasury', icon: DollarSign, label: 'Treasury' },
  { href: '/members', icon: Users, label: 'Members' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Vote className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">Maple Grove DAO</p>
          <p className="text-[10px] text-text-tertiary">Community Governance</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4">
        <Link
          href="/proposals/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Proposal
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
              )}
            >
              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-text-secondary hover:bg-surface hover:text-text-primary',
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary">
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
