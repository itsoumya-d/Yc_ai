import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getConnections } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { Sidebar } from '@/components/layout/sidebar';
import { StatusBar } from '@/components/layout/status-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { WorkspaceView } from '@/components/views/workspace-view';
import { DashboardsView } from '@/components/views/dashboards-view';
import { SchemaView } from '@/components/views/schema-view';
import { HistoryView } from '@/components/views/history-view';
import { ReportsView } from '@/components/views/reports-view';
import { AlertsView } from '@/components/views/alerts-view';
import { SettingsView } from '@/components/views/settings-view';

function renderView(view: string) {
  switch (view) {
    case 'welcome': return <WelcomeView />;
    case 'workspace': return <WorkspaceView />;
    case 'dashboards': return <DashboardsView />;
    case 'schema': return <SchemaView />;
    case 'history': return <HistoryView />;
    case 'reports': return <ReportsView />;
    case 'alerts': return <AlertsView />;
    case 'settings': return <SettingsView />;
    default: return <WelcomeView />;
  }
}

export function App() {
  const { currentView } = useAppStore();
  const showSidebar = currentView !== 'welcome';

  // Load settings and apply theme on mount
  useEffect(() => {
    const settings = getSettings();
    const store = useAppStore.getState();

    store.setOpenaiApiKey(settings.openaiApiKey);
    store.setTheme(settings.theme);
    store.setSqlFontSize(settings.sqlFontSize);
    store.setConnections(getConnections());

    // Apply theme
    if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}

        <div className="flex-1 overflow-hidden">
          {renderView(currentView)}
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
