import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { useState, useMemo, useCallback } from 'react';
import { createNewProject, saveProject, deleteProject as deleteProjectFromStorage, formatRelativeDate } from '@/lib/storage';
import type { ProjectStatus } from '@/types/database';
import {
  Plus,
  Upload,
  Search,
  Grid3X3,
  List,
  Clock,
  Layers,
  Cpu,
  FolderOpen,
  Trash2,
  Download,
} from 'lucide-react';

const statusBadge: Record<ProjectStatus, string> = {
  draft: 'bg-bg-surface-hover text-text-tertiary',
  in_progress: 'bg-accent/10 text-accent',
  review: 'bg-warning/10 text-warning',
  manufacturing: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
};

export function ProjectsView() {
  const { projects, addProject, removeProject, setCurrentProject } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('modified');

  const filtered = useMemo(() => {
    let result = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'status') {
      result = [...result].sort((a, b) => a.status.localeCompare(b.status));
    } else {
      result = [...result].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return result;
  }, [projects, searchQuery, sortBy]);

  const handleNewProject = useCallback(() => {
    const project = createNewProject('Untitled Board');
    saveProject(project);
    addProject(project);
    setCurrentProject(project.id, project.name);
  }, [addProject, setCurrentProject]);

  const handleDeleteProject = useCallback(
    (id: string) => {
      deleteProjectFromStorage(id);
      removeProject(id);
    },
    [removeProject],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-lg font-semibold text-text-primary">My Projects</h2>
          <span className="rounded-full bg-bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary">{projects.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewProject}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color hover:bg-primary-active"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-64 rounded-md border border-border-default bg-bg-surface-raised pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded border border-border-default bg-bg-surface px-2 py-1 text-xs text-text-secondary"
            >
              <option value="modified">Last Modified</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="flex rounded-md border border-border-default">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('rounded-l-md p-1.5', viewMode === 'grid' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('rounded-r-md p-1.5', viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Cpu className="mb-3 h-10 w-10 text-text-tertiary" />
            <h3 className="text-sm font-medium text-text-primary">
              {searchQuery ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {searchQuery ? 'Try a different search term.' : 'Create your first project to get started.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleNewProject}
                className="mt-4 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-text-on-color hover:bg-primary-active"
              >
                <Plus className="h-3.5 w-3.5" />
                New Project
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-border-emphasis hover:shadow-2"
              >
                {/* Preview placeholder */}
                <div className="mb-3 flex h-32 items-center justify-center rounded-md bg-bg-surface-raised">
                  <Cpu className="h-8 w-8 text-text-tertiary" />
                </div>

                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-primary">{project.name}</h3>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] capitalize', statusBadge[project.status])}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-3 text-[11px] text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{project.layer_count}L</span>
                  </div>
                  <span>{project.component_count} parts</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeDate(project.updated_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentProject(project.id, project.name)}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color hover:bg-primary-active"
                  >
                    <FolderOpen className="h-3 w-3" />
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="rounded-md border border-border-default p-1.5 text-text-tertiary hover:bg-error/10 hover:text-error"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border-default bg-bg-surface">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Name</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                  <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Layers</th>
                  <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Parts</th>
                  <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Modified</th>
                  <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id} className="border-b border-border-subtle hover:bg-bg-surface-hover">
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setCurrentProject(project.id, project.name)}
                        className="text-sm font-medium text-text-primary hover:text-accent"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] capitalize', statusBadge[project.status])}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-text-secondary">{project.layer_count}L</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-text-secondary">{project.component_count}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-text-tertiary">{formatRelativeDate(project.updated_at)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary" title="Export">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="rounded p-1 text-text-tertiary hover:bg-error/10 hover:text-error"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
