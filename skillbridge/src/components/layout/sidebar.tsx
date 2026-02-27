'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, LayoutDashboard, Map, BookOpen, FileText, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/paths', icon: Map, label: 'Career Paths' },
  { href: '/learning', icon: BookOpen, label: 'Learning Plan' },
  { href: '/resume', icon: FileText, label: 'Resume Builder' },
  { href: '/mentors', icon: Users, label: 'Mentors' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">SkillBridge</p>
          <p className="text-[10px] text-text-tertiary">Career Navigator</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 pt-3">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary')}>
              <Icon className="h-[18px] w-[18px]" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 space-y-0.5">
        <Link href="/settings" className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', pathname === '/settings' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary')}>
          <Settings className="h-[18px] w-[18px]" />Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary">
          <LogOut className="h-[18px] w-[18px]" />Sign Out
        </button>
      </div>
    </aside>
  );
}
