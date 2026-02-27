'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  continueStory, continueStoryDramatic, continueStorySubtle, continueStoryAction, continueStoryDialogue,
  suggestDialogue, improveDialogue,
  rephraseText, fixProse, enhanceDescription,
  checkConsistency, detectPlotHoles, analyzeReadability, analyzeTone, analyzePacing,
} from '@/lib/actions/ai-writing';
import { Sparkles, MessageSquare, RefreshCw, CheckCircle, Copy, Plus, ChevronDown, ChevronUp, Search, Feather, X } from 'lucide-react';

interface AIWritingPanelProps {
  chapterContent: string;
  storyDescription: string;
  characters: Array<{ name: string; voice_notes: string | null }>;
  onInsert: (text: string) => void;
}

type SectionKey = 'continue' | 'dialogue' | 'polish' | 'analyze';

interface Result { text: string; insertable: boolean }

export function AIWritingPanel({ chapterContent, storyDescription, characters, onInsert }: AIWritingPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<SectionKey>('continue');
  const [selectedChar, setSelectedChar] = useState(characters[0]?.name ?? '');

  const charList = characters.map((c) => c.name).join(', ');

  async function runAction(key: string, fn: () => Promise<{ data?: string; error?: string } | undefined>, insertable = true) {
    setLoading(key);
    setActiveAction(key);
    setResult(null);

    const res = await fn();
    setLoading(null);

    if (!res || res.error) {
      toast({ title: 'AI Error', description: res?.error ?? 'Unknown error', variant: 'destructive' });
      return;
    }
    setResult({ text: res.data ?? '', insertable });
  }

  const continueButtons = [
    { key: 'continue', label: 'Continue', fn: () => continueStory(chapterContent.slice(-1500), storyDescription, charList) },
    { key: 'dramatic', label: 'Dramatic', fn: () => continueStoryDramatic(chapterContent.slice(-1500), storyDescription, charList) },
    { key: 'subtle', label: 'Subtle', fn: () => continueStorySubtle(chapterContent.slice(-1500), storyDescription, charList) },
    { key: 'action', label: 'Action', fn: () => continueStoryAction(chapterContent.slice(-1500), storyDescription, charList) },
    { key: 'dialogue_cont', label: 'Dialogue', fn: () => continueStoryDialogue(chapterContent.slice(-1500), storyDescription, charList) },
  ];

  function toggleSection(section: SectionKey) {
    setOpenSection((prev) => prev === section ? prev : section);
    setResult(null);
  }

  return (
    <Card className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-brand-600" /> AI Writing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {/* Continue Writing */}
        <SectionToggle
          section="continue"
          open={openSection === 'continue'}
          onToggle={() => toggleSection('continue')}
          icon={<Feather className="h-4 w-4" />}
          label="Continue Writing"
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {continueButtons.map(({ key, label, fn }) => (
              <Button
                key={key}
                variant={activeAction === key ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => runAction(key, fn)}
                disabled={loading !== null}
              >
                {loading === key ? <span className="animate-spin mr-1">⟳</span> : null}
                {label}
              </Button>
            ))}
          </div>
        </SectionToggle>

        {/* Dialogue */}
        <SectionToggle
          section="dialogue"
          open={openSection === 'dialogue'}
          onToggle={() => toggleSection('dialogue')}
          icon={<MessageSquare className="h-4 w-4" />}
          label="Dialogue"
        >
          <div className="space-y-2 pt-2">
            {characters.length > 0 && (
              <select
                value={selectedChar}
                onChange={(e) => setSelectedChar(e.target.value)}
                className="w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-2 py-1.5 text-xs"
              >
                {characters.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            )}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  const char = characters.find((c) => c.name === selectedChar);
                  runAction('dialogue', () => suggestDialogue(chapterContent.slice(-500), selectedChar, char?.voice_notes ?? 'natural'));
                }}
                disabled={loading !== null}
              >
                {loading === 'dialogue' ? '...' : 'Suggest'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => runAction('improve_dialogue', () => improveDialogue(chapterContent.slice(-800)))}
                disabled={loading !== null}
              >
                {loading === 'improve_dialogue' ? '...' : 'Make Natural'}
              </Button>
            </div>
          </div>
        </SectionToggle>

        {/* Edit & Polish */}
        <SectionToggle
          section="polish"
          open={openSection === 'polish'}
          onToggle={() => toggleSection('polish')}
          icon={<RefreshCw className="h-4 w-4" />}
          label="Edit & Polish"
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {[
              { key: 'rephrase', label: 'Rephrase', fn: () => rephraseText(chapterContent.slice(-600), 'improve clarity') },
              { key: 'fix_prose', label: 'Fix Prose', fn: () => fixProse(chapterContent.slice(-1000)) },
              { key: 'enhance', label: 'Add Details', fn: () => enhanceDescription(chapterContent.slice(-600)) },
            ].map(({ key, label, fn }) => (
              <Button
                key={key}
                variant={activeAction === key ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => runAction(key, fn)}
                disabled={loading !== null}
              >
                {loading === key ? '...' : label}
              </Button>
            ))}
          </div>
        </SectionToggle>

        {/* Analyze */}
        <SectionToggle
          section="analyze"
          open={openSection === 'analyze'}
          onToggle={() => toggleSection('analyze')}
          icon={<Search className="h-4 w-4" />}
          label="Analyze"
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {[
              { key: 'consistency', label: 'Check Consistency', fn: () => checkConsistency(chapterContent.slice(-2000), storyDescription) },
              { key: 'plot_holes', label: 'Plot Holes', fn: () => detectPlotHoles(chapterContent.slice(-2000), storyDescription) },
              { key: 'readability', label: 'Readability', fn: () => analyzeReadability(chapterContent.slice(-1000)) },
              { key: 'tone', label: 'Tone', fn: () => analyzeTone(chapterContent.slice(-1000)) },
              { key: 'pacing', label: 'Pacing', fn: () => analyzePacing(chapterContent.slice(-1500)) },
            ].map(({ key, label, fn }) => (
              <Button
                key={key}
                variant={activeAction === key ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => runAction(key, fn, false)}
                disabled={loading !== null}
              >
                {loading === key ? '...' : label}
              </Button>
            ))}
          </div>
        </SectionToggle>

        {/* Result panel */}
        {result && (
          <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">AI Result</span>
              <button onClick={() => setResult(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="whitespace-pre-wrap font-prose text-sm text-[var(--foreground)]">{result.text}</p>
            <div className="mt-3 flex gap-2">
              {result.insertable && (
                <Button size="sm" onClick={() => { onInsert(result.text); setResult(null); }}>
                  <Plus className="mr-1 h-3 w-3" /> Insert
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(result.text); toast({ title: 'Copied to clipboard' }); }}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[var(--muted-foreground)]">
          Powered by GPT-4o-mini. Always review before inserting.
        </p>
      </CardContent>
    </Card>
  );
}

function SectionToggle({
  section, open, onToggle, icon, label, children,
}: {
  section: string;
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)]">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          {icon} {label}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
