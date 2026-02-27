'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  ClipboardList,
  Compass,
  BookOpen,
  Briefcase,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assessment', label: 'Skills Assessment', icon: ClipboardList },
  { href: '/careers', label: 'Career Paths', icon: Compass },
  { href: '/learning-plan', label: 'Learning Plan', icon: BookOpen },
  { href: '/jobs', label: 'Job Matches', icon: Briefcase },
  { href: '/resume', label: 'Resume AI', icon: FileText },
];

interface SidebarProps {
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-indigo-950 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-indigo-900">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white font-heading">SkillBridge</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-indigo-900 pt-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'
          )}
        >
          <Settings className="w-4.5 h-4.5 flex-shrink-0" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          Sign out
        </button>

        {(userEmail || userName) && (
          <div className="px-3 pt-3 mt-2 border-t border-indigo-900">
            <p className="text-xs font-medium text-white truncate">{userName ?? userEmail}</p>
            {userName && <p className="text-xs text-indigo-400 truncate">{userEmail}</p>}
          </div>
        )}
      </div>
    </aside>
  );
}
