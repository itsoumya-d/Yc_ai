'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { generateProposalSections, generateAndSaveProposalSections } from '@/lib/actions/ai-proposals';
import { Sparkles, Loader2, Plus, CheckCircle } from 'lucide-react';
import type { GeneratedSection } from '@/lib/actions/openai';

interface AIProposalPanelProps {
  clientName?: string;
  industry?: string;
  proposalId?: string;
}

export function AIProposalPanel({ clientName, industry, proposalId }: AIProposalPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [brief, setBrief] = useState('');
  const [services, setServices] = useState('');
  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!brief.trim()) {
      toast({ title: 'Please enter a client brief', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSections([]);
    const res = await generateProposalSections(brief, clientName ?? '', industry ?? '', services);
    setLoading(false);
    if (res.error) {
      toast({ title: res.error, variant: 'destructive' });
      return;
    }
    setSections(res.data ?? []);
  }

  async function handleAddToProposal() {
    if (!proposalId) {
      toast({ title: 'Save the proposal first before adding sections', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const res = await generateAndSaveProposalSections(proposalId, brief, clientName ?? '', industry ?? '', services);
    setSaving(false);
    if (res.error) {
      toast({ title: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: `${res.data?.length ?? 0} sections added to proposal`, variant: 'success' });
    setSections([]);
    router.refresh();
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

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleGenerate} disabled={loading || saving}>
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}
          </Button>
          {sections.length > 0 && proposalId && (
            <Button variant="outline" onClick={handleAddToProposal} disabled={saving || loading}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>
                : <><Plus className="w-4 h-4 mr-2" />Add {sections.length} sections to proposal</>}
            </Button>
          )}
        </div>

        {sections.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium text-[var(--foreground)]">{sections.length} sections generated:</p>
            {sections.map((section, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-[var(--foreground)]">{section.title}</p>
                  <span className="ml-auto text-xs text-[var(--muted-foreground)] capitalize">{section.section_type.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 ml-5">{section.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
