'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AIWritingAssistProps {
  content: string;
  storyContext?: string;
  onInsert: (text: string) => void;
}

const ACTIONS = [
  { label: 'Continue', emoji: '✍️', prompt: 'Continue the story naturally from where it left off' },
  { label: 'Rephrase', emoji: '🔄', prompt: 'Rephrase the last paragraph with better prose' },
  { label: 'Add Dialog', emoji: '💬', prompt: 'Add a compelling dialog exchange between characters' },
  { label: 'Describe', emoji: '🎨', prompt: 'Add rich sensory description to the scene' },
];

export function AIWritingAssist({ content, storyContext, onInsert }: AIWritingAssistProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState('');

  const handleAction = async (action: typeof ACTIONS[0]) => {
    setLoading(action.label);
    setSuggestion('');
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action.prompt, content: content.slice(-1000), context: storyContext }),
      });
      const { text } = await res.json();
      setSuggestion(text ?? '');
    } catch {
      setSuggestion('Could not generate suggestion. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-semibold text-[var(--foreground)]">AI Writing Assistant</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => handleAction(a)}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
          >
            {loading === a.label ? <RefreshCw className="h-3 w-3 animate-spin" /> : <span>{a.emoji}</span>}
            {a.label}
          </button>
        ))}
      </div>
      {suggestion && (
        <div className="rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-800 p-3">
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{suggestion}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { onInsert(suggestion); setSuggestion(''); }} className="rounded-lg bg-purple-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-purple-600">
              Insert Text
            </button>
            <button onClick={() => setSuggestion('')} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
