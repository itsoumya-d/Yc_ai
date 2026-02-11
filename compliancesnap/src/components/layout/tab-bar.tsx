import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { AppTab } from '@/types/database';
import { LayoutDashboard, ClipboardList, Camera, FileText, MoreHorizontal } from 'lucide-react';

const tabs: { id: AppTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inspections', label: 'Inspections', icon: ClipboardList },
  { id: 'scanner', label: 'Scan', icon: Camera },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function TabBar() {
  const { currentTab, setTab } = useAppStore();
  return (
    <div className="flex h-20 items-start border-t border-border-default bg-bg-surface pt-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 pt-1',
            tab.id === 'scanner' ? 'relative -mt-5' : '',
          )}
        >
          {tab.id === 'scanner' ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-safety-yellow shadow-lg">
              <Camera className="h-7 w-7 text-text-inverse" />
            </div>
          ) : (
            <>
              <tab.icon className={cn('h-6 w-6', currentTab === tab.id ? 'text-safety-yellow' : 'text-text-secondary')} />
              <span className={cn('text-[10px]', currentTab === tab.id ? 'text-safety-yellow font-medium' : 'text-text-secondary')}>
                {tab.label}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
