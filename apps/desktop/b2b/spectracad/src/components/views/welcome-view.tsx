import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { createNewProject, saveProject, formatRelativeDate } from '@/lib/storage';
import { Plus, FolderOpen, Clock, Layers, Cpu, ArrowRight, LayoutGrid } from 'lucide-react';

interface TemplateCard {
  id: string;
  name: string;
  description: string;
  layers: number;
}

const templates: TemplateCard[] = [
  { id: 't1', name: 'Arduino Shield', description: 'Standard 2-layer Arduino shield with headers and prototyping area.', layers: 2 },
  { id: 't2', name: 'ESP32 Base Board', description: 'WiFi + BLE ready with USB-C power and programming.', layers: 2 },
  { id: 't3', name: 'Sensor Breakout', description: 'I2C/SPI sensor breakout with decoupling and pull-ups.', layers: 2 },
  { id: 't4', name: 'USB-C PD Board', description: 'Power delivery negotiation with buck converter output.', layers: 4 },
];

export function WelcomeView() {
  const { projects, addProject, setCurrentProject, setCurrentView } = useAppStore();

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6),
    [projects],
  );

  const handleNewProject = useCallback(() => {
    const project = createNewProject('Untitled Board');
    saveProject(project);
    addProject(project);
    setCurrentProject(project.id, project.name);
  }, [addProject, setCurrentProject]);

  const handleOpenProject = useCallback(
    (id: string, name: string) => {
      setCurrentProject(id, name);
    },
    [setCurrentProject],
  );

  const handleFromTemplate = useCallback(
    (template: TemplateCard) => {
      const project = createNewProject(template.name, template.layers);
      saveProject(project);
      addProject(project);
      setCurrentProject(project.id, project.name);
    },
    [addProject, setCurrentProject],
  );

  return (
    <div className="flex h-full items-center justify-center overflow-auto">
      <div className="w-full max-w-4xl space-y-8 p-8">
        {/* Greeting */}
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">Design, simulate, and manufacture your PCBs with AI assistance.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleNewProject}
            className="flex items-center gap-4 rounded-lg border border-border-default bg-bg-surface p-5 text-left transition-all hover:border-primary hover:shadow-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">New Project</div>
              <div className="text-xs text-text-secondary">Start from scratch with an empty board</div>
            </div>
          </button>

          <button className="flex items-center gap-4 rounded-lg border border-border-default bg-bg-surface p-5 text-left transition-all hover:border-border-emphasis hover:shadow-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <FolderOpen className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">Open Project</div>
              <div className="text-xs text-text-secondary">Open a .scad or .kicad_sch file</div>
            </div>
          </button>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-text-primary">Recent Projects</h2>
            {projects.length > 0 && (
              <button
                onClick={() => setCurrentView('projects')}
                className="text-xs text-text-link hover:underline"
              >
                View All
              </button>
            )}
          </div>
          {recentProjects.length === 0 ? (
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
              <Cpu className="mx-auto mb-2 h-8 w-8 text-text-tertiary" />
              <p className="text-xs text-text-tertiary">No projects yet. Create a new project or use a template to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleOpenProject(project.id, project.name)}
                  className="rounded-lg border border-border-default bg-bg-surface p-4 text-left transition-all hover:border-border-emphasis hover:shadow-2"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-text-primary">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeDate(project.updated_at)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-text-tertiary">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{project.layer_count}L</span>
                    </div>
                    <span>{project.component_count} parts</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Templates */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-text-primary">Templates</h2>
            <button className="text-xs text-text-link hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleFromTemplate(template)}
                className="rounded-lg border border-border-default bg-bg-surface p-3 text-left transition-all hover:border-border-emphasis"
              >
                <div className="mb-1 flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5 text-copper" />
                  <span className="text-xs font-medium text-text-primary">{template.name}</span>
                </div>
                <p className="mb-2 text-[11px] text-text-tertiary line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-tertiary">{template.layers}-layer</span>
                  <ArrowRight className="h-3 w-3 text-text-tertiary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
