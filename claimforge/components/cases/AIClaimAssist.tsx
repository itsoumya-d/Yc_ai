'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAiStream } from '@/lib/hooks/useAiStream';
import { Bot, Loader2, Copy, StopCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface AIClaimAssistProps {
  caseTitle?: string;
  defendantName?: string;
  estimatedFraudAmount?: number;
  jurisdiction?: string;
  status?: string;
}

const PROMPT_PRESETS = [
  { label: 'Fraud Pattern Analysis', prompt: 'Analyze the fraud patterns and identify key evidence needed for this case.' },
  { label: 'Legal Strategy', prompt: 'Outline a legal strategy including relevant statutes and precedents for this fraud case.' },
  { label: 'Settlement Assessment', prompt: 'Assess the likelihood of settlement vs. trial and recommended negotiation strategy.' },
  { label: 'Document Checklist', prompt: 'Generate a comprehensive document collection checklist for discovery in this fraud case.' },
];

export function AIClaimAssist({
  caseTitle,
  defendantName,
  estimatedFraudAmount,
  jurisdiction,
  status,
}: AIClaimAssistProps) {
  const { toast } = useToast();
  const [customPrompt, setCustomPrompt] = useState('');
  const [expanded, setExpanded] = useState(true);
  const { generate, streaming, text: result, error, cancel, reset } = useAiStream();

  const caseContext = [
    caseTitle && `Case: ${caseTitle}`,
    defendantName && `Defendant: ${defendantName}`,
    estimatedFraudAmount && `Estimated Fraud Amount: $${estimatedFraudAmount.toLocaleString()}`,
    jurisdiction && `Jurisdiction: ${jurisdiction}`,
    status && `Status: ${status}`,
  ].filter(Boolean).join('. ');

  async function handlePreset(prompt: string) {
    reset();
    await generate(prompt, caseContext || undefined);
  }

  async function handleCustom() {
    if (!customPrompt.trim()) {
      toast({ title: 'Please enter a question or instruction', variant: 'destructive' });
      return;
    }
    reset();
    await generate(customPrompt, caseContext || undefined);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    toast({ title: 'Copied to clipboard' });
  }

  return (
    <Card className="border border-border-default bg-bg-surface">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-text-primary">AI Case Assistant</span>
          {streaming && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Analyzing
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
      </button>

      {expanded && (
        <div className="border-t border-border-muted px-5 pb-5 pt-4 space-y-4">
          {/* Preset prompts */}
          <div className="grid grid-cols-2 gap-2">
            {PROMPT_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p.prompt)}
                disabled={streaming}
                className="rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-left text-xs font-medium text-text-secondary transition-colors hover:border-border-emphasis hover:text-text-primary disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex gap-2">
            <input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !streaming && handleCustom()}
              placeholder="Ask anything about this case..."
              className="flex-1 h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
            <Button size="sm" onClick={handleCustom} disabled={streaming}>
              {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Ask'}
            </Button>
            {streaming && (
              <Button size="sm" variant="outline" onClick={cancel} title="Stop">
                <StopCircle className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Result */}
          {(result || streaming) && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-text-tertiary">AI Analysis</span>
                {result && !streaming && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-primary"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-border-muted bg-bg-surface-raised p-3 text-xs leading-relaxed text-text-primary whitespace-pre-wrap">
                {result}
                {streaming && (
                  <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle" />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
