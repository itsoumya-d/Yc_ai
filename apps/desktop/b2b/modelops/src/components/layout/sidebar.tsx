import { useAppStore, type AppView } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GitBranch,
  FlaskConical,
  Activity,
  Package,
  Database,
  Cpu,
  Rocket,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: 'main' | 'infrastructure' | 'bottom';
}

const navItems: NavItem[] = [
  { id: 'welcome', label: 'Projects', icon: LayoutDashboard, section: 'main' },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch, section: 'main' },
  { id: 'experiments', label: 'Experiments', icon: FlaskConical, section: 'main' },
  { id: 'training', label: 'Training', icon: Activity, section: 'main' },
  { id: 'models', label: 'Models', icon: Package, section: 'main' },
  { id: 'datasets', label: 'Datasets', icon: Database, section: 'main' },
  { id: 'gpu', label: 'GPUs', icon: Cpu, section: 'infrastructure' },
  { id: 'deploy', label: 'Deploy', icon: Rocket, section: 'infrastructure' },
  { id: 'team', label: 'Team', icon: Users, section: 'infrastructure' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'bottom' },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar } = useAppStore();

  const mainItems = navItems.filter((item) => item.section === 'main');
  const infraItems = navItems.filter((item) => item.section === 'infrastructure');
  const bottomItems = navItems.filter((item) => item.section === 'bottom');

  return (
    <div
      className={cn(
        'flex flex-col border-r border-border-default bg-bg-root transition-all duration-normal',
        sidebarCollapsed ? 'w-14' : 'w-14'
      )}
    >
      {/* Main navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {mainItems.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        <div className="my-2 h-px bg-border-subtle" />

        {infraItems.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-1 border-t border-border-subtle p-2">
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
        'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-instant',
        isActive
          ? 'bg-bg-surface-active text-text-primary'
          : 'text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary'
      )}
    >
      <Icon className="h-[18px] w-[18px]" />

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      {/* Tooltip */}
      <div className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-bg-elevated px-2 py-1 text-xs text-text-primary shadow-dropdown group-hover:block">
        {item.label}
      </div>
    </button>
  );
}
