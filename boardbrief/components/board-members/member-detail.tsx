'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { deleteBoardMember } from '@/lib/actions/board-members';
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  Vote,
} from 'lucide-react';
import type { BoardMember } from '@/types/database';

interface MemberDetailProps {
  member: BoardMember;
}

export function MemberDetail({ member }: MemberDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Remove this board member?')) return;
    setDeleting(true);
    const result = await deleteBoardMember(member.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Board member removed' });
    router.push('/board-members');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={member.full_name} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                {member.full_name}
              </h1>
              {!member.is_active && (
                <Badge variant="canceled">Inactive</Badge>
              )}
            </div>
            {member.title && (
              <p className="text-[var(--muted-foreground)] mt-0.5">
                {member.title}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={member.member_type}>
                {member.member_type.replace('_', ' ')}
              </Badge>
              {member.can_vote && (
                <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                  <Vote className="w-4 h-4" />
                  <span>Voting Member</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/board-members/${member.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deleting ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
          Contact Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <Mail className="w-4 h-4 text-[var(--muted-foreground)]" />
            <a
              href={`mailto:${member.email}`}
              className="text-navy-800 hover:underline"
            >
              {member.email}
            </a>
          </div>
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
              <a
                href={`tel:${member.phone}`}
                className="text-navy-800 hover:underline"
              >
                {member.phone}
              </a>
            </div>
          )}
          {member.company && (
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Building2 className="w-4 h-4 text-[var(--muted-foreground)]" />
              <span>{member.company}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
          Board Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--muted-foreground)]">Member Type</p>
            <p className="font-medium text-[var(--foreground)] capitalize">
              {member.member_type.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Voting Rights</p>
            <p className="font-medium text-[var(--foreground)]">
              {member.can_vote ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Status</p>
            <p className="font-medium text-[var(--foreground)]">
              {member.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
