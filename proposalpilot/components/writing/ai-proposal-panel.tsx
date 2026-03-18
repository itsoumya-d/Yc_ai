'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useAiStream } from '@/lib/hooks/useAiStream';
import { Sparkles, Loader2, Copy, StopCircle } from 'lucide-react';

interface AIProposalPanelProps {
  clientName?: string;
  industry?: string;
}

export function AIProposalPanel({ clientName, industry }: AIProposalPanelProps) {
  const { toast } = useToast();
  const [brief, setBrief] = useState('');
  const [services, setServices] = useState('');
  const { generate, streaming, text: result, error, cancel, reset } = useAiStream();

  async function handleGenerate() {
    if (!brief.trim()) {
      toast({ title: 'Please enter a client brief', variant: 'destructive' });
      return;
    }
    reset();
    const context = [
      clientName && `Client: ${clientName}`,
      industry && `Industry: ${industry}`,
      services && `Services: ${services}`,
    ].filter(Boolean).join('. ');
    await generate(
      `Write a professional proposal for the following brief: ${brief}. Include executive summary, scope of work, timeline, and pricing outline.`,
      context || undefined,
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    toast({ title: 'Copied to clipboard' });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">AI Proposal Generator</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Client Brief *</label>
          <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="Describe the client's needs, project requirements, goals..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Services Offered</label>
          <Input value={services} onChange={(e) => setServices(e.target.value)} placeholder="e.g. Web Development, UI/UX Design, SEO" />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={streaming} className="flex-1">
            {streaming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Proposal</>}
          </Button>
          {streaming && (
            <Button variant="outline" size="icon" onClick={cancel} title="Stop generation">
              <StopCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {(result || streaming) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--foreground)]">Generated Content</span>
              {result && !streaming && (
                <Button variant="ghost" size="sm" onClick={handleCopy}><Copy className="w-4 h-4 mr-1" />Copy</Button>
              )}
            </div>
            <div className="p-4 bg-[var(--muted)] rounded-lg text-sm whitespace-pre-wrap text-[var(--foreground)] max-h-80 overflow-y-auto">
              {result}
              {streaming && <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
