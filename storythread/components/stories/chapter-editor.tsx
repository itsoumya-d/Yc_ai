'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { updateChapter } from '@/lib/actions/chapters';
import { AIWritingPanel } from '@/components/writing/ai-writing-panel';
import { renderMarkdown } from '@/lib/markdown';
import { countWords } from '@/lib/utils';
import {
  Save,
  Sparkles,
  ChevronLeft,
  Bold,
  Italic,
  Heading2,
  Quote,
  Minus,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { Chapter, Character } from '@/types/database';

interface ChapterEditorProps {
  chapter: Chapter;
  storyDescription: string;
  characters: Character[];
  storyId: string;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = 'text'
): string {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end) || placeholder;
  const newValue =
    value.slice(0, start) + before + selected + after + value.slice(end);
  requestAnimationFrame(() => {
    textarea.setSelectionRange(
      start + before.length,
      start + before.length + selected.length
    );
    textarea.focus();
  });
  return newValue;
}

function prependLinePrefix(
  textarea: HTMLTextAreaElement,
  prefix: string
): string {
  const { selectionStart: start, value } = textarea;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineAlreadyPrefixed = value.slice(lineStart).startsWith(prefix);
  const newValue = lineAlreadyPrefixed
    ? value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
    : value.slice(0, lineStart) + prefix + value.slice(lineStart);
  requestAnimationFrame(() => textarea.focus());
  return newValue;
}

export function ChapterEditor({
  chapter,
  storyDescription,
  characters,
  storyId,
}: ChapterEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [status, setStatus] = useState(chapter.status);
  const [notes, setNotes] = useState(chapter.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const wordCount = countWords(content);
  const charCount = content.length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 250));

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

  useEffect(() => {
    const interval = setInterval(save, 30_000);
    return () => clearInterval(interval);
  }, [save]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode) setFocusMode(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [save, focusMode]);

  function handleInsertAI(text: string) {
    setContent((prev) => prev + '\n\n' + text);
  }

  function applyBold() {
    if (!textareaRef.current) return;
    setContent(wrapSelection(textareaRef.current, '**', '**', 'bold text'));
  }
  function applyItalic() {
    if (!textareaRef.current) return;
    setContent(wrapSelection(textareaRef.current, '*', '*', 'italic text'));
  }
  function applyHeading() {
    if (!textareaRef.current) return;
    setContent(prependLinePrefix(textareaRef.current, '## '));
  }
  function applyQuote() {
    if (!textareaRef.current) return;
    setContent(prependLinePrefix(textareaRef.current, '> '));
  }
  function applyHR() {
    if (!textareaRef.current) return;
    const { selectionEnd: end, value } = textareaRef.current;
    setContent(value.slice(0, end) + '\n\n---\n\n' + value.slice(end));
  }

  const toolbar = (
    <div className="flex items-center gap-1 border-b border-[var(--border)] bg-[var(--muted)]/40 px-2 py-1">
      <button
        type="button"
        onClick={applyBold}
        title="Bold"
        className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={applyItalic}
        title="Italic"
        className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={applyHeading}
        title="Heading"
        className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={applyQuote}
        title="Blockquote"
        className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <Quote className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={applyHR}
        title="Scene break"
        className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <div className="mx-2 h-4 w-px bg-[var(--border)]" />

      <button
        type="button"
        onClick={() => setPreviewMode(!previewMode)}
        title={previewMode ? 'Edit' : 'Preview'}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {previewMode ? 'Edit' : 'Preview'}
      </button>
      <button
        type="button"
        onClick={() => setFocusMode(!focusMode)}
        title={focusMode ? 'Exit focus (Esc)' : 'Focus mode'}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        {focusMode ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
        {focusMode ? 'Exit focus' : 'Focus'}
      </button>

      <div className="ml-auto flex items-center gap-3 pr-1 text-xs text-[var(--muted-foreground)]">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{charCount.toLocaleString()} chars</span>
        <span>~{readingMinutes} min read</span>
      </div>
    </div>
  );

  // Focus mode
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
          <span className="max-w-xs truncate text-sm font-medium text-[var(--foreground)]">
            {title || 'Untitled Chapter'}
          </span>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-[var(--muted-foreground)]">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button size="sm" onClick={save} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <button
              type="button"
              onClick={() => setFocusMode(false)}
              title="Exit focus mode (Esc)"
              className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {toolbar}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-8">
            {previewMode ? (
              <div
                className="prose prose-stone dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                autoFocus
                className="w-full min-h-[70vh] resize-none border-0 bg-transparent text-lg leading-8 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
                onBlur={save}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/stories/${storyId}`)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Story
          </Button>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-[var(--muted-foreground)]">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
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
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
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

        <div className="overflow-hidden rounded-lg border border-[var(--input)]">
          {toolbar}
          {previewMode ? (
            <div
              className="writing-editor prose prose-stone dark:prose-invert max-w-none w-full min-h-[60vh] overflow-y-auto bg-[var(--card)] p-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your chapter..."
              className="writing-editor w-full min-h-[60vh] resize-none border-0 bg-[var(--card)] p-6 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
              onBlur={save}
            />
          )}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--muted-foreground)]">
            Chapter Notes
          </summary>
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
