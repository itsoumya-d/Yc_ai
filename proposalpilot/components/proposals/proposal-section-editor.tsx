'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createProposalSection, updateProposalSection, deleteProposalSection } from '@/lib/actions/proposal-sections';
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
  const isEditing = !!section;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
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
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Content</label>
          <Textarea name="content" rows={12} defaultValue={section?.content ?? ''} placeholder="Write your section content here..." className="font-mono text-sm" />
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
