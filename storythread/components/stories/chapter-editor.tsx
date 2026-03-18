'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { updateChapter } from '@/lib/actions/chapters';
import { AIWritingPanel } from '@/components/writing/ai-writing-panel';
import { AIWritingAssist } from '@/components/AIWritingAssist';
import { countWords } from '@/lib/utils';
import { Save, Sparkles, ChevronLeft, Maximize2, Minimize2, Loader2, StopCircle } from 'lucide-react';
import type { Chapter, Character } from '@/types/database';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAiStream } from '@/lib/hooks/useAiStream';
import { RichTextEditor } from '@/components/RichTextEditor';

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAI, setShowAI] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { generate, streaming, text: aiText, error: aiError, cancel: cancelAi, reset: resetAi } = useAiStream();

  const wordCount = countWords(content);

  const { status: autoSaveStatus, statusText: autoSaveText } = useAutoSave({
    value: content,
    onSave: async (val) => {
      const formData = new FormData();
      formData.set('title', title);
      formData.set('content', val);
      formData.set('status', status);
      formData.set('notes', notes);
      return await updateChapter(chapter.id, formData);
    },
    delay: 1500,
    skipIf: (val) => val === chapter.content,
  });

  const save = useCallback(async () => {
    setSaving(true);
    setSaveStatus('saving');
    const formData = new FormData();
    formData.set('title', title);
    formData.set('content', content);
    formData.set('status', status);
    formData.set('notes', notes);

    const result = await updateChapter(chapter.id, formData);
    setSaving(false);

    if (result.error) {
      setSaveStatus('idle');
      toast({ title: 'Save failed', description: result.error, variant: 'destructive' });
      return;
    }

    setSaveStatus('saved');
    // Reset to idle after 2s
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [title, content, status, notes, chapter.id, toast]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      save();
    }, 30000);
    return () => clearInterval(interval);
  }, [save]);

  // Focus mode: toggle data-focus-mode on body
  useEffect(() => {
    if (focusMode) {
      document.body.setAttribute('data-focus-mode', 'true');
    } else {
      document.body.removeAttribute('data-focus-mode');
    }
    return () => {
      document.body.removeAttribute('data-focus-mode');
    };
  }, [focusMode]);

  // Exit focus mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);

  function handleInsertAI(text: string) {
    // Append AI text as an HTML paragraph to the rich text content
    setContent((prev) => prev + `<p>${text}</p>`);
  }

  const editorContent = (
    <div className={focusMode ? 'mx-auto max-w-3xl px-6' : 'flex-1'}>
      <div className="mb-4 flex items-center justify-between">
        {focusMode ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--foreground)] opacity-70 truncate max-w-xs">
              {title || 'Untitled Chapter'}
            </span>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => router.push(`/stories/${storyId}`)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Story
          </Button>
        )}
        <div className="flex items-center gap-3">
          {/* Auto-save status indicator */}
          <AutoSaveIndicator status={autoSaveStatus} text={autoSaveText} />
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-xs text-[var(--muted-foreground)]"
              >
                Saving...
              </motion.span>
            )}
            {saveStatus === 'saved' && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-xs text-green-600 dark:text-green-400"
              >
                Saved ✓
              </motion.span>
            )}
            {saveStatus === 'idle' && autoSaveStatus === 'idle' && (
              <motion.span
                key="words"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[var(--muted-foreground)]"
              >
                {wordCount.toLocaleString()} words
              </motion.span>
            )}
          </AnimatePresence>

          {!focusMode && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Chapter['status'])}
              className="rounded-md border border-[var(--input)] bg-[var(--card)] px-2 py-1 text-xs"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          )}

          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>

          {!focusMode && (
            <Button size="sm" variant="outline" onClick={() => setShowAI(!showAI)}>
              <Sparkles className="mr-1.5 h-4 w-4" /> AI
            </Button>
          )}

          <button
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? 'Exit Focus Mode (Esc)' : 'Enter Focus Mode'}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
            aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
          >
            {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Chapter Title"
        className="mb-4 border-0 bg-transparent text-xl font-heading font-bold focus-visible:ring-0"
      />

      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Start writing your chapter..."
        docId={chapter.id}
        className={`writing-editor transition-all duration-300 ${
          focusMode ? 'min-h-[calc(100vh-180px)] shadow-lg' : ''
        }`}
      />

      {!focusMode && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--muted-foreground)]">Chapter Notes</summary>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes about this chapter..."
            className="mt-2 min-h-[80px] w-full rounded-lg border border-[var(--input)] bg-[var(--card)] p-3 text-sm text-[var(--foreground)]"
          />
        </details>
      )}
    </div>
  );

  if (focusMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen bg-[var(--background)] py-8"
      >
        {editorContent}
      </motion.div>
    );
  }

  return (
    <div className="flex gap-6">
      {editorContent}

      {showAI && (
        <div className="w-80 shrink-0 space-y-4">
          <AIWritingPanel
            chapterContent={content}
            storyDescription={storyDescription}
            characters={characters.map((c) => ({ name: c.name, voice_notes: c.voice_notes }))}
            onInsert={handleInsertAI}
          />
          <AIWritingAssist
            content={content}
            storyContext={storyDescription}
            onInsert={handleInsertAI}
          />
          {/* AI Streaming Assist Panel */}
          <div className="rounded-xl border border-[var(--input)] bg-[var(--card)] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-[var(--foreground)]">AI Story Assist</span>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask for help with plot, characters, dialogue, descriptions..."
              rows={3}
              className="w-full resize-none rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => generate(aiPrompt, storyDescription ? `Story context: ${storyDescription}` : undefined)}
                disabled={streaming || !aiPrompt.trim()}
              >
                {streaming ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
              {streaming && (
                <Button size="sm" variant="outline" onClick={cancelAi}>
                  <StopCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            {(aiText || streaming) && (
              <div className="rounded-lg border border-[var(--input)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] whitespace-pre-wrap max-h-60 overflow-y-auto">
                {aiText}
                {streaming && (
                  <span className="inline-block w-0.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            )}
            {aiError && (
              <p className="text-xs text-red-500">{aiError}</p>
            )}
            {aiText && !streaming && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => { handleInsertAI(aiText); resetAi(); setAiPrompt(''); }}
                >
                  Insert into Chapter
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={resetAi}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
