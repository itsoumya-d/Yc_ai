'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createResolution, updateResolution } from '@/lib/actions/resolutions';
import { generateResolutionDraft } from '@/lib/actions/ai-meetings';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Resolution } from '@/types/database';

interface ResolutionFormProps {
  meetingId?: string;
  resolution?: Resolution;
}

export function ResolutionForm({ meetingId, resolution }: ResolutionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [body, setBody] = useState(resolution?.body ?? '');
  const isEditing = !!resolution;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('body', body);
    if (meetingId) {
      formData.set('meeting_id', meetingId);
    }

    const result = isEditing
      ? await updateResolution(resolution.id, formData)
      : await createResolution(formData);
    setLoading(false);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }

    toast({ title: isEditing ? 'Resolution updated' : 'Resolution created' });
    if (!isEditing && result.data) {
      router.push(`/resolutions/${result.data.id}`);
    } else {
      router.push('/resolutions');
    }
  }

  async function handleDraftResolution() {
    const form = document.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);
    const title = (formData.get('title') as string) || '';
    if (!title) {
      toast({ title: 'Enter a title first to generate a draft', variant: 'destructive' });
      return;
    }
    setAiLoading(true);
    const result = await generateResolutionDraft(title, body);
    setAiLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) setBody(result.data);
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Title *
          </label>
          <Input
            name="title"
            required
            defaultValue={resolution?.title ?? ''}
            placeholder="e.g. Approval of Annual Budget"
          />
        </div>

        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Status
              </label>
              <Select
                name="status"
                defaultValue={resolution?.status ?? 'draft'}
              >
                <option value="draft">Draft</option>
                <option value="proposed">Proposed</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="tabled">Tabled</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Votes For
              </label>
              <Input
                name="votes_for"
                type="number"
                min={0}
                defaultValue={resolution?.votes_for ?? 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Votes Against
              </label>
              <Input
                name="votes_against"
                type="number"
                min={0}
                defaultValue={resolution?.votes_against ?? 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Abstentions
              </label>
              <Input
                name="votes_abstain"
                type="number"
                min={0}
                defaultValue={resolution?.votes_abstain ?? 0}
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Resolution Body
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDraftResolution}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Draft Resolution
                </>
              )}
            </Button>
          </div>
          <Textarea
            name="body"
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="WHEREAS... RESOLVED, THAT..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Resolution'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
