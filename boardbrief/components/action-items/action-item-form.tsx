'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { createActionItem, updateActionItem } from '@/lib/actions/action-items';
import type { ActionItem } from '@/types/database';

interface ActionItemFormProps {
  meetingId: string;
  item?: ActionItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ActionItemForm({
  meetingId,
  item,
  onSuccess,
  onCancel,
}: ActionItemFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!item;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('meeting_id', meetingId);

    const result = isEditing
      ? await updateActionItem(item.id, formData)
      : await createActionItem(formData);
    setLoading(false);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }

    toast({ title: isEditing ? 'Action item updated' : 'Action item created' });
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Title *
        </label>
        <Input
          name="title"
          required
          defaultValue={item?.title ?? ''}
          placeholder="e.g. Review Q4 financial statements"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Description
        </label>
        <Textarea
          name="description"
          rows={3}
          defaultValue={item?.description ?? ''}
          placeholder="Additional details about this action item..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Status
          </label>
          <Select name="status" defaultValue={item?.status ?? 'pending'}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Priority
          </label>
          <Select name="priority" defaultValue={item?.priority ?? 'medium'}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Assignee
          </label>
          <Input
            name="assignee_name"
            defaultValue={item?.assignee_name ?? ''}
            placeholder="Person responsible"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Due Date
          </label>
          <Input
            name="due_date"
            type="date"
            defaultValue={item?.due_date?.slice(0, 10) ?? ''}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : isEditing
              ? 'Update Item'
              : 'Create Item'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
