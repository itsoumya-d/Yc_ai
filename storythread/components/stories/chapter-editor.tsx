'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { updateChapter } from '@/lib/actions/chapters';
import { AIWritingPanel } from '@/components/writing/ai-writing-panel';
import { countWords } from '@/lib/utils';
import { Save, Sparkles, ChevronLeft } from 'lucide-react';
import type { Chapter, Character } from '@/types/database';

interface ChapterEditorProps {
  chapter: Chapter;
  storyDescription: string;
  characters: Character[];
  storyId: string;
}

export function ChapterEditor({ chapter, storyDescription, characters, storyId }: ChapterEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [status, setStatus] = useState(chapter.status);
  const [notes, setNotes] = useState(chapter.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const wordCount = countWords(content);

  const save = useCallback(async () => {
    setSaving(true);
    const formData = new FormData();
    formData.set('title', title);
    formData.set('content', content);
    formData.set('status', status);
    formData.set('notes', notes);

    const result = await updateChapter(chapter.id, formData);
    setSaving(false);

    if (result.error) {
      toast({ title: 'Save failed', description: result.error, variant: 'destructive' });
      return;
    }

    setLastSaved(new Date());
  }, [title, content, status, notes, chapter.id, toast]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      save();
    }, 30000);
    return () => clearInterval(interval);
  }, [save]);

  function handleInsertAI(text: string) {
    setContent((prev) => prev + '\n\n' + text);
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/stories/${storyId}`)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Story
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted-foreground)]">
              {wordCount.toLocaleString()} words
              {lastSaved && ` \u00B7 Saved ${lastSaved.toLocaleTimeString()}`}
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Chapter['status'])}
              className="rounded-md border border-[var(--input)] bg-[var(--card)] px-2 py-1 text-xs"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <Button size="sm" onClick={save} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAI(!showAI)}>
              <Sparkles className="mr-1.5 h-4 w-4" /> AI
            </Button>
          </div>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter Title"
          className="mb-4 border-0 bg-transparent text-xl font-heading font-bold focus-visible:ring-0"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your chapter..."
          className="writing-editor w-full resize-none rounded-lg border border-[var(--input)] bg-[var(--card)] p-6 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          onBlur={save}
        />

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--muted-foreground)]">Chapter Notes</summary>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes about this chapter..."
            className="mt-2 min-h-[80px] w-full rounded-lg border border-[var(--input)] bg-[var(--card)] p-3 text-sm text-[var(--foreground)]"
          />
        </details>
      </div>

      {showAI && (
        <div className="w-80 shrink-0">
          <AIWritingPanel
            chapterContent={content}
            storyDescription={storyDescription}
            characters={characters.map((c) => ({ name: c.name, voice_notes: c.voice_notes }))}
            onInsert={handleInsertAI}
          />
        </div>
      )}
    </div>
  );
}
