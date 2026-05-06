import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Library,
  CalendarClock,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Scale,
} from 'lucide-react';
import type { AppView } from '@/types/database';

const navItems: Array<{ view: AppView; icon: React.ComponentType<{ className?: string }>; label: string; badge?: number }> = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { view: 'contracts', icon: FileText, label: 'Contracts', badge: 12 },
  { view: 'templates', icon: FilePlus, label: 'Templates' },
  { view: 'clauses', icon: Library, label: 'Clause Library' },
  { view: 'obligations', icon: CalendarClock, label: 'Obligations', badge: 5 },
  { view: 'analytics', icon: BarChart3, label: 'Analytics' },
  { view: 'team', icon: Users, label: 'Team' },
];

export function Sidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-default bg-bg-surface transition-all',
        sidebarCollapsed ? 'w-[var(--spacing-sidebar-collapsed)]' : 'w-[var(--spacing-sidebar)]',
      )}
      style={{ transitionDuration: 'var(--duration-slow)' }}
    >
      {/* Logo */}
      <div className="flex h-12 items-center justify-between border-b border-border-default px-4">
        <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center w-full')}>
          <Scale className="h-5 w-5 shrink-0 text-accent" />
          {!sidebarCollapsed && <span className="legal-heading text-sm text-text-primary">LegalForge</span>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                sidebarCollapsed && 'justify-center px-2',
                isActive
                  ? 'bg-primary-muted text-primary-light gold-accent-border'
                  : 'text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary',
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="rounded-full bg-risk-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border-default p-2">
        <button
          onClick={() => setView('settings')}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors hover:bg-bg-surface-raised hover:text-text-secondary',
            sidebarCollapsed && 'justify-center px-2',
            currentView === 'settings' && 'bg-primary-muted text-primary-light',
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors hover:bg-bg-surface-raised',
            sidebarCollapsed && 'justify-center px-2',
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
