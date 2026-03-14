'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, LayoutKanban, BarChart3, Users, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/pipeline', label: 'Pipeline', icon: LayoutKanban },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-[#2a3147] bg-[#0f1117]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-100">DealRoom</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-indigo-600/15 text-indigo-400'
                : 'text-slate-400 hover:bg-[#1a1f2e] hover:text-slate-200',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Upgrade CTA */}
      <div className="m-3 rounded-xl border border-indigo-800/50 bg-indigo-950/50 p-3">
        <Zap className="mb-1.5 h-4 w-4 text-indigo-400" />
        <p className="text-xs font-medium text-slate-200">Upgrade to Growth</p>
        <p className="mt-0.5 text-[10px] text-slate-500">Unlock AI scoring + HubSpot sync</p>
        <Link
          href="/settings?tab=billing"
          className="mt-2 block rounded-lg bg-indigo-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-indigo-500"
        >
          Upgrade $49/mo
        </Link>
      </div>
    </aside>
  );
}
