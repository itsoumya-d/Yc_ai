import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { AppView } from '@/types/database';
import {
  LayoutDashboard, Database, History, BarChart3, Bell,
  Settings, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';

const navItems: { view: AppView; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { view: 'workspace', label: 'Query', icon: Sparkles },
  { view: 'dashboards', label: 'Dashboards', icon: BarChart3, badge: 3 },
  { view: 'schema', label: 'Schema', icon: Database },
  { view: 'history', label: 'History', icon: History, badge: 24 },
  { view: 'reports', label: 'Reports', icon: LayoutDashboard },
  { view: 'alerts', label: 'Alerts', icon: Bell, badge: 2 },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div className={cn('flex flex-col border-r border-border-default bg-bg-surface transition-all duration-200', sidebarCollapsed ? 'w-16' : 'w-56')}>
      {/* Data Sources Indicator */}
      {!sidebarCollapsed && (
        <div className="border-b border-border-default px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-status-success" />
            <span className="text-xs text-text-secondary">2 sources connected</span>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              currentView === item.view
                ? 'bg-primary-muted text-primary-light'
                : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
              sidebarCollapsed && 'justify-center px-0'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && (
                  <span className="rounded-full bg-bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-border-default p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-2 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
