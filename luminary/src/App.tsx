import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getProjects } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { TransportBar } from '@/components/layout/transport-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { WorkspaceView } from '@/components/views/workspace-view';
import { ChordsView } from '@/components/views/chords-view';
import { MelodyView } from '@/components/views/melody-view';
import { ArrangeView } from '@/components/views/arrange-view';
import { MixView } from '@/components/views/mix-view';
import { ProjectsView } from '@/components/views/projects-view';
import { SettingsView } from '@/components/views/settings-view';

function renderView(view: string) {
  switch (view) {
    case 'welcome': return <WelcomeView />;
    case 'workspace': return <WorkspaceView />;
    case 'chords': return <ChordsView />;
    case 'melody': return <MelodyView />;
    case 'arrange': return <ArrangeView />;
    case 'mix': return <MixView />;
    case 'projects': return <ProjectsView />;
    case 'settings': return <SettingsView />;
    default: return <WelcomeView />;
  }
}

export function App() {
  const { currentView, setOpenaiApiKey, setTheme, setProjects } = useAppStore();
  const showTransport = currentView !== 'welcome' && currentView !== 'settings';

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
      <TitleBar />

      <div className="flex-1 overflow-hidden">
        {renderView(currentView)}
      </div>

      {showTransport && <TransportBar />}
    </div>
  );
}
