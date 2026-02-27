'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createProposalSection, updateProposalSection, deleteProposalSection } from '@/lib/actions/proposal-sections';
import { TemplateVariablePicker } from '@/components/proposals/template-variable-picker';
import { Trash2 } from 'lucide-react';
import type { ProposalSection, SectionType } from '@/types/database';

interface ProposalSectionEditorProps {
  section?: ProposalSection;
  proposalId: string;
}

const sectionTypes: { value: SectionType; label: string }[] = [
  { value: 'executive_summary', label: 'Executive Summary' },
  { value: 'scope', label: 'Scope of Work' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'team', label: 'Team' },
  { value: 'case_studies', label: 'Case Studies' },
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'custom', label: 'Custom' },
];

export function ProposalSectionEditor({ section, proposalId }: ProposalSectionEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(section?.content ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = !!section;

  function handleInsertVariable(token: string) {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => prev + token);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end   = el.selectionEnd   ?? content.length;
    const next  = content.slice(0, start) + token + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.selectionStart = start + token.length;
      el.selectionEnd   = start + token.length;
      el.focus();
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('content', content);
    const result = isEditing
      ? await updateProposalSection(section.id, formData)
      : await createProposalSection(proposalId, formData);
    setLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: isEditing ? 'Section updated' : 'Section added' });
    router.push(`/proposals/${proposalId}`);
  }

  async function handleDelete() {
    if (!section || !confirm('Delete this section?')) return;
    const result = await deleteProposalSection(section.id, proposalId);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Section deleted' });
    router.push(`/proposals/${proposalId}`);
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Section Title *</label>
            <Input name="title" required defaultValue={section?.title ?? ''} placeholder="e.g. Executive Summary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Section Type</label>
            <Select name="section_type" defaultValue={section?.section_type ?? 'custom'}>
              {sectionTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--foreground)]">Content</label>
            <TemplateVariablePicker onInsert={handleInsertVariable} />
          </div>
          <Textarea
            ref={textareaRef}
            name="content"
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your section content here… use 'Insert Variable' to add dynamic fields like {{client_name}}."
            className="font-mono text-sm"
          />
          {content.includes('{{') && (
            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
              Variables in <code className="font-mono">{'{{braces}}'}</code> are replaced with real values when the proposal is sent or exported.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Save Section' : 'Add Section')}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={handleDelete} className="ml-auto text-[var(--destructive)]">
              <Trash2 className="w-4 h-4 mr-1" />Delete
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
