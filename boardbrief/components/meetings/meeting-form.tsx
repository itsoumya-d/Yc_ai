'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createMeeting, updateMeeting } from '@/lib/actions/meetings';
import { generateAgenda } from '@/lib/actions/ai-meetings';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Meeting } from '@/types/database';

interface MeetingFormProps {
  meeting?: Meeting;
}

export function MeetingForm({ meeting }: MeetingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [notes, setNotes] = useState(meeting?.notes ?? '');
  const isEditing = !!meeting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('notes', notes);
    const result = isEditing
      ? await updateMeeting(meeting.id, formData)
      : await createMeeting(formData);
    setLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: isEditing ? 'Meeting updated' : 'Meeting created' });
    if (!isEditing && result.data) {
      router.push(`/meetings/${result.data.id}`);
    } else {
      router.push('/meetings');
    }
  }

  async function handleGenerateAgenda() {
    const form = document.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);
    setAiLoading(true);
    const result = await generateAgenda(
      (formData.get('title') as string) || 'Board Meeting',
      (formData.get('meeting_type') as string) || 'regular',
      notes,
      parseInt(formData.get('duration_minutes') as string) || 60
    );
    setAiLoading(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) setNotes(result.data);
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
            defaultValue={meeting?.title ?? ''}
            placeholder="e.g. Q4 2024 Board Meeting"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Type
            </label>
            <Select
              name="meeting_type"
              defaultValue={meeting?.meeting_type ?? 'regular'}
            >
              <option value="regular">Regular</option>
              <option value="special">Special</option>
              <option value="committee">Committee</option>
              <option value="annual">Annual</option>
            </Select>
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Status
              </label>
              <Select name="status" defaultValue={meeting?.status ?? 'draft'}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </Select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Duration (min)
            </label>
            <Input
              name="duration_minutes"
              type="number"
              defaultValue={meeting?.duration_minutes ?? 60}
              min={15}
              step={15}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Date & Time
            </label>
            <Input
              name="scheduled_at"
              type="datetime-local"
              defaultValue={meeting?.scheduled_at?.slice(0, 16) ?? ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Location
            </label>
            <Input
              name="location"
              defaultValue={meeting?.location ?? ''}
              placeholder="Conference room or address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Video Link
          </label>
          <Input
            name="video_link"
            defaultValue={meeting?.video_link ?? ''}
            placeholder="https://zoom.us/j/..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Notes / Agenda
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerateAgenda}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Generate Agenda
                </>
              )}
            </Button>
          </div>
          <Textarea
            name="notes"
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Meeting agenda, topics to discuss..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Meeting'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
