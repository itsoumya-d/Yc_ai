import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getProjects } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { Toolbar } from '@/components/layout/toolbar';
import { StatusBar } from '@/components/layout/status-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { ProjectsView } from '@/components/views/projects-view';
import { SchematicView } from '@/components/views/schematic-view';
import { PCBView } from '@/components/views/pcb-view';
import { BOMView } from '@/components/views/bom-view';
import { ExportView } from '@/components/views/export-view';
import { AIPanel } from '@/components/views/ai-panel';
import { SettingsView } from '@/components/views/settings-view';

function renderEditorContent(activeTab: string) {
  switch (activeTab) {
    case 'schematic': return <SchematicView />;
    case 'pcb': return <PCBView />;
    case 'bom': return <BOMView />;
    case 'export': return <ExportView />;
    default: return <SchematicView />;
  }
}

export function App() {
  const { currentView, activeTab, toggleAIPanel, setTheme, setOpenaiApiKey, setProjects, setGridSize } = useAppStore();

  // Load settings + projects from localStorage on mount
  useEffect(() => {
    const s = getSettings();
    setTheme(s.theme);
    setOpenaiApiKey(s.openaiApiKey);
    setGridSize(s.defaultGridSize);

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
  }, [setTheme, setOpenaiApiKey, setProjects, setGridSize]);

  // Global keyboard shortcut: Cmd+/  to toggle AI panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        toggleAIPanel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAIPanel]);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      <TitleBar />

      {currentView === 'editor' && <Toolbar />}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'welcome' && <WelcomeView />}
          {currentView === 'projects' && <ProjectsView />}
          {currentView === 'editor' && renderEditorContent(activeTab)}
          {currentView === 'settings' && <SettingsView />}
        </div>

        {/* AI Panel (overlay on right side when in editor) */}
        {currentView === 'editor' && <AIPanel />}
      </div>

      <StatusBar />
    </div>
  );
}
