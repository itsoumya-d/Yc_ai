import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Vote, Building2 } from 'lucide-react';
import type { BoardMember } from '@/types/database';

interface MemberCardProps {
  member: BoardMember;
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <Link href={`/board-members/${member.id}`}>
      <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar name={member.full_name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[var(--foreground)] truncate">
                {member.full_name}
              </h3>
              {!member.is_active && (
                <Badge variant="canceled">Inactive</Badge>
              )}
            </div>
            {member.title && (
              <p className="text-sm text-[var(--muted-foreground)] truncate">
                {member.title}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={member.member_type}>
                {member.member_type.replace('_', ' ')}
              </Badge>
              {member.can_vote && (
                <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  <Vote className="w-3 h-3" />
                  <span>Voting</span>
                </div>
              )}
            </div>
            {member.company && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--muted-foreground)]">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{member.company}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
