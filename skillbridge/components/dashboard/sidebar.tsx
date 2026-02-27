'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck,
  Puzzle,
  Map,
  GraduationCap,
  Briefcase,
  FileText,
  Settings,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Assessment', href: '/dashboard/assessment', icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: 'My Skills', href: '/dashboard/skills', icon: <Puzzle className="h-5 w-5" /> },
  { label: 'Careers', href: '/dashboard/careers', icon: <Map className="h-5 w-5" /> },
  { label: 'Learning', href: '/dashboard/learning', icon: <GraduationCap className="h-5 w-5" /> },
  { label: 'Jobs', href: '/dashboard/jobs', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Resume', href: '/dashboard/resume', icon: <FileText className="h-5 w-5" /> },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Help', href: '#', icon: <HelpCircle className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-stone-50 border-r border-stone-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-stone-200">
        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm font-heading">SB</span>
        </div>
        <span className="text-lg font-bold text-stone-900 font-heading">SkillBridge</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="border-t border-stone-200 px-3 py-4 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors duration-150"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {/* Subscription badge */}
        <div className="mt-3 rounded-md bg-teal-50 border border-teal-200 px-3 py-2">
          <p className="text-xs font-medium text-teal-700">Free Plan</p>
          <p className="text-xs text-teal-600 mt-0.5">3 career paths included</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems = [
    { label: 'Skills', href: '/dashboard/skills', icon: <Puzzle className="h-5 w-5" /> },
    { label: 'Careers', href: '/dashboard/careers', icon: <Map className="h-5 w-5" /> },
    { label: 'Learning', href: '/dashboard/learning', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Jobs', href: '/dashboard/jobs', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'More', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs
                ${isActive ? 'text-teal-600' : 'text-stone-500'}
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
