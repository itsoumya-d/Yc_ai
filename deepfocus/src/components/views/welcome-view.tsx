import { useAppStore } from '@/stores/app-store';
import { Target, Timer, Shield, Music, ArrowRight } from 'lucide-react';

const features = [
  { icon: Timer, title: 'Smart Timer', description: 'AI-adaptive focus intervals that learn your rhythm' },
  { icon: Shield, title: 'Distraction Blocking', description: 'Context-aware blocking that understands your task' },
  { icon: Music, title: 'Ambient Soundscapes', description: 'Procedural audio matched to your work type' },
];

export function WelcomeView() {
  const { setView } = useAppStore();
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-DEFAULT">
          <Target className="h-8 w-8 text-text-primary" />
        </div>
        <h1 className="focus-heading mb-2 text-3xl text-text-primary">Enter your flow</h1>
        <p className="mb-8 text-sm text-text-secondary">AI-powered deep work environment. Focus longer, block distractions, and build lasting productivity habits.</p>
        <div className="mb-8 space-y-3">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 rounded-lg border border-border-default bg-bg-surface p-4 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
                <f.icon className="h-5 w-5 text-primary-light" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">{f.title}</div>
                <div className="text-xs text-text-tertiary">{f.description}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setView('home')} className="inline-flex items-center gap-2 rounded-lg bg-amber-DEFAULT px-6 py-3 text-sm font-semibold text-bg-root hover:bg-amber-light">
          Start Focusing <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
