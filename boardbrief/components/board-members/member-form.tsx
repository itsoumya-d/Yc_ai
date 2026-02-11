'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createBoardMember, updateBoardMember } from '@/lib/actions/board-members';
import type { BoardMember } from '@/types/database';

interface MemberFormProps {
  member?: BoardMember;
}

export function MemberForm({ member }: MemberFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!member;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    if (!formData.get('can_vote')) {
      formData.set('can_vote', 'false');
    }
    if (isEditing && !formData.get('is_active')) {
      formData.set('is_active', 'false');
    }

    const result = isEditing
      ? await updateBoardMember(member.id, formData)
      : await createBoardMember(formData);
    setLoading(false);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }

    toast({ title: isEditing ? 'Member updated' : 'Member added' });
    if (!isEditing && result.data) {
      router.push(`/board-members/${result.data.id}`);
    } else {
      router.push('/board-members');
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Full Name *
            </label>
            <Input
              name="full_name"
              required
              defaultValue={member?.full_name ?? ''}
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Email *
            </label>
            <Input
              name="email"
              type="email"
              required
              defaultValue={member?.email ?? ''}
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Title
            </label>
            <Input
              name="title"
              defaultValue={member?.title ?? ''}
              placeholder="e.g. Independent Director"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Company
            </label>
            <Input
              name="company"
              defaultValue={member?.company ?? ''}
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Member Type
            </label>
            <Select
              name="member_type"
              defaultValue={member?.member_type ?? 'director'}
            >
              <option value="director">Director</option>
              <option value="chairperson">Chairperson</option>
              <option value="secretary">Secretary</option>
              <option value="treasurer">Treasurer</option>
              <option value="observer">Observer</option>
              <option value="advisor">Advisor</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Phone
            </label>
            <Input
              name="phone"
              type="tel"
              defaultValue={member?.phone ?? ''}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              name="can_vote"
              value="true"
              defaultChecked={member?.can_vote ?? true}
              className="rounded border-[var(--border)]"
            />
            Can Vote
          </label>
          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={member?.is_active ?? true}
                className="rounded border-[var(--border)]"
              />
              Active Member
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Member'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
