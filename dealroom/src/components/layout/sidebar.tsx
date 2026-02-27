'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, TrendingUp, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/pipeline', icon: TrendingUp, label: 'Pipeline' },
  { href: '/team', icon: Users, label: 'Team' },
  { href: '/forecast', icon: BarChart3, label: 'Forecast' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"><Brain className="h-5 w-5 text-white" /></div>
        <div><p className="text-sm font-bold text-text-primary">DealRoom</p><p className="text-[10px] text-text-tertiary">AI Sales Intelligence</p></div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 pt-3">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-bg-root hover:text-text-primary')}>
              <Icon className="h-[18px] w-[18px]" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 space-y-0.5">
        <Link href="/settings" className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', pathname === '/settings' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-bg-root hover:text-text-primary')}>
          <Settings className="h-[18px] w-[18px]" />Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-root hover:text-text-primary transition-colors">
          <LogOut className="h-[18px] w-[18px]" />Sign Out
        </button>
      </div>
    </aside>
  );
}
