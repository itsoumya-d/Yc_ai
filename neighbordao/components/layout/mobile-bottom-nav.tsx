'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, MapPin, Vote, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIMARY_NAV = [
  { href: '/feed',       icon: Home,          label: 'Feed' },
  { href: '/purchasing', icon: ShoppingCart,   label: 'Orders' },
  { href: '/map',        icon: MapPin,         label: 'Map' },
  { href: '/voting',     icon: Vote,           label: 'Vote' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t bg-white px-2 pb-safe-area-bottom lg:hidden"
      style={{ borderColor: 'var(--border)', height: '64px' }}
      aria-label="Mobile navigation"
    >
      {PRIMARY_NAV.map(item => {
        const active = pathname === item.href || (item.href !== '/feed' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2"
            aria-current={active ? 'page' : undefined}
          >
            <item.icon
              className={cn('h-5 w-5', active ? 'text-[#16A34A]' : 'text-[var(--text-tertiary)]')}
              strokeWidth={active ? 2.5 : 1.75}
            />
            <span className={cn('text-[10px] font-medium', active ? 'text-[#16A34A]' : 'text-[var(--text-tertiary)]')}>
              {item.label}
            </span>
          </Link>
        );
      })}
      <Link
        href="/settings"
        className="flex min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2"
      >
        <MoreHorizontal className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
        <span className="text-[10px] font-medium text-[var(--text-tertiary)]">More</span>
      </Link>
    </nav>
  );
}
