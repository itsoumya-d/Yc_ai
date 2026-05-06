import { useAppStore, type AppView } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Workflow,
  TestTubes,
  Rocket,
  Activity,
  LayoutGrid,
  Store,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: 'main' | 'discover' | 'bottom';
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { id: 'editor', label: 'Editor', icon: Workflow, section: 'main' },
  { id: 'test', label: 'Test', icon: TestTubes, section: 'main' },
  { id: 'deploy', label: 'Deploy', icon: Rocket, section: 'main' },
  { id: 'monitor', label: 'Monitor', icon: Activity, section: 'main' },
  { id: 'templates', label: 'Templates', icon: LayoutGrid, section: 'discover' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, section: 'discover' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'bottom' },
];

export function Sidebar() {
  const { currentView, setCurrentView } = useAppStore();

  const mainItems = navItems.filter((item) => item.section === 'main');
  const discoverItems = navItems.filter((item) => item.section === 'discover');
  const bottomItems = navItems.filter((item) => item.section === 'bottom');

  return (
    <div className="flex w-12 flex-col border-r border-border-default bg-bg-root">
      {/* Main navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-1.5 pt-2">
        {mainItems.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        <div className="my-1.5 h-px bg-border-subtle" />

        {discoverItems.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-1 border-t border-border-subtle p-1.5">
        {bottomItems.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      title={item.label}
      className={cn(
        'group relative flex h-9 w-9 items-center justify-center rounded-md transition-all',
        isActive
          ? 'bg-bg-surface-hover text-text-primary'
          : 'text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary'
      )}
      style={{ transitionDuration: 'var(--duration-fast)' }}
    >
      <Icon className="h-[18px] w-[18px]" />

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      {/* Tooltip */}
      <div className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-bg-surface-raised px-2 py-1 text-xs text-text-primary shadow-2 group-hover:block">
        {item.label}
      </div>
    </button>
  );
}
