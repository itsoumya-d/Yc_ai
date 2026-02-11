import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDuration, formatBytes, getStatusColor, getStatusLabel } from '@/lib/utils';
import { generateId, saveProject, deleteProject as deleteProjectStorage, formatRelativeDate } from '@/lib/storage';
import type { Project } from '@/types/database';
import { Film, Search, Plus, Grid3X3, List, Clock, HardDrive, Trash2 } from 'lucide-react';

export function LibraryView() {
  const { setView, projects, addProject, removeProject, setActiveProjectId } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const handleNewProject = useCallback(() => {
    const project: Project = {
      id: generateId(),
      name: 'Untitled Project',
      status: 'draft',
      duration_sec: 0,
      resolution: '1920x1080',
      fps: 30,
      size_bytes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addProject(project);
    saveProject(project);
    setActiveProjectId(project.id);
    setView('editor');
  }, [addProject, setActiveProjectId, setView]);

  const handleOpenProject = useCallback((project: Project) => {
    setActiveProjectId(project.id);
    setView('editor');
  }, [setActiveProjectId, setView]);

  const handleDeleteProject = useCallback((id: string) => {
    removeProject(id);
    deleteProjectStorage(id);
  }, [removeProject]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="edit-heading text-lg text-text-primary">Projects</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-9 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
            />
          </div>
          <div className="flex rounded-md border border-border-default">
            <button onClick={() => setViewMode('grid')} className={cn('p-2', viewMode === 'grid' ? 'bg-bg-surface-raised text-text-primary' : 'text-text-tertiary')}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-2', viewMode === 'list' ? 'bg-bg-surface-raised text-text-primary' : 'text-text-tertiary')}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleNewProject} className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-sm font-medium text-white hover:bg-primary-light">
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface-raised">
              <Film className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">No projects yet</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Import a video or create a new project to get started.
            </p>
            <button onClick={handleNewProject} className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="group rounded-lg border border-border-default bg-bg-surface text-left hover:border-primary-DEFAULT">
                <button onClick={() => handleOpenProject(p)} className="w-full text-left">
                  <div className="flex h-36 items-center justify-center rounded-t-lg bg-bg-surface-raised">
                    <Film className="h-10 w-10 text-text-tertiary" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-text-primary">{p.name}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getStatusColor(p.status))}>
                        {getStatusLabel(p.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(p.duration_sec)}</span>
                      <span>{p.resolution}</span>
                      <span>{p.fps}fps</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-text-tertiary">
                      <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{formatBytes(p.size_bytes)}</span>
                      <span>{formatRelativeDate(p.updated_at)}</span>
                    </div>
                  </div>
                </button>
                <div className="flex justify-end px-4 pb-2">
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:text-playhead group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div key={p.id} className="group flex items-center justify-between rounded-lg border border-border-default bg-bg-surface px-5 py-4 hover:border-primary-DEFAULT">
                <button onClick={() => handleOpenProject(p)} className="flex flex-1 items-center gap-4 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-surface-raised">
                    <Film className="h-5 w-5 text-text-tertiary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{p.name}</div>
                    <div className="mt-0.5 text-xs text-text-tertiary">{p.resolution} {p.fps}fps {formatBytes(p.size_bytes)}</div>
                  </div>
                </button>
                <div className="flex items-center gap-4">
                  <span className="timecode text-xs text-text-secondary">{formatDuration(p.duration_sec)}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getStatusColor(p.status))}>{getStatusLabel(p.status)}</span>
                  <span className="text-xs text-text-tertiary">{formatRelativeDate(p.updated_at)}</span>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:text-playhead group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
