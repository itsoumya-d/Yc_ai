import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getProjects } from '@/lib/storage';
import { Sidebar } from '@/components/layout/sidebar';
import { TitleBar } from '@/components/layout/title-bar';
import { StatusBar } from '@/components/layout/status-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { PipelineView } from '@/components/views/pipeline-view';
import { ExperimentsView } from '@/components/views/experiments-view';
import { ModelsView } from '@/components/views/models-view';
import { DatasetsView } from '@/components/views/datasets-view';
import { GpuView } from '@/components/views/gpu-view';
import { TrainingView } from '@/components/views/training-view';
import { SettingsView } from '@/components/views/settings-view';
import { DeployView } from '@/components/views/deploy-view';
import { TeamView } from '@/components/views/team-view';

function App() {
  const { currentView, setCommandPaletteOpen, setTheme, setOpenaiApiKey, setProjects } = useAppStore();

  // Load settings + projects from localStorage on mount
  useEffect(() => {
    const s = getSettings();
    setTheme(s.theme);
    setOpenaiApiKey(s.openaiApiKey);

    // Apply theme
    if (s.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', s.theme);
    }

    // Load projects
    const projects = getProjects();
    if (projects.length > 0) {
      setProjects(projects);
    }
  }, [setTheme, setOpenaiApiKey, setProjects]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Command palette
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
      case 'welcome':
        return <WelcomeView />;
      case 'pipeline':
        return <PipelineView />;
      case 'experiments':
        return <ExperimentsView />;
      case 'training':
        return <TrainingView />;
      case 'models':
        return <ModelsView />;
      case 'datasets':
        return <DatasetsView />;
      case 'gpu':
        return <GpuView />;
      case 'deploy':
        return <DeployView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <WelcomeView />;
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
