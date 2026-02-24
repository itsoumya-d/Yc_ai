'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  ListChecks,
  CheckSquare,
  AlertTriangle,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import { createClient } from '@/lib/supabase/client';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/frameworks', label: 'Frameworks', icon: ListChecks },
  { href: '/controls', label: 'Controls', icon: CheckSquare },
  { href: '/gaps', label: 'Gaps', icon: AlertTriangle },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/evidence', label: 'Evidence', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">CompliBot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-4.5 h-4.5 shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-100">
        {userEmail && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 text-gray-400 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
