'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  LayoutDashboard,
  MessageSquare,
  Vote,
  Package,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import { Avatar } from '@/components/ui/avatar'

interface SidebarProps {
  user: User
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/posts', label: 'Community Posts', icon: MessageSquare },
  { href: '/votes', label: 'Voting', icon: Vote },
  { href: '/resources', label: 'Resources', icon: Package },
  { href: '/neighborhood', label: 'Neighborhood', icon: MapPin },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-green-900/50">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="text-white" size={18} />
        </div>
        <div>
          <span className="text-white font-bold text-base leading-tight block">NeighborDAO</span>
          <span className="text-green-300 text-xs">Community Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-green-400 group-hover:text-white'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile + Sign Out */}
      <div className="px-3 py-4 border-t border-green-900/50 space-y-2">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800 transition-colors group"
        >
          <Avatar
            src={user.avatar_url}
            name={user.full_name ?? user.email}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.full_name ?? 'Neighbor'}
            </p>
            <p className="text-xs text-green-400 truncate">{user.email}</p>
          </div>
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-300 hover:bg-green-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} className="flex-shrink-0 text-green-400" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0"
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-green-700 text-white rounded-lg shadow-md"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-green-300 hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>
    </>
  )
}
