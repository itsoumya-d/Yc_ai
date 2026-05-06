import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getProjects } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { LibraryView } from '@/components/views/library-view';
import { EditorView } from '@/components/views/editor-view';
import { ExportView } from '@/components/views/export-view';
import { SettingsView } from '@/components/views/settings-view';

function renderView(view: string) {
  switch (view) {
    case 'welcome': return <WelcomeView />;
    case 'library': return <LibraryView />;
    case 'editor': return <EditorView />;
    case 'export': return <ExportView />;
    case 'settings': return <SettingsView />;
    default: return <WelcomeView />;
  }
}

export function App() {
  const { currentView, setOpenaiApiKey, setTheme, setProjects } = useAppStore();
  const showTitleBar = currentView !== 'welcome';

  useEffect(() => {
    // Load settings from localStorage
    const s = getSettings();
    setOpenaiApiKey(s.openaiApiKey);
    setTheme(s.theme);

    // Apply theme to DOM
    if (s.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', s.theme);
    }

    // Load projects from localStorage
    const projects = getProjects();
    if (projects.length > 0) {
      setProjects(projects);
    }
  }, [setOpenaiApiKey, setTheme, setProjects]);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      {showTitleBar && <TitleBar />}

      <div className="flex-1 overflow-hidden">
        {renderView(currentView)}
      </div>
    </div>
  );
}
