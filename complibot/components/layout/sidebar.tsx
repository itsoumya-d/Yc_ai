'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  FileText,
  FolderOpen,
  ListTodo,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/frameworks', label: 'Frameworks', icon: BookOpen },
  { href: '/controls', label: 'Controls', icon: CheckSquare },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/evidence', label: 'Evidence', icon: FolderOpen },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
];

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  orgName?: string;
}

export function Sidebar({ userEmail, userName, orgName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white font-heading">CompliBot</span>
            {orgName && <p className="text-xs text-slate-400 truncate max-w-[120px]">{orgName}</p>}
          </div>
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
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Settings className="w-4.5 h-4.5 flex-shrink-0" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          Sign out
        </button>

        {(userEmail || userName) && (
          <div className="px-3 pt-3 mt-2 border-t border-slate-800">
            <p className="text-xs font-medium text-white truncate">{userName ?? userEmail}</p>
            {userName && <p className="text-xs text-slate-400 truncate">{userEmail}</p>}
          </div>
        )}
      </div>
    </aside>
  );
}
