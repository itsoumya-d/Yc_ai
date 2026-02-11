'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { generateProposalSections } from '@/lib/actions/ai-proposals';
import { Sparkles, Loader2, Copy } from 'lucide-react';

interface AIProposalPanelProps {
  clientName?: string;
  industry?: string;
}

export function AIProposalPanel({ clientName, industry }: AIProposalPanelProps) {
  const { toast } = useToast();
  const [brief, setBrief] = useState('');
  const [services, setServices] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!brief.trim()) {
      toast({ title: 'Please enter a client brief', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult('');
    const res = await generateProposalSections(brief, clientName ?? '', industry ?? '', services);
    setLoading(false);
    if (res.error) {
      toast({ title: res.error, variant: 'destructive' });
      return;
    }
    setResult(res.data ?? '');
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
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Proposal</>}
        </Button>
        {result && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--foreground)]">Generated Content</span>
              <Button variant="ghost" size="sm" onClick={handleCopy}><Copy className="w-4 h-4 mr-1" />Copy</Button>
            </div>
            <div className="p-4 bg-[var(--muted)] rounded-lg text-sm whitespace-pre-wrap text-[var(--foreground)]">{result}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
