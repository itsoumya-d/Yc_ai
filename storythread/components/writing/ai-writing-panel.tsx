'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { continueStory, suggestDialogue, rephraseText, fixProse } from '@/lib/actions/ai-writing';
import { Sparkles, MessageSquare, RefreshCw, CheckCircle, Copy, Plus } from 'lucide-react';

interface AIWritingPanelProps {
  chapterContent: string;
  storyDescription: string;
  characters: Array<{ name: string; voice_notes: string | null }>;
  onInsert: (text: string) => void;
}

export function AIWritingPanel({ chapterContent, storyDescription, characters, onInsert }: AIWritingPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedChar, setSelectedChar] = useState(characters[0]?.name ?? '');

  async function handleAction(action: string) {
    setLoading(action);
    setResult(null);

    let res;
    switch (action) {
      case 'continue':
        res = await continueStory(
          chapterContent.slice(-1500),
          storyDescription,
          characters.map((c) => c.name).join(', ')
        );
        break;
      case 'dialogue': {
        const char = characters.find((c) => c.name === selectedChar);
        res = await suggestDialogue(
          chapterContent.slice(-500),
          selectedChar,
          char?.voice_notes ?? 'natural dialogue'
        );
        break;
      }
      case 'rephrase':
        res = await rephraseText(chapterContent.slice(-500), 'improve clarity and flow');
        break;
      case 'fix_prose':
        res = await fixProse(chapterContent.slice(-1000));
        break;
    }

    setLoading(null);

    if (res?.error) {
      toast({ title: 'AI Error', description: res.error, variant: 'destructive' });
      return;
    }

    setResult(res?.data ?? null);
  }

  return (
    <Card className="sticky top-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-brand-600" /> AI Writing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleAction('continue')}
          disabled={loading !== null}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {loading === 'continue' ? 'Writing...' : 'Continue Story'}
        </Button>

        <div className="space-y-1.5">
          {characters.length > 0 && (
            <select
              value={selectedChar}
              onChange={(e) => setSelectedChar(e.target.value)}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-2 py-1 text-xs"
            >
              {characters.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleAction('dialogue')}
            disabled={loading !== null}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {loading === 'dialogue' ? 'Generating...' : 'Suggest Dialogue'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleAction('rephrase')}
          disabled={loading !== null}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading === 'rephrase' ? 'Rephrasing...' : 'Rephrase Text'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleAction('fix_prose')}
          disabled={loading !== null}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {loading === 'fix_prose' ? 'Fixing...' : 'Fix Prose'}
        </Button>

        {result && (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3">
            <p className="whitespace-pre-wrap font-prose text-sm text-[var(--foreground)]">{result}</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  onInsert(result);
                  setResult(null);
                }}
              >
                <Plus className="mr-1 h-3 w-3" /> Insert
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast({ title: 'Copied to clipboard' });
                }}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[var(--muted-foreground)]">
          AI suggestions are generated by GPT-4o-mini. Always review before inserting.
        </p>
      </CardContent>
    </Card>
  );
}
