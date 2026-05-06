import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getContracts } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { Sidebar } from '@/components/layout/sidebar';
import { StatusBar } from '@/components/layout/status-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { DashboardView } from '@/components/views/dashboard-view';
import { ContractsView } from '@/components/views/contracts-view';
import { EditorView } from '@/components/views/editor-view';
import { TemplatesView } from '@/components/views/templates-view';
import { ClausesView } from '@/components/views/clauses-view';
import { ObligationsView } from '@/components/views/obligations-view';
import { AnalyticsView } from '@/components/views/analytics-view';
import { TeamView } from '@/components/views/team-view';
import { SettingsView } from '@/components/views/settings-view';

function renderView(view: string) {
  switch (view) {
    case 'welcome': return <WelcomeView />;
    case 'dashboard': return <DashboardView />;
    case 'contracts': return <ContractsView />;
    case 'editor': return <EditorView />;
    case 'templates': return <TemplatesView />;
    case 'clauses': return <ClausesView />;
    case 'obligations': return <ObligationsView />;
    case 'analytics': return <AnalyticsView />;
    case 'team': return <TeamView />;
    case 'settings': return <SettingsView />;
    default: return <WelcomeView />;
  }
}

export function App() {
  const { currentView, searchOpen, setSearchOpen, setOpenaiApiKey, setTheme, setEditorFontSize, setContractFont, setContracts } = useAppStore();
  const showSidebar = currentView !== 'welcome';

  // Load settings + contracts from localStorage on mount
  useEffect(() => {
    const settings = getSettings();
    setOpenaiApiKey(settings.openaiApiKey);
    setTheme(settings.theme);
    setEditorFontSize(settings.editorFontSize);
    setContractFont(settings.contractFont);

    // Apply theme
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }

    // Load contracts into store
    const contracts = getContracts();
    setContracts(contracts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Global keyboard shortcut: Cmd+K to toggle search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

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
