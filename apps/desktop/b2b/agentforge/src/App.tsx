import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getAgents, getProviderConfigs } from '@/lib/storage';
import { Sidebar } from '@/components/layout/sidebar';
import { TitleBar } from '@/components/layout/title-bar';
import { StatusBar } from '@/components/layout/status-bar';
import { DashboardView } from '@/components/views/dashboard-view';
import { EditorView } from '@/components/views/editor-view';
import { TestRunnerView } from '@/components/views/test-runner-view';
import { DeployView } from '@/components/views/deploy-view';
import { MonitorView } from '@/components/views/monitor-view';
import { TemplatesView } from '@/components/views/templates-view';
import { MarketplaceView } from '@/components/views/marketplace-view';
import { SettingsView } from '@/components/views/settings-view';

function App() {
  const { currentView, setCommandPaletteOpen, setAgents, setProviderConfigs, setTheme, setEditorFontSize } = useAppStore();

  // Load settings, agents, and provider configs on mount
  useEffect(() => {
    const settings = getSettings();
    setTheme(settings.theme);
    setEditorFontSize(settings.editorFontSize);

    // Apply theme
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }

    // Load agents
    const agents = getAgents();
    setAgents(agents);

    // Load provider configs
    const configs = getProviderConfigs();
    setProviderConfigs(configs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'editor':
        return <EditorView />;
      case 'test':
        return <TestRunnerView />;
      case 'deploy':
        return <DeployView />;
      case 'monitor':
        return <MonitorView />;
      case 'templates':
        return <TemplatesView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-bg-root text-text-primary">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

export default App;
