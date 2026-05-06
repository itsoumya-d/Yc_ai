import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { formatTimecode } from '@/lib/utils';
import {
  Play, Pause, SkipBack, SkipForward, Volume2,
  Scissors, Type, Wand2, Sparkles, Send,
  Eye, EyeOff, Lock, Unlock, Trash2,
  ZoomIn, ZoomOut, Maximize2,
} from 'lucide-react';
import { useState } from 'react';

const transcriptWords = [
  { text: 'Welcome', start: 0.0, end: 0.4, confidence: 0.99, is_filler: false },
  { text: 'to', start: 0.4, end: 0.5, confidence: 0.99, is_filler: false },
  { text: 'our', start: 0.5, end: 0.7, confidence: 0.98, is_filler: false },
  { text: 'product', start: 0.7, end: 1.1, confidence: 0.97, is_filler: false },
  { text: 'demo.', start: 1.1, end: 1.5, confidence: 0.98, is_filler: false },
  { text: 'Um,', start: 1.8, end: 2.1, confidence: 0.95, is_filler: true },
  { text: 'today', start: 2.1, end: 2.5, confidence: 0.99, is_filler: false },
  { text: "we'll", start: 2.5, end: 2.8, confidence: 0.97, is_filler: false },
  { text: 'show', start: 2.8, end: 3.1, confidence: 0.98, is_filler: false },
  { text: 'you', start: 3.1, end: 3.3, confidence: 0.99, is_filler: false },
  { text: 'the', start: 3.3, end: 3.5, confidence: 0.99, is_filler: false },
  { text: 'new', start: 3.5, end: 3.7, confidence: 0.98, is_filler: false },
  { text: 'features', start: 3.7, end: 4.2, confidence: 0.97, is_filler: false },
  { text: 'we', start: 4.5, end: 4.7, confidence: 0.99, is_filler: false },
  { text: 'have', start: 4.7, end: 4.9, confidence: 0.98, is_filler: false },
  { text: 'been', start: 4.9, end: 5.1, confidence: 0.97, is_filler: false },
  { text: 'working', start: 5.1, end: 5.5, confidence: 0.98, is_filler: false },
  { text: 'on.', start: 5.5, end: 5.8, confidence: 0.99, is_filler: false },
  { text: 'Uh,', start: 6.0, end: 6.3, confidence: 0.94, is_filler: true },
  { text: 'the', start: 6.3, end: 6.5, confidence: 0.99, is_filler: false },
  { text: 'first', start: 6.5, end: 6.8, confidence: 0.98, is_filler: false },
  { text: 'thing', start: 6.8, end: 7.1, confidence: 0.97, is_filler: false },
  { text: 'is', start: 7.1, end: 7.3, confidence: 0.99, is_filler: false },
  { text: 'the', start: 7.3, end: 7.5, confidence: 0.99, is_filler: false },
  { text: 'dashboard.', start: 7.5, end: 8.2, confidence: 0.96, is_filler: false },
];

const tracks = [
  { id: '1', type: 'video' as const, name: 'Video 1', muted: false, locked: false, clips: [{ id: 'v1', start: 0, end: 75, label: 'Main Footage' }] },
  { id: '2', type: 'audio' as const, name: 'Audio 1', muted: false, locked: false, clips: [{ id: 'a1', start: 0, end: 75, label: 'Voiceover' }] },
  { id: '3', type: 'music' as const, name: 'Music', muted: true, locked: false, clips: [{ id: 'm1', start: 5, end: 60, label: 'BG Music' }] },
  { id: '4', type: 'caption' as const, name: 'Captions', muted: false, locked: true, clips: [{ id: 'c1', start: 0, end: 30, label: 'Intro Captions' }, { id: 'c2', start: 35, end: 65, label: 'Demo Captions' }] },
];

const aiSuggestions = [
  { label: 'Remove filler words', description: 'Found 2 filler words (um, uh) that can be removed', type: 'cleanup' as const },
  { label: 'Add jump cuts', description: 'Detect pauses and add jump cuts for tighter pacing', type: 'pacing' as const },
  { label: 'Auto-caption', description: 'Generate styled captions from transcript', type: 'caption' as const },
];

const trackColors: Record<string, string> = {
  video: 'bg-primary-DEFAULT/70',
  audio: 'bg-accent-DEFAULT/70',
  music: 'bg-waveform/60',
  caption: 'bg-warning/60',
};

const totalDuration = 75;

export function EditorView() {
  const { isPlaying, togglePlayback, currentTime, setCurrentTime, aiPanelOpen, toggleAIPanel } = useAppStore();
  const [aiCommand, setAICommand] = useState('');
  const [showFillers, setShowFillers] = useState(true);

  const playheadPercent = (currentTime / totalDuration) * 100;

  return (
    <div className="flex h-full flex-col">
      {/* Top: Preview + Transcript/AI */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Preview */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-2 text-text-tertiary">
              <Maximize2 className="h-12 w-12" />
              <span className="text-sm">Video Preview</span>
              <span className="timecode text-xs">{formatTimecode(currentTime)} / {formatTimecode(totalDuration)}</span>
            </div>
          </div>
          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-4 border-t border-border-default bg-bg-surface px-4 py-2">
            <button className="rounded p-1 text-text-secondary hover:text-text-primary"><SkipBack className="h-4 w-4" /></button>
            <button onClick={togglePlayback} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-DEFAULT text-white hover:bg-primary-light">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <button className="rounded p-1 text-text-secondary hover:text-text-primary"><SkipForward className="h-4 w-4" /></button>
            <span className="timecode text-xs text-text-secondary">{formatTimecode(currentTime)}</span>
            <div className="ml-4 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-text-tertiary" />
              <div className="h-1 w-20 rounded-full bg-bg-surface-raised">
                <div className="h-1 w-3/4 rounded-full bg-accent-DEFAULT" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Transcript / AI */}
        <div className="flex w-80 flex-col border-l border-border-default bg-bg-surface">
          <div className="flex border-b border-border-default">
            <button className={cn('flex-1 py-2.5 text-xs font-medium', !aiPanelOpen ? 'border-b-2 border-primary-DEFAULT text-primary-light' : 'text-text-secondary')} onClick={() => { if (aiPanelOpen) toggleAIPanel(); }}>
              Transcript
            </button>
            <button className={cn('flex-1 py-2.5 text-xs font-medium', aiPanelOpen ? 'border-b-2 border-accent-DEFAULT text-accent-DEFAULT' : 'text-text-secondary')} onClick={() => { if (!aiPanelOpen) toggleAIPanel(); }}>
              AI Assistant
            </button>
          </div>

          {!aiPanelOpen ? (
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-medium text-text-tertiary">TRANSCRIPT</span>
                <button onClick={() => setShowFillers(!showFillers)} className="text-[10px] text-text-tertiary hover:text-text-secondary">
                  {showFillers ? 'Hide' : 'Show'} fillers
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {transcriptWords.map((w, i) => (
                  (!showFillers && w.is_filler) ? null : (
                    <button
                      key={i}
                      onClick={() => setCurrentTime(w.start)}
                      className={cn(
                        'rounded px-1 py-0.5 text-sm transition-colors',
                        w.is_filler ? 'bg-warning/15 text-warning line-through' : 'text-text-primary hover:bg-primary-muted',
                        currentTime >= w.start && currentTime <= w.end && 'bg-primary-muted text-primary-light',
                      )}
                    >
                      {w.text}
                    </button>
                  )
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 overflow-auto p-4 space-y-3">
                <div className="mb-3 text-[10px] font-medium text-text-tertiary">AI SUGGESTIONS</div>
                {aiSuggestions.map((s) => (
                  <div key={s.label} className="rounded-lg border border-border-default bg-bg-surface-raised p-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-accent-DEFAULT" />
                      <span className="text-xs font-medium text-text-primary">{s.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-text-tertiary">{s.description}</p>
                    <button className="mt-2 rounded-md bg-accent-muted px-2.5 py-1 text-[10px] font-medium text-accent-DEFAULT hover:bg-accent-DEFAULT/25">
                      Apply
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border-default p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiCommand}
                    onChange={(e) => setAICommand(e.target.value)}
                    placeholder="Describe an edit..."
                    className="h-9 flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-DEFAULT focus:outline-none"
                  />
                  <button className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-DEFAULT text-white hover:bg-accent-light">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-t border-border-default bg-bg-surface px-4 py-1.5">
        <div className="flex items-center gap-1">
          {[
            { icon: Scissors, label: 'Split' },
            { icon: Trash2, label: 'Delete' },
            { icon: Type, label: 'Text' },
            { icon: Wand2, label: 'Effects' },
          ].map((tool) => (
            <button key={tool.label} className="flex items-center gap-1.5 rounded px-2 py-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <tool.icon className="h-3.5 w-3.5" />
              <span className="text-[10px]">{tool.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded p-1 text-text-tertiary hover:text-text-secondary"><ZoomOut className="h-3.5 w-3.5" /></button>
          <span className="text-[10px] text-text-tertiary">100%</span>
          <button className="rounded p-1 text-text-tertiary hover:text-text-secondary"><ZoomIn className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 border-t border-border-default bg-bg-surface">
        {/* Time Ruler */}
        <div className="relative flex h-6 items-end border-b border-border-default px-14">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="absolute text-[9px] text-text-tertiary" style={{ left: `${(i / 15) * 100}%` }}>
              {formatTimecode(i * 5)}
            </div>
          ))}
          <div className="playhead" style={{ left: `${playheadPercent}%` }} />
        </div>

        {/* Tracks */}
        <div className="overflow-auto" style={{ height: 'calc(100% - 24px)' }}>
          {tracks.map((track) => (
            <div key={track.id} className="flex h-10 items-center border-b border-border-subtle">
              {/* Track Header */}
              <div className="flex w-14 items-center justify-between px-2">
                <span className="text-[9px] text-text-tertiary truncate">{track.name}</span>
                <div className="flex gap-0.5">
                  <button className="text-text-tertiary hover:text-text-secondary">
                    {track.muted ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                  </button>
                  <button className="text-text-tertiary hover:text-text-secondary">
                    {track.locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                  </button>
                </div>
              </div>
              {/* Track Content */}
              <div className="relative flex-1 h-7 mx-1">
                {track.clips.map((clip) => {
                  const left = (clip.start / totalDuration) * 100;
                  const width = ((clip.end - clip.start) / totalDuration) * 100;
                  return (
                    <div
                      key={clip.id}
                      className={cn('absolute top-0 h-full rounded', trackColors[track.type] ?? 'bg-primary-DEFAULT/50')}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-white truncate" style={{ maxWidth: 'calc(100% - 12px)' }}>
                        {clip.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
