import { cn } from '@/lib/utils';
import { Sparkles, Music, Mic, Sliders, LayoutGrid, ArrowRight, Lightbulb } from 'lucide-react';

const suggestions = [
  { type: 'chord' as const, title: 'Try a ii-V-I turnaround', desc: 'Add Dm7 → G7 → Cmaj7 for a jazzy resolution at bar 8', confidence: 92 },
  { type: 'melody' as const, title: 'Melody hook opportunity', desc: 'The chorus could use a stronger melodic hook starting on the 5th', confidence: 87 },
  { type: 'arrangement' as const, title: 'Build energy with layers', desc: 'Add a pad synth in the pre-chorus to create anticipation', confidence: 78 },
  { type: 'mix' as const, title: 'EQ suggestion', desc: 'Cut 300Hz on the vocal to reduce muddiness, boost 3kHz for presence', confidence: 85 },
];

const typeColors = {
  chord: 'bg-chord-major/15 text-chord-major',
  melody: 'bg-primary-muted text-primary-light',
  arrangement: 'bg-amber-muted text-amber',
  mix: 'bg-accent-muted text-accent-DEFAULT',
};

const typeLabels = { chord: 'Chords', melody: 'Melody', arrangement: 'Arrange', mix: 'Mix' };

const projectStats = [
  { label: 'Key', value: 'C major' },
  { label: 'BPM', value: '120' },
  { label: 'Genre', value: 'Pop' },
  { label: 'Duration', value: '3:24' },
  { label: 'Tracks', value: '8' },
  { label: 'Bars', value: '64' },
];

const sections = [
  { name: 'Intro', bars: '1-4', color: 'bg-accent-DEFAULT' },
  { name: 'Verse 1', bars: '5-12', color: 'bg-primary-DEFAULT' },
  { name: 'Pre-Chorus', bars: '13-16', color: 'bg-amber' },
  { name: 'Chorus', bars: '17-24', color: 'bg-coral' },
  { name: 'Verse 2', bars: '25-32', color: 'bg-primary-DEFAULT' },
  { name: 'Chorus 2', bars: '33-40', color: 'bg-coral' },
  { name: 'Bridge', bars: '41-48', color: 'bg-chord-major' },
  { name: 'Final Chorus', bars: '49-56', color: 'bg-coral' },
  { name: 'Outro', bars: '57-64', color: 'bg-accent-DEFAULT' },
];

export function WorkspaceView() {
  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Project Overview */}
        <div className="rounded-lg border border-border-default bg-bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="music-heading text-lg text-text-primary">Midnight Drive</h2>
            <span className="text-xs text-text-tertiary">Last saved 2 min ago</span>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {projectStats.map((s) => (
              <div key={s.label}>
                <div className="text-[10px] text-text-tertiary">{s.label}</div>
                <div className="bpm-display text-sm font-medium text-text-primary">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Song Structure */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">SONG STRUCTURE</h3>
          <div className="flex gap-1 rounded-lg border border-border-default bg-bg-surface p-3">
            {sections.map((s) => (
              <div key={s.name} className="flex-1 text-center">
                <div className={cn('mx-auto mb-1 h-1.5 rounded-full', s.color)} />
                <div className="text-[10px] font-medium text-text-primary">{s.name}</div>
                <div className="text-[9px] text-text-tertiary">{s.bars}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-light" />
            <h3 className="text-xs font-medium text-text-tertiary">AI SUGGESTIONS</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((s, i) => (
              <div key={i} className="group cursor-pointer rounded-lg border border-border-default bg-bg-surface p-4 transition-colors hover:border-primary-DEFAULT">
                <div className="mb-2 flex items-center justify-between">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', typeColors[s.type])}>
                    {typeLabels[s.type]}
                  </span>
                  <span className="text-[10px] text-text-tertiary">{s.confidence}% confident</span>
                </div>
                <div className="text-sm font-medium text-text-primary">{s.title}</div>
                <div className="mt-1 text-xs text-text-tertiary">{s.desc}</div>
                <button className="mt-3 flex items-center gap-1 text-xs text-primary-light opacity-0 group-hover:opacity-100">
                  Apply <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Tools Panel */}
      <div className="w-56 border-l border-border-default bg-bg-surface p-4">
        <h3 className="mb-4 text-xs font-medium text-text-tertiary">QUICK TOOLS</h3>
        <div className="space-y-2">
          {[
            { icon: Music, label: 'Chord Lab', desc: 'Generate progressions' },
            { icon: Mic, label: 'Melody Ideas', desc: 'AI melody suggestions' },
            { icon: LayoutGrid, label: 'Arrangement', desc: 'Song structure' },
            { icon: Sliders, label: 'Mix Check', desc: 'AI mixing tips' },
            { icon: Lightbulb, label: 'Ask AI', desc: 'Production questions' },
          ].map((t) => (
            <button key={t.label} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-bg-surface-raised">
              <t.icon className="h-4 w-4 text-primary-light" />
              <div>
                <div className="text-xs font-medium text-text-primary">{t.label}</div>
                <div className="text-[10px] text-text-tertiary">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
