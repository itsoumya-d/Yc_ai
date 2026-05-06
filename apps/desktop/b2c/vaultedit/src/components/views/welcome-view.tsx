import { useAppStore } from '@/stores/app-store';
import { Film, Upload, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';

const recentProjects = [
  { name: 'Product Demo v3', duration: '4:32', resolution: '4K', updated: '2 hours ago' },
  { name: 'Tutorial Ep. 12', duration: '12:45', resolution: '1080p', updated: 'Yesterday' },
  { name: 'Social Clip Pack', duration: '0:58', resolution: '1080p', updated: '3 days ago' },
];

export function WelcomeView() {
  const { setView } = useAppStore();
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-DEFAULT">
          <Film className="h-8 w-8 text-white" />
        </div>
        <h1 className="edit-heading mb-2 text-3xl text-text-primary">Edit with your words</h1>
        <p className="mb-8 text-sm text-text-secondary">AI-powered video editing. Import a video, edit by transcript, and export to any platform.</p>
        <div className="mb-8 grid grid-cols-3 gap-3">
          <button onClick={() => setView('editor')} className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-5 hover:border-primary-DEFAULT">
            <Upload className="h-6 w-6 text-primary-DEFAULT" />
            <span className="text-sm font-medium text-text-primary">Import Video</span>
            <span className="text-xs text-text-tertiary">MP4, MOV, AVI, MKV</span>
          </button>
          <button onClick={() => setView('library')} className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-5 hover:border-accent-DEFAULT">
            <FolderOpen className="h-6 w-6 text-accent-DEFAULT" />
            <span className="text-sm font-medium text-text-primary">Open Project</span>
            <span className="text-xs text-text-tertiary">Resume editing</span>
          </button>
          <button onClick={() => setView('editor')} className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-5 hover:border-primary-light">
            <Sparkles className="h-6 w-6 text-primary-light" />
            <span className="text-sm font-medium text-text-primary">AI Quick Edit</span>
            <span className="text-xs text-text-tertiary">Describe your edits</span>
          </button>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">RECENT PROJECTS</h3>
          <div className="space-y-2">
            {recentProjects.map((p) => (
              <button key={p.name} onClick={() => setView('editor')} className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3 hover:border-primary-DEFAULT">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-muted"><Film className="h-4 w-4 text-primary-light" /></div>
                  <div className="text-left"><div className="text-sm text-text-primary">{p.name}</div><div className="text-xs text-text-tertiary">{p.duration} • {p.resolution}</div></div>
                </div>
                <div className="flex items-center gap-2"><span className="text-xs text-text-tertiary">{p.updated}</span><ArrowRight className="h-4 w-4 text-text-tertiary" /></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
