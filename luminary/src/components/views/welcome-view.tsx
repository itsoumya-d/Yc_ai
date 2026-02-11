import { useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveProject, formatRelativeDate, formatKeyDisplay, QUICK_STARTS } from '@/lib/storage';
import { getGenreLabel } from '@/lib/utils';
import type { Project } from '@/types/database';
import { Music, ArrowRight, Plus } from 'lucide-react';

export function WelcomeView() {
  const { setView, projects, addProject, setActiveProjectId } = useAppStore();

  const recentProjects = projects
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const handleQuickStart = useCallback((qs: typeof QUICK_STARTS[0]) => {
    const project: Project = {
      id: generateId(),
      name: `${qs.label} Project`,
      key: qs.key,
      mode: qs.mode,
      bpm: qs.bpm,
      genre: qs.genre,
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

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-DEFAULT">
          <Music className="h-8 w-8 text-white" />
        </div>

        <h1 className="music-heading mb-2 text-3xl text-text-primary">Your AI music companion</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Get intelligent chord progressions, melody ideas, arrangement suggestions, and mixing tips powered by AI.
        </p>

        {/* Quick Start Templates */}
        <div className="mb-8">
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">QUICK START</h3>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_STARTS.map((qs) => (
              <button
                key={qs.genre}
                onClick={() => handleQuickStart(qs)}
                className="rounded-lg border border-border-default bg-bg-surface p-4 text-left transition-colors hover:border-primary-DEFAULT"
              >
                <div className="text-sm font-medium text-text-primary">{qs.label}</div>
                <div className="mt-1 text-xs text-text-tertiary">{formatKeyDisplay(qs.key, qs.mode)} {'\u2022'} {qs.bpm} BPM</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 ? (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-medium text-text-tertiary">RECENT PROJECTS</h3>
            <div className="space-y-2">
              {recentProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleOpenProject(p)}
                  className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-left transition-colors hover:border-primary-DEFAULT"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-muted">
                      <Music className="h-4 w-4 text-primary-light" />
                    </div>
                    <div>
                      <div className="text-sm text-text-primary">{p.name}</div>
                      <div className="text-xs text-text-tertiary">{formatKeyDisplay(p.key, p.mode)} {'\u2022'} {p.bpm} BPM {'\u2022'} {getGenreLabel(p.genre)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary">{formatRelativeDate(p.updated_at)}</span>
                    <ArrowRight className="h-4 w-4 text-text-tertiary" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button onClick={handleNewProject} className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
