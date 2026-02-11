import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { createNewProject, saveProject, formatRelativeDate } from '@/lib/storage';
import type { Project, ProjectFramework } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Plus,
  FolderOpen,
  Clock,
  FlaskConical,
  Package,
  DollarSign,
  Cpu,
  Brain,
  Boxes,
  Sparkles,
} from 'lucide-react';

const frameworkIcons: Record<ProjectFramework, React.ComponentType<{ className?: string }>> = {
  pytorch: Cpu,
  tensorflow: Brain,
  jax: Boxes,
  custom: Sparkles,
};

const pipelineTemplates = [
  { id: 'image_classification', name: 'Image Classification', desc: 'ResNet / EfficientNet', icon: '\uD83D\uDDBC\uFE0F', framework: 'pytorch' as ProjectFramework },
  { id: 'text_classification', name: 'Text Classification', desc: 'BERT / RoBERTa', icon: '\uD83D\uDCDD', framework: 'pytorch' as ProjectFramework },
  { id: 'regression', name: 'Tabular Regression', desc: 'XGBoost / LightGBM', icon: '\uD83D\uDCCA', framework: 'custom' as ProjectFramework },
  { id: 'llm_finetune', name: 'LLM Fine-tuning', desc: 'LoRA / QLoRA', icon: '\uD83E\uDD16', framework: 'pytorch' as ProjectFramework },
];

export function WelcomeView() {
  const { projects, addProject, setCurrentProject, setCurrentView } = useAppStore();

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    [projects],
  );

  const handleNewProject = useCallback(() => {
    const project = createNewProject('Untitled Project');
    saveProject(project);
    addProject(project);
    setCurrentProject(project);
    setCurrentView('pipeline');
  }, [addProject, setCurrentProject, setCurrentView]);

  const openProject = useCallback(
    (project: Project) => {
      setCurrentProject(project);
      setCurrentView('pipeline');
    },
    [setCurrentProject, setCurrentView],
  );

  const handleFromTemplate = useCallback(
    (template: typeof pipelineTemplates[0]) => {
      const project = createNewProject(template.name, template.framework, template.desc);
      saveProject(project);
      addProject(project);
      setCurrentProject(project);
      setCurrentView('pipeline');
    },
    [addProject, setCurrentProject, setCurrentView],
  );

  const handleOpenFolder = useCallback(async () => {
    const dir = await window.electronAPI?.selectDirectory();
    if (dir) {
      const project = createNewProject(dir.split('/').pop() || 'Untitled', 'pytorch', null, dir);
      saveProject(project);
      addProject(project);
      setCurrentProject(project);
      setCurrentView('pipeline');
    }
  }, [addProject, setCurrentProject, setCurrentView]);

  return (
    <div className="flex h-full flex-col overflow-auto bg-bg-root p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          <span className="text-gradient">ModelOps</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ship ML models, not infrastructure
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          onClick={handleNewProject}
          className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-primary hover:shadow-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-text-primary">New Project</div>
            <div className="text-xs text-text-secondary">Start from scratch or template</div>
          </div>
        </button>

        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-primary hover:shadow-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-node-data/10">
            <FolderOpen className="h-5 w-5 text-node-data" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-text-primary">Open Project</div>
            <div className="text-xs text-text-secondary">Open existing project folder</div>
          </div>
        </button>
      </div>

      {/* Recent Projects */}
      <div className="mb-8">
        <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Recent Projects
        </h2>
        {recentProjects.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <FlaskConical className="mx-auto mb-2 h-8 w-8 text-text-tertiary" />
            <p className="text-xs text-text-tertiary">No projects yet. Create a new project or use a template to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((project) => {
              const FrameworkIcon = frameworkIcons[project.framework];
              return (
                <button
                  key={project.id}
                  onClick={() => openProject(project)}
                  className="flex w-full items-center justify-between rounded-lg border border-border-default bg-bg-surface p-3 transition-all hover:border-border-strong hover:bg-bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-bg-surface-hover">
                      <FrameworkIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-text-primary">{project.name}</div>
                      <div className="text-xs text-text-tertiary">{project.description || 'No description'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <div className="flex items-center gap-1">
                      <FlaskConical className="h-3 w-3" />
                      <span>{project.experiment_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>{project.model_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${project.total_gpu_cost_usd.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeDate(project.updated_at)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pipeline Templates */}
      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Start from Template
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {pipelineTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleFromTemplate(template)}
              className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-primary hover:bg-bg-surface-hover"
            >
              <span className="text-2xl">{template.icon}</span>
              <div className="text-center">
                <div className="text-xs font-medium text-text-primary">{template.name}</div>
                <div className="text-[10px] text-text-tertiary">{template.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
