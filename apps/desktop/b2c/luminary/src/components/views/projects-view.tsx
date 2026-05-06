import { useState, useMemo, useCallback } from 'react';
import { cn, formatDuration, getGenreLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveProject, deleteProject as deleteProjectStorage, formatRelativeDate } from '@/lib/storage';
import type { Project } from '@/types/database';
import { Search, Plus, Music, Clock, Trash2 } from 'lucide-react';

const genreColors: Record<string, string> = {
  pop: 'bg-coral/15 text-coral',
  lofi: 'bg-accent-muted text-accent-DEFAULT',
  jazz: 'bg-amber-muted text-amber',
  electronic: 'bg-primary-muted text-primary-light',
  hiphop: 'bg-primary-muted text-primary-light',
  rnb: 'bg-coral/15 text-coral',
  rock: 'bg-coral/15 text-coral',
  classical: 'bg-accent-muted text-accent-DEFAULT',
};

export function ProjectsView() {
  const { setView, projects, addProject, removeProject, setActiveProjectId } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const handleNewProject = useCallback(() => {
    const project: Project = {
      id: generateId(),
      name: 'Untitled Project',
      key: 'C',
      mode: 'major',
      bpm: 120,
      genre: 'pop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      duration_sec: 0,
      tracks: 0,
    };
    addProject(project);
    saveProject(project);
    setActiveProjectId(project.id);
    setView('workspace');
  }, [addProject, setActiveProjectId, setView]);

  const handleOpenProject = useCallback((project: Project) => {
    setActiveProjectId(project.id);
    setView('workspace');
  }, [setActiveProjectId, setView]);

  const handleDeleteProject = useCallback((id: string) => {
    removeProject(id);
    deleteProjectStorage(id);
  }, [removeProject]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="music-heading text-lg text-text-primary">Projects</h1>
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
              className="h-9 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-DEFAULT focus:outline-none"
            />
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
              <Music className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">No projects yet</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Create a new project or use a quick start template to begin composing.
            </p>
            <button onClick={handleNewProject} className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group rounded-lg border border-border-default bg-bg-surface text-left transition-colors hover:border-primary-DEFAULT"
              >
                <button onClick={() => handleOpenProject(p)} className="w-full p-5 text-left">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                        <Music className="h-5 w-5 text-primary-light" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{p.name}</div>
                        <div className="text-xs text-text-tertiary">{p.key} {p.mode} {'\u2022'} {p.bpm} BPM</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', genreColors[p.genre] ?? 'bg-bg-surface-raised text-text-tertiary')}>
                      {getGenreLabel(p.genre)}
                    </span>
                    <span className="text-[10px] text-text-tertiary">{formatDuration(p.duration_sec)}</span>
                    <span className="text-[10px] text-text-tertiary">{p.tracks} tracks</span>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[10px] text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    {formatRelativeDate(p.updated_at)}
                  </div>
                </button>
                <div className="flex justify-end px-5 pb-3">
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:text-coral group-hover:opacity-100"
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
